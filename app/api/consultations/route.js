import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const id = searchParams.get('id');

    const db = getDatabase();

    if (id) {
      const row = db.prepare(`
        SELECT consultation_id, patient_id, consultation_date, description, last_visit, total_consultations, created_at, updated_at
        FROM consultations
        WHERE consultation_id = ?
      `).get(id);

      if (!row) return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });

      const formatted = {
        consultationId: row.consultation_id,
        patientId: row.patient_id,
        consultationDate: row.consultation_date,
        description: row.description,
        lastVisit: row.last_visit,
        totalConsultations: row.total_consultations,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      return NextResponse.json(formatted);
    }

    if (patientId) {
      const rows = db.prepare(`
        SELECT consultation_id, patient_id, consultation_date, description, last_visit, total_consultations, created_at, updated_at
        FROM consultations
        WHERE patient_id = ?
        ORDER BY consultation_date DESC
      `).all(patientId);

      const formatted = rows.map(r => ({
        consultationId: r.consultation_id,
        patientId: r.patient_id,
        consultationDate: r.consultation_date,
        description: r.description,
        lastVisit: r.last_visit,
        totalConsultations: r.total_consultations,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      return NextResponse.json(formatted);
    }

    // return all
    const rows = db.prepare(`
      SELECT consultation_id, patient_id, consultation_date, description, last_visit, total_consultations, created_at, updated_at
      FROM consultations
      ORDER BY consultation_date DESC
    `).all();

    const formatted = rows.map(r => ({
      consultationId: r.consultation_id,
      patientId: r.patient_id,
      consultationDate: r.consultation_date,
      description: r.description,
      lastVisit: r.last_visit,
      totalConsultations: r.total_consultations,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json({ error: 'Failed to fetch consultations', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO consultations (patient_id, consultation_date, description, last_visit, total_consultations)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.patientId,
      body.consultationDate || null,
      body.description || null,
      body.lastVisit || null,
      body.totalConsultations || 1
    );

    const created = db.prepare('SELECT * FROM consultations WHERE consultation_id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, consultationId: created.consultation_id }, { status: 201 });
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json({ error: 'Failed to create consultation', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    const stmt = db.prepare(`
      UPDATE consultations SET consultation_date = ?, description = ?, last_visit = ?, total_consultations = ?
      WHERE consultation_id = ?
    `);

    stmt.run(
      body.consultationDate || null,
      body.description || null,
      body.lastVisit || null,
      body.totalConsultations || 1,
      body.consultationId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating consultation:', error);
    return NextResponse.json({ error: 'Failed to update consultation', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const consultationId = body.consultationId;

    if (!consultationId) return NextResponse.json({ error: 'Consultation ID is required' }, { status: 400 });

    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM consultations WHERE consultation_id = ?');
    const result = stmt.run(consultationId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    return NextResponse.json({ error: 'Failed to delete consultation', details: error.message }, { status: 500 });
  }
}
