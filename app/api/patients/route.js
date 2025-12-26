import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');
    
    let db;
    try {
      db = getDatabase();
    } catch (dbError) {
      console.error('Database initialization error:', dbError);
      return NextResponse.json(
        { error: 'Database initialization failed', details: dbError.message },
        { status: 500 }
      );
    }
    
    if (patientId) {
      // Get single patient
      const patient = db.prepare(`
        SELECT patient_id, full_name, date_of_birth, phone_number, email, gender, consultation_date, pathology, family_history, allergies, previous_treatments, current_treatment, notes
        FROM patients
        WHERE patient_id = ?
      `).get(patientId);
      
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        );
      }
      
      // Convert snake_case to camelCase and include extended fields
      const formattedPatient = {
        patientId: patient.patient_id,
        fullName: patient.full_name,
        dateOfBirth: patient.date_of_birth,
        phoneNumber: patient.phone_number,
        email: patient.email,
        gender: patient.gender,
        lastVisit: patient.consultation_date || null,
        pathology: patient.pathology || null,
        familyHistory: patient.family_history || null,
        allergies: patient.allergies || null,
        previousTreatments: patient.previous_treatments || null,
        currentTreatment: patient.current_treatment || null,
        notes: patient.notes || null
      };
      
      return NextResponse.json(formattedPatient);
    } else {
      // Get all patients
      const patients = db.prepare(`
        SELECT patient_id, full_name, date_of_birth, phone_number, email, gender, consultation_date, current_treatment
        FROM patients
        ORDER BY full_name
      `).all();
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedPatients = patients.map(patient => ({
        patientId: patient.patient_id,
        fullName: patient.full_name,
        dateOfBirth: patient.date_of_birth,
        phoneNumber: patient.phone_number,
        email: patient.email,
        gender: patient.gender,
        lastVisit: patient.consultation_date || null,
        currentTreatment: patient.current_treatment || null
      }));
      
      return NextResponse.json(formattedPatients);
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    let db;
    try {
      db = getDatabase();
    } catch (dbError) {
      console.error('Database initialization error:', dbError);
      return NextResponse.json(
        { error: 'Database initialization failed', details: dbError.message },
        { status: 500 }
      );
    }
    
    const stmt = db.prepare(`
      INSERT INTO patients (
        patient_id, full_name, date_of_birth, gender, phone_number, email,
        consultation_date, pathology, family_history, allergies, previous_treatments, current_treatment, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      body.patientId,
      body.fullName,
      body.dateOfBirth,
      body.gender,
      body.phoneNumber || null,
      body.email || null,
      body.lastVisit || null,
      body.pathology || null,
      body.familyHistory || null,
      body.allergies || null,
      body.previousTreatments || null,
      body.currentTreatment || null,
      body.notes || null
    );
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE patients 
      SET full_name = ?, date_of_birth = ?, gender = ?, phone_number = ?, email = ?,
          consultation_date = ?, pathology = ?, family_history = ?, allergies = ?, previous_treatments = ?, current_treatment = ?, notes = ?
      WHERE patient_id = ?
    `);
    
    stmt.run(
      body.fullName,
      body.dateOfBirth,
      body.gender,
      body.phoneNumber || null,
      body.email || null,
      body.lastVisit || null,
      body.pathology || null,
      body.familyHistory || null,
      body.allergies || null,
      body.previousTreatments || null,
      body.currentTreatment || null,
      body.notes || null,
      body.patientId
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');
    
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM patients WHERE patient_id = ?');
    const result = stmt.run(patientId);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient', details: error.message },
      { status: 500 }
    );
  }
}