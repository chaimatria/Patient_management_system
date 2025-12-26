import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// GET - Fetch appointments (all or by date range)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const date = searchParams.get('date');
    
    const db = getDatabase();
    
    let appointments;
    if (date) {
      // Get appointments for a specific date
      appointments = db.prepare(`
        SELECT * FROM appointments 
        WHERE appointment_date = ?
        ORDER BY appointment_time ASC
      `).all(date);
    } else if (startDate && endDate) {
      // Get appointments in date range
      appointments = db.prepare(`
        SELECT * FROM appointments 
        WHERE appointment_date BETWEEN ? AND ?
        ORDER BY appointment_date ASC, appointment_time ASC
      `).all(startDate, endDate);
    } else {
      // Get all appointments
      appointments = db.prepare(`
        SELECT * FROM appointments 
        ORDER BY appointment_date DESC, appointment_time DESC
      `).all();
    }
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('GET Appointments Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new appointment
export async function POST(request) {
  try {
    const appointmentData = await request.json();
    
    // Validate required fields
    if (!appointmentData.patientName || !appointmentData.appointmentDate || 
        !appointmentData.appointmentTime || !appointmentData.appointmentType) {
      return NextResponse.json(
        { error: 'Missing required fields: patientName, appointmentDate, appointmentTime, and appointmentType are required' },
        { status: 400 }
      );
    }

    // Validate date/time is not in the past
    const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
    const now = new Date();
    
    if (appointmentDateTime < now) {
      return NextResponse.json(
        { error: 'Cannot create appointments in the past' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check for time conflicts
    const conflictCheck = db.prepare(`
      SELECT appointment_id, patient_name, appointment_time, duration 
      FROM appointments 
      WHERE appointment_date = ? AND status != 'cancelled'
    `).all(appointmentData.appointmentDate);
    
    // Calculate time overlap
    const [newHours, newMinutes] = appointmentData.appointmentTime.split(':').map(Number);
    const newStart = newHours * 60 + newMinutes;
    const newEnd = newStart + parseInt(appointmentData.duration || 30);
    
    for (const apt of conflictCheck) {
      const [aptHours, aptMinutes] = apt.appointment_time.split(':').map(Number);
      const aptStart = aptHours * 60 + aptMinutes;
      const aptEnd = aptStart + parseInt(apt.duration);
      
      if ((newStart >= aptStart && newStart < aptEnd) ||
          (newEnd > aptStart && newEnd <= aptEnd) ||
          (newStart <= aptStart && newEnd >= aptEnd)) {
        return NextResponse.json(
          { 
            error: 'Time conflict detected',
            conflictWith: {
              patientName: apt.patient_name,
              time: apt.appointment_time
            }
          },
          { status: 409 }
        );
      }
    }
    
    // Insert appointment (NO patient_id - just patient_name as text)
    const insertAppointment = db.prepare(`
      INSERT INTO appointments (
        patient_name, appointment_date, appointment_time,
        appointment_type, duration, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertAppointment.run(
      appointmentData.patientName,
      appointmentData.appointmentDate,
      appointmentData.appointmentTime,
      appointmentData.appointmentType,
      appointmentData.duration || 30,
      appointmentData.status || 'scheduled',
      appointmentData.notes || null
    );
    
    // Get the created appointment
    const createdAppointment = db.prepare(`
      SELECT * FROM appointments WHERE appointment_id = ?
    `).get(result.lastInsertRowid);
    
    return NextResponse.json(createdAppointment, { status: 201 });
  } catch (error) {
    console.error('POST Appointment Error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing appointment
export async function PUT(request) {
  try {
    const appointmentData = await request.json();
    
    if (!appointmentData.appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if appointment exists
    const existing = db.prepare('SELECT appointment_id FROM appointments WHERE appointment_id = ?')
      .get(appointmentData.appointmentId);
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Validate date/time is not in the past (unless changing status only)
    if (appointmentData.appointmentDate && appointmentData.appointmentTime) {
      const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
      const now = new Date();
      
      if (appointmentDateTime < now && appointmentData.status !== 'completed' && 
          appointmentData.status !== 'cancelled' && appointmentData.status !== 'no-show') {
        return NextResponse.json(
          { error: 'Cannot reschedule to a past date/time' },
          { status: 400 }
        );
      }
    }
    
    // Update appointment
    const updateAppointment = db.prepare(`
      UPDATE appointments SET
        patient_name = ?,
        appointment_date = ?,
        appointment_time = ?,
        appointment_type = ?,
        duration = ?,
        status = ?,
        notes = ?
      WHERE appointment_id = ?
    `);
    
    updateAppointment.run(
      appointmentData.patientName,
      appointmentData.appointmentDate,
      appointmentData.appointmentTime,
      appointmentData.appointmentType,
      appointmentData.duration || 30,
      appointmentData.status || 'scheduled',
      appointmentData.notes || null,
      appointmentData.appointmentId
    );
    
    // Get updated appointment
    const updatedAppointment = db.prepare(`
      SELECT * FROM appointments WHERE appointment_id = ?
    `).get(appointmentData.appointmentId);
    
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('PUT Appointment Error:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete an appointment
export async function DELETE(request) {
  try {
    const { appointmentId } = await request.json();
    
    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if appointment exists
    const existing = db.prepare('SELECT appointment_id FROM appointments WHERE appointment_id = ?')
      .get(appointmentId);
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Delete appointment
    const deleteAppointment = db.prepare('DELETE FROM appointments WHERE appointment_id = ?');
    deleteAppointment.run(appointmentId);
    
    return NextResponse.json(
      { message: 'Appointment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Appointment Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment', details: error.message },
      { status: 500 }
    );
  }
}