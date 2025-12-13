import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// Helper function to format patient data for frontend
function formatPatient(patientRow, pathologyRow, treatmentRow, notesRow, lastConsultation) {
  return {
    id: patientRow.patient_id || Date.now().toString(),
    patientId: patientRow.patient_id,
    fullName: patientRow.full_name,
    dateOfBirth: patientRow.date_of_birth,
    gender: patientRow.gender,
    phoneNumber: patientRow.phone_number || '',
    weight: patientRow.weight,
    height: patientRow.height,
    pathology: pathologyRow?.pathology_name || '',
    familyHistory: pathologyRow?.family_members || '',
    allergies: pathologyRow?.allergies || '',
    previousTreatments: treatmentRow?.previous_treatment || '',
    currentTreatment: treatmentRow?.active_treatment || '',
    notes: notesRow?.note_text || '',
    lastVisit: lastConsultation?.last_visit || patientRow.consultation_date || null,
    createdAt: patientRow.created_at || new Date().toISOString(),
    updatedAt: patientRow.updated_at || null
  };
}

// Get all patients with related data
function getAllPatients() {
  const db = getDatabase();
  
  const patients = db.prepare(`
    SELECT * FROM patients ORDER BY created_at DESC
  `).all();
  
  return patients.map(patient => {
    // Get related data
    const pathology = db.prepare(`
      SELECT * FROM pathologies WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(patient.patient_id);
    
    const treatment = db.prepare(`
      SELECT * FROM treatments WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(patient.patient_id);
    
    const note = db.prepare(`
      SELECT * FROM notes WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(patient.patient_id);
    
    const lastConsultation = db.prepare(`
      SELECT last_visit FROM consultations WHERE patient_id = ? ORDER BY consultation_date DESC LIMIT 1
    `).get(patient.patient_id);
    
    return formatPatient(patient, pathology, treatment, note, lastConsultation);
  });
}

// Get single patient by ID
function getPatientById(patientId) {
  const db = getDatabase();
  
  const patient = db.prepare(`
    SELECT * FROM patients WHERE patient_id = ?
  `).get(patientId);
  
  if (!patient) return null;
  
  const pathology = db.prepare(`
    SELECT * FROM pathologies WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(patientId);
  
  const treatment = db.prepare(`
    SELECT * FROM treatments WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(patientId);
  
  const note = db.prepare(`
    SELECT * FROM notes WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(patientId);
  
  const lastConsultation = db.prepare(`
    SELECT last_visit FROM consultations WHERE patient_id = ? ORDER BY consultation_date DESC LIMIT 1
  `).get(patientId);
  
  return formatPatient(patient, pathology, treatment, note, lastConsultation);
}

// GET - Fetch all patients
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');
    
    if (patientId) {
      // Get single patient
      const patient = getPatientById(patientId);
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(patient);
    }
    
    // Get all patients
    const patients = getAllPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new patient
export async function POST(request) {
  try {
    const newPatient = await request.json();
    
    // Validate required fields
    if (!newPatient.fullName || !newPatient.dateOfBirth || !newPatient.patientId) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, dateOfBirth, and patientId are required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if patient ID already exists
    const existing = db.prepare('SELECT patient_id FROM patients WHERE patient_id = ?').get(newPatient.patientId);
    if (existing) {
      return NextResponse.json(
        { error: 'Patient ID already exists' },
        { status: 409 }
      );
    }
    
    // Insert patient
    const insertPatient = db.prepare(`
      INSERT INTO patients (
        patient_id, full_name, date_of_birth, gender, phone_number, 
        weight, height, consultation_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertPatient.run(
      newPatient.patientId,
      newPatient.fullName,
      newPatient.dateOfBirth,
      newPatient.gender || 'Other',
      newPatient.phoneNumber || null,
      newPatient.weight || null,
      newPatient.height || null,
      newPatient.lastVisit || null
    );
    
    // Insert pathology if provided
    if (newPatient.pathology || newPatient.familyHistory || newPatient.allergies) {
      const insertPathology = db.prepare(`
        INSERT INTO pathologies (patient_id, pathology_name, family_members, allergies)
        VALUES (?, ?, ?, ?)
      `);
      insertPathology.run(
        newPatient.patientId,
        newPatient.pathology || '',
        newPatient.familyHistory || '',
        newPatient.allergies || ''
      );
    }
    
    // Insert treatment if provided
    if (newPatient.previousTreatments || newPatient.currentTreatment) {
      const insertTreatment = db.prepare(`
        INSERT INTO treatments (patient_id, previous_treatment, active_treatment)
        VALUES (?, ?, ?)
      `);
      insertTreatment.run(
        newPatient.patientId,
        newPatient.previousTreatments || '',
        newPatient.currentTreatment || ''
      );
    }
    
    // Insert note if provided
    if (newPatient.notes) {
      const insertNote = db.prepare(`
        INSERT INTO notes (patient_id, note_text)
        VALUES (?, ?)
      `);
      insertNote.run(newPatient.patientId, newPatient.notes);
    }
    
    // Return the created patient
    const createdPatient = getPatientById(newPatient.patientId);
    return NextResponse.json(createdPatient, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create patient', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing patient
export async function PUT(request) {
  try {
    const updatedPatient = await request.json();
    
    if (!updatedPatient.patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if patient exists
    const existing = db.prepare('SELECT patient_id FROM patients WHERE patient_id = ?').get(updatedPatient.patientId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Update patient
    const updatePatient = db.prepare(`
      UPDATE patients SET
        full_name = ?,
        date_of_birth = ?,
        gender = ?,
        phone_number = ?,
        weight = ?,
        height = ?,
        consultation_date = ?
      WHERE patient_id = ?
    `);
    
    updatePatient.run(
      updatedPatient.fullName,
      updatedPatient.dateOfBirth,
      updatedPatient.gender || 'Other',
      updatedPatient.phoneNumber || null,
      updatedPatient.weight || null,
      updatedPatient.height || null,
      updatedPatient.lastVisit || null,
      updatedPatient.patientId
    );
    
    // Update or insert pathology
    const existingPathology = db.prepare('SELECT pathology_id FROM pathologies WHERE patient_id = ?').get(updatedPatient.patientId);
    if (existingPathology) {
      const updatePathology = db.prepare(`
        UPDATE pathologies SET
          pathology_name = ?,
          family_members = ?,
          allergies = ?
        WHERE patient_id = ?
      `);
      updatePathology.run(
        updatedPatient.pathology || '',
        updatedPatient.familyHistory || '',
        updatedPatient.allergies || '',
        updatedPatient.patientId
      );
    } else if (updatedPatient.pathology || updatedPatient.familyHistory || updatedPatient.allergies) {
      const insertPathology = db.prepare(`
        INSERT INTO pathologies (patient_id, pathology_name, family_members, allergies)
        VALUES (?, ?, ?, ?)
      `);
      insertPathology.run(
        updatedPatient.patientId,
        updatedPatient.pathology || '',
        updatedPatient.familyHistory || '',
        updatedPatient.allergies || ''
      );
    }
    
    // Update or insert treatment
    const existingTreatment = db.prepare('SELECT treatment_id FROM treatments WHERE patient_id = ?').get(updatedPatient.patientId);
    if (existingTreatment) {
      const updateTreatment = db.prepare(`
        UPDATE treatments SET
          previous_treatment = ?,
          active_treatment = ?
        WHERE patient_id = ?
      `);
      updateTreatment.run(
        updatedPatient.previousTreatments || '',
        updatedPatient.currentTreatment || '',
        updatedPatient.patientId
      );
    } else if (updatedPatient.previousTreatments || updatedPatient.currentTreatment) {
      const insertTreatment = db.prepare(`
        INSERT INTO treatments (patient_id, previous_treatment, active_treatment)
        VALUES (?, ?, ?)
      `);
      insertTreatment.run(
        updatedPatient.patientId,
        updatedPatient.previousTreatments || '',
        updatedPatient.currentTreatment || ''
      );
    }
    
    // Update or insert note
    const existingNote = db.prepare('SELECT note_id FROM notes WHERE patient_id = ?').get(updatedPatient.patientId);
    if (existingNote) {
      const updateNote = db.prepare(`
        UPDATE notes SET note_text = ? WHERE patient_id = ?
      `);
      updateNote.run(updatedPatient.notes || '', updatedPatient.patientId);
    } else if (updatedPatient.notes) {
      const insertNote = db.prepare(`
        INSERT INTO notes (patient_id, note_text)
        VALUES (?, ?)
      `);
      insertNote.run(updatedPatient.patientId, updatedPatient.notes);
    }
    
    // Return updated patient
    const updated = getPatientById(updatedPatient.patientId);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update patient', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a patient
export async function DELETE(request) {
  try {
    const { patientId } = await request.json();
    
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if patient exists
    const existing = db.prepare('SELECT patient_id FROM patients WHERE patient_id = ?').get(patientId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Delete patient (cascade will handle related records)
    const deletePatient = db.prepare('DELETE FROM patients WHERE patient_id = ?');
    deletePatient.run(patientId);
    
    return NextResponse.json(
      { message: 'Patient deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient', details: error.message },
      { status: 500 }
    );
  }
}