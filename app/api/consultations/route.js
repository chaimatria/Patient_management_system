import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// GET - Fetch consultations (all or by patient_id)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    
    const db = getDatabase();
    
    let consultations;
    if (patientId) {
      // Get consultations for a specific patient
      consultations = db.prepare(`
        SELECT 
          c.*,
          p.full_name as patient_name
        FROM consultations c
        JOIN patients p ON c.patient_id = p.patient_id
        WHERE c.patient_id = ?
        ORDER BY c.consultation_date DESC, c.created_at DESC
      `).all(patientId);
    } else {
      // Get all consultations
      consultations = db.prepare(`
        SELECT 
          c.*,
          p.full_name as patient_name
        FROM consultations c
        JOIN patients p ON c.patient_id = p.patient_id
        ORDER BY c.consultation_date DESC, c.created_at DESC
      `).all();
    }
    
    return NextResponse.json(consultations);
  } catch (error) {
    console.error('GET Consultations Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultations', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new consultation
export async function POST(request) {
  try {
    const consultationData = await request.json();
    
    // Validate required fields
    if (!consultationData.patientId || !consultationData.consultationDate) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId and consultationDate are required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Verify patient exists
    const patient = db.prepare('SELECT patient_id, full_name FROM patients WHERE patient_id = ?').get(consultationData.patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Get current consultation count for this patient
    const existingCount = db.prepare(`
      SELECT COUNT(*) as count FROM consultations WHERE patient_id = ?
    `).get(consultationData.patientId);
    
    const totalConsultations = (existingCount?.count || 0) + 1;
    
    // Insert consultation
    const insertConsultation = db.prepare(`
      INSERT INTO consultations (
        patient_id, consultation_date, description, last_visit, total_consultations
      ) VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insertConsultation.run(
      consultationData.patientId,
      consultationData.consultationDate,
      consultationData.description || null,
      consultationData.lastVisit || consultationData.consultationDate,
      totalConsultations
    );
    
    // Update patient's consultation_date
    const updatePatient = db.prepare(`
      UPDATE patients SET consultation_date = ? WHERE patient_id = ?
    `);
    updatePatient.run(consultationData.consultationDate, consultationData.patientId);
    
    // Get the created consultation
    const createdConsultation = db.prepare(`
      SELECT 
        c.*,
        p.full_name as patient_name
      FROM consultations c
      JOIN patients p ON c.patient_id = p.patient_id
      WHERE c.consultation_id = ?
    `).get(result.lastInsertRowid);
    
    return NextResponse.json(createdConsultation, { status: 201 });
  } catch (error) {
    console.error('POST Consultation Error:', error);
    return NextResponse.json(
      { error: 'Failed to create consultation', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing consultation
export async function PUT(request) {
  try {
    const consultationData = await request.json();
    
    if (!consultationData.consultationId) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if consultation exists
    const existing = db.prepare('SELECT consultation_id FROM consultations WHERE consultation_id = ?').get(consultationData.consultationId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }
    
    // Update consultation
    const updateConsultation = db.prepare(`
      UPDATE consultations SET
        consultation_date = ?,
        description = ?,
        last_visit = ?
      WHERE consultation_id = ?
    `);
    
    updateConsultation.run(
      consultationData.consultationDate,
      consultationData.description || null,
      consultationData.lastVisit || consultationData.consultationDate,
      consultationData.consultationId
    );

    // Also update patient's consultation_date to keep patient last visit in sync
    const updatePatientConsultationDate = db.prepare(`
      UPDATE patients SET consultation_date = ? WHERE patient_id = (SELECT patient_id FROM consultations WHERE consultation_id = ?)
    `);
    const newDate = consultationData.lastVisit || consultationData.consultationDate;
    if (newDate) {
      updatePatientConsultationDate.run(newDate, consultationData.consultationId);
    }
    
    // Get updated consultation
    const updatedConsultation = db.prepare(`
      SELECT 
        c.*,
        p.full_name as patient_name
      FROM consultations c
      JOIN patients p ON c.patient_id = p.patient_id
      WHERE c.consultation_id = ?
    `).get(consultationData.consultationId);
    
    return NextResponse.json(updatedConsultation);
  } catch (error) {
    console.error('PUT Consultation Error:', error);
    return NextResponse.json(
      { error: 'Failed to update consultation', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a consultation
export async function DELETE(request) {
  try {
    const { consultationId } = await request.json();
    
    if (!consultationId) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if consultation exists
    const existing = db.prepare('SELECT consultation_id FROM consultations WHERE consultation_id = ?').get(consultationId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }
    
    // Delete consultation
    const deleteConsultation = db.prepare('DELETE FROM consultations WHERE consultation_id = ?');
    deleteConsultation.run(consultationId);
    
    return NextResponse.json(
      { message: 'Consultation deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Consultation Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete consultation', details: error.message },
      { status: 500 }
    );
  }
}

