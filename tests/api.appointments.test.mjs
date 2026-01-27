import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET as getAppointments, POST as createAppointment, DELETE as deleteAppointment } from '@/app/api/appointments/route';
import { getDatabase, closeDatabase } from '@/lib/db';

function jsonRequest(url, method, body) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function getFutureDate(daysAhead = 1) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

describe('Appointments API integration', () => {
  let createdAppointmentId;
  const testDate = getFutureDate(1);

  beforeAll(() => {
    getDatabase();
  });

  afterAll(() => {
    const db = getDatabase();
    if (createdAppointmentId) {
      db.prepare('DELETE FROM appointments WHERE appointment_id = ?').run(createdAppointmentId);
    }
    closeDatabase();
  });

  it('should create a new appointment', async () => {
    const req = jsonRequest('http://localhost/api/appointments', 'POST', {
      patientName: 'Integration Test Patient',
      appointmentDate: testDate,
      appointmentTime: '10:00',
      appointmentType: 'Checkup',
      duration: 30,
      status: 'scheduled',
      notes: 'Integration test appointment',
    });

    const res = await createAppointment(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toMatchObject({
      patient_name: 'Integration Test Patient',
      appointment_date: testDate,
      appointment_time: '10:00',
    });
    createdAppointmentId = data.appointment_id;
  });

  it('should fetch appointments for the specific date', async () => {
    const req = new Request(`http://localhost/api/appointments?date=${encodeURIComponent(testDate)}`);
    const res = await getAppointments(req);

    expect(res.status).toBe(200);
    const list = await res.json();
    const found = list.find((apt) => apt.appointment_id === createdAppointmentId);
    expect(found).toBeDefined();
    expect(found.patient_name).toBe('Integration Test Patient');
  });

  it('should delete the appointment', async () => {
    const req = jsonRequest('http://localhost/api/appointments', 'DELETE', {
      appointmentId: createdAppointmentId,
    });
    const res = await deleteAppointment(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ message: 'Appointment deleted successfully' });
  });
});


