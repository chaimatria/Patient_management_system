// app/api/patients/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the JSON file where patients are stored
const DATA_FILE = path.join(process.cwd(), 'data', 'patients.json');

// Ensure the data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read patients from JSON file
function readPatients() {
  ensureDataDirectory();
  
  if (!fs.existsSync(DATA_FILE)) {
    // If file doesn't exist, create it with empty array
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }
  
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading patients file:', error);
    return [];
  }
}

// Write patients to JSON file
function writePatients(patients) {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(patients, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing patients file:', error);
    return false;
  }
}

// GET - Fetch all patients
export async function GET(request) {
  try {
    const patients = readPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
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
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const patients = readPatients();
    
    // Check if patient ID already exists
    const existingPatient = patients.find(p => p.patientId === newPatient.patientId);
    if (existingPatient) {
      return NextResponse.json(
        { error: 'Patient ID already exists' },
        { status: 409 }
      );
    }
    
    // Add unique ID and timestamp
    const patientToAdd = {
      ...newPatient,
      id: newPatient.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastVisit: newPatient.lastVisit || new Date().toISOString().split('T')[0]
    };
    
    patients.push(patientToAdd);
    
    const success = writePatients(patients);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save patient' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(patientToAdd, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
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
    
    const patients = readPatients();
    const index = patients.findIndex(p => p.patientId === updatedPatient.patientId);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Update the patient while preserving createdAt
    patients[index] = {
      ...updatedPatient,
      createdAt: patients[index].createdAt,
      updatedAt: new Date().toISOString()
    };
    
    const success = writePatients(patients);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update patient' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(patients[index]);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
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
    
    const patients = readPatients();
    const filteredPatients = patients.filter(p => p.patientId !== patientId);
    
    if (patients.length === filteredPatients.length) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    const success = writePatients(filteredPatients);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete patient' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Patient deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}