import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { POST as createPatient, GET as getPatients, DELETE as deletePatient } from '@/app/api/patients/route';
import { getDatabase, closeDatabase } from '@/lib/db';

function jsonRequest(url, method, body) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Patients API integration', () => {
  const testPatientId = `test-patient-${Date.now()}`;

  beforeAll(() => {
    // Ensure DB is initialized before tests
    getDatabase();
  });

  afterAll(() => {
    // Clean up any leftover test data and close DB
    const db = getDatabase();
    db.prepare('DELETE FROM patients WHERE patient_id LIKE ?').run('test-patient-%');
    closeDatabase();
  });

  it('should create a new patient', async () => {
    const req = jsonRequest('http://localhost/api/patients', 'POST', {
      patientId: testPatientId,
      fullName: 'Test Patient',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      phoneNumber: '123456789',
      email: 'test@example.com',
      lastVisit: null,
      pathology: 'Flu',
      familyHistory: 'None',
      allergies: 'None',
      previousTreatments: 'None',
      currentTreatment: 'Rest',
      notes: 'Integration test patient',
    });

    const res = await createPatient(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toMatchObject({ success: true });
  });

  it('should fetch the created patient by id', async () => {
    const req = new Request(`http://localhost/api/patients?id=${encodeURIComponent(testPatientId)}`);
    const res = await getPatients(req);

    expect(res.status).toBe(200);
    const patient = await res.json();
    expect(patient).toMatchObject({
      patientId: testPatientId,
      fullName: 'Test Patient',
      email: 'test@example.com',
    });
  });

  it('should delete the created patient', async () => {
    const req = new Request(`http://localhost/api/patients?id=${encodeURIComponent(testPatientId)}`, {
      method: 'DELETE',
    });
    const res = await deletePatient(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ success: true });
  });
});


