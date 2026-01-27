import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// GET - Fetch all medications from library
export async function GET(request) {
  try {
    const db = getDatabase();
    
    const medications = db.prepare(`
      SELECT * FROM medications_library 
      ORDER BY usage_count DESC, drug_name ASC
    `).all();
    
    return NextResponse.json(medications);
  } catch (error) {
    console.error('GET Medications Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medications', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add new medication to library (auto-called when doctor uses new medication)
export async function POST(request) {
  try {
    const medicationData = await request.json();
    
    if (!medicationData.drugName) {
      return NextResponse.json(
        { error: 'Drug name is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if medication already exists (case-insensitive)
    const existing = db.prepare(
      'SELECT medication_lib_id FROM medications_library WHERE LOWER(drug_name) = LOWER(?)'
    ).get(medicationData.drugName);
    
    if (existing) {
      // Already exists, just return success
      return NextResponse.json({ 
        message: 'Medication already exists',
        medicationId: existing.medication_lib_id 
      });
    }
    
    // Insert new medication to library
    const insertMedication = db.prepare(`
      INSERT INTO medications_library (
        drug_name, 
        common_dosages, 
        common_instructions, 
        typical_duration,
        category,
        usage_count
      ) VALUES (?, ?, ?, ?, ?, 0)
    `);
    
    const result = insertMedication.run(
      medicationData.drugName,
      medicationData.commonDosages || null,
      medicationData.commonInstructions || null,
      medicationData.typicalDuration || null,
      medicationData.category || 'Custom'
    );
    
    const created = db.prepare(
      'SELECT * FROM medications_library WHERE medication_lib_id = ?'
    ).get(result.lastInsertRowid);
    
    console.log('New medication added to library:', created.drug_name);
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST Medication Error:', error);
    return NextResponse.json(
      { error: 'Failed to add medication', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update medication usage count (auto-increments when prescribed)
export async function PUT(request) {
  try {
    const { drugName } = await request.json();
    
    if (!drugName) {
      return NextResponse.json(
        { error: 'Drug name is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Try to increment usage count (case-insensitive)
    const result = db.prepare(`
      UPDATE medications_library 
      SET usage_count = usage_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(drug_name) = LOWER(?)
    `).run(drugName);
    
    // If medication doesn't exist in library, create it
    if (result.changes === 0) {
      db.prepare(`
        INSERT INTO medications_library (
          drug_name, 
          usage_count, 
          category
        ) VALUES (?, 1, 'Custom')
      `).run(drugName);
      
      console.log('New medication auto-added to library:', drugName);
    } else {
      console.log('Usage count incremented for:', drugName);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT Medication Error:', error);
    return NextResponse.json(
      { error: 'Failed to update medication', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove medication from library (optional)
export async function DELETE(request) {
  try {
    const { medicationId } = await request.json();
    
    if (!medicationId) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    db.prepare(
      'DELETE FROM medications_library WHERE medication_lib_id = ?'
    ).run(medicationId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Medication Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete medication', details: error.message },
      { status: 500 }
    );
  }
}