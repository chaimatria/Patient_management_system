import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// GET - Fetch prescriptions (all or by patient_id)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const prescriptionId = searchParams.get('id');
    
    const db = getDatabase();
    
    if (prescriptionId) {
      // Get single prescription with medications
      const prescription = db.prepare(`
        SELECT p.*, pt.full_name as patient_name
        FROM prescriptions p
        LEFT JOIN patients pt ON p.patient_id = pt.patient_id
        WHERE p.prescription_id = ?
      `).get(prescriptionId);
      
      if (!prescription) {
        return NextResponse.json(
          { error: 'Prescription not found' },
          { status: 404 }
        );
      }
      
      // Get medications for this prescription - FIXED TABLE NAME
      const medications = db.prepare(`
        SELECT * FROM medications
        WHERE prescription_id = ?
        ORDER BY medication_order
      `).all(prescriptionId);
      
      prescription.medications = medications;
      
      return NextResponse.json(prescription);
    } else if (patientId) {
      // Get prescriptions for a specific patient
      console.log('Fetching prescriptions for patient:', patientId);
      
      const prescriptions = db.prepare(`
        SELECT p.*, pt.full_name as patient_name
        FROM prescriptions p
        LEFT JOIN patients pt ON p.patient_id = pt.patient_id
        WHERE p.patient_id = ?
        ORDER BY p.prescription_date DESC, p.created_at DESC
      `).all(patientId);
      
      console.log(`Found ${prescriptions.length} prescriptions for patient ${patientId}`);
      
      // Get medications for each prescription - FIXED TABLE NAME
      for (const prescription of prescriptions) {
        const medications = db.prepare(`
          SELECT * FROM medications
          WHERE prescription_id = ?
          ORDER BY medication_order
        `).all(prescription.prescription_id);
        prescription.medications = medications;
        console.log(`Prescription ${prescription.prescription_id} has ${medications.length} medications`);
      }
      
      return NextResponse.json(prescriptions);
    } else {
      // Get all prescriptions
      const prescriptions = db.prepare(`
        SELECT p.*, pt.full_name as patient_name
        FROM prescriptions p
        LEFT JOIN patients pt ON p.patient_id = pt.patient_id
        ORDER BY p.prescription_date DESC, p.created_at DESC
      `).all();
      
      return NextResponse.json(prescriptions);
    }
  } catch (error) {
    console.error('GET Prescriptions Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new prescription
export async function POST(request) {
  try {
    const prescriptionData = await request.json();
    
    // Validate required fields
    if (!prescriptionData.medications || prescriptionData.medications.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: medications are required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // If patient_id is provided, verify patient exists
    if (prescriptionData.patientId) {
      const patient = db.prepare('SELECT patient_id, full_name FROM patients WHERE patient_id = ?')
        .get(prescriptionData.patientId);
      
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        );
      }
    }
    
    // Insert prescription (patient_id can be NULL for manual entries)
    const insertPrescription = db.prepare(`
      INSERT INTO prescriptions (
        patient_id, prescription_date, doctor_name, doctor_specialty,
        doctor_order_number, clinic_name, clinic_address, clinic_phone, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertPrescription.run(
      prescriptionData.patientId || null,
      prescriptionData.prescriptionDate || new Date().toISOString(),
      prescriptionData.doctorName || 'Dr. Bendounan Djilali',
      prescriptionData.doctorSpecialty || 'Cardiologue',
      prescriptionData.doctorOrderNumber || '00152017',
      prescriptionData.clinicName || 'DocLink Clinic',
      prescriptionData.clinicAddress || 'Alger',
      prescriptionData.clinicPhone || '0552265120',
      prescriptionData.notes || null
    );
    
    const prescriptionId = result.lastInsertRowid;
    
    console.log(`Created prescription with ID: ${prescriptionId} for patient: ${prescriptionData.patientId || 'manual entry'}`);
    
    // Insert medications - FIXED TABLE NAME
    const insertMedication = db.prepare(`
      INSERT INTO medications (
        prescription_id, medication_order, drug_name, dosage,
        instructions, duration, quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    let medicationCount = 0;
    prescriptionData.medications.forEach((med, index) => {
      if (med.drugName || med.dosage || med.instructions) {
        insertMedication.run(
          prescriptionId,
          index + 1,
          med.drugName || '',
          med.dosage || '',
          med.instructions || '',
          med.duration || null,
          med.quantity || null
        );
        medicationCount++;
      }
    });
    
    console.log(`Added ${medicationCount} medications to prescription ${prescriptionId}`);
    
    // Get the created prescription with medications
    const createdPrescription = db.prepare(`
      SELECT p.*, pt.full_name as patient_name
      FROM prescriptions p
      LEFT JOIN patients pt ON p.patient_id = pt.patient_id
      WHERE p.prescription_id = ?
    `).get(prescriptionId);
    
    // FIXED TABLE NAME
    const medications = db.prepare(`
      SELECT * FROM medications
      WHERE prescription_id = ?
      ORDER BY medication_order
    `).all(prescriptionId);
    
    createdPrescription.medications = medications;
    
    console.log(`Returning prescription with ${medications.length} medications`);
    
    return NextResponse.json(createdPrescription, { status: 201 });
  } catch (error) {
    console.error('POST Prescription Error:', error);
    return NextResponse.json(
      { error: 'Failed to create prescription', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing prescription
export async function PUT(request) {
  try {
    const prescriptionData = await request.json();
    
    if (!prescriptionData.prescriptionId) {
      return NextResponse.json(
        { error: 'Prescription ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if prescription exists
    const existing = db.prepare('SELECT prescription_id FROM prescriptions WHERE prescription_id = ?')
      .get(prescriptionData.prescriptionId);
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }
    
    // Update prescription
    const updatePrescription = db.prepare(`
      UPDATE prescriptions SET
        prescription_date = ?,
        doctor_name = ?,
        doctor_specialty = ?,
        doctor_order_number = ?,
        clinic_name = ?,
        clinic_address = ?,
        clinic_phone = ?,
        notes = ?
      WHERE prescription_id = ?
    `);
    
    updatePrescription.run(
      prescriptionData.prescriptionDate,
      prescriptionData.doctorName,
      prescriptionData.doctorSpecialty,
      prescriptionData.doctorOrderNumber || '00152017',
      prescriptionData.clinicName,
      prescriptionData.clinicAddress,
      prescriptionData.clinicPhone,
      prescriptionData.notes || null,
      prescriptionData.prescriptionId
    );
    
    // Delete existing medications - FIXED TABLE NAME
    db.prepare('DELETE FROM medications WHERE prescription_id = ?')
      .run(prescriptionData.prescriptionId);
    
    // Insert updated medications - FIXED TABLE NAME
    const insertMedication = db.prepare(`
      INSERT INTO medications (
        prescription_id, medication_order, drug_name, dosage,
        instructions, duration, quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    if (prescriptionData.medications && prescriptionData.medications.length > 0) {
      prescriptionData.medications.forEach((med, index) => {
        if (med.drugName || med.dosage || med.instructions) {
          insertMedication.run(
            prescriptionData.prescriptionId,
            index + 1,
            med.drugName || '',
            med.dosage || '',
            med.instructions || '',
            med.duration || null,
            med.quantity || null
          );
        }
      });
    }
    
    // Get updated prescription with medications
    const updatedPrescription = db.prepare(`
      SELECT p.*, pt.full_name as patient_name
      FROM prescriptions p
      LEFT JOIN patients pt ON p.patient_id = pt.patient_id
      WHERE p.prescription_id = ?
    `).get(prescriptionData.prescriptionId);
    
    // FIXED TABLE NAME
    const medications = db.prepare(`
      SELECT * FROM medications
      WHERE prescription_id = ?
      ORDER BY medication_order
    `).all(prescriptionData.prescriptionId);
    
    updatedPrescription.medications = medications;
    
    return NextResponse.json(updatedPrescription);
  } catch (error) {
    console.error('PUT Prescription Error:', error);
    return NextResponse.json(
      { error: 'Failed to update prescription', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a prescription
export async function DELETE(request) {
  try {
    const { prescriptionId } = await request.json();
    
    if (!prescriptionId) {
      return NextResponse.json(
        { error: 'Prescription ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if prescription exists
    const existing = db.prepare('SELECT prescription_id FROM prescriptions WHERE prescription_id = ?')
      .get(prescriptionId);
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }
    
    // Delete prescription (medications will be deleted by CASCADE)
    const deletePrescription = db.prepare('DELETE FROM prescriptions WHERE prescription_id = ?');
    deletePrescription.run(prescriptionId);
    
    console.log(`Deleted prescription ${prescriptionId}`);
    
    return NextResponse.json(
      { message: 'Prescription deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Prescription Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete prescription', details: error.message },
      { status: 500 }
    );
  }
}