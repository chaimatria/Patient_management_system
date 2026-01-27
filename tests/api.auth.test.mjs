import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET as checkPassword, POST as setPassword, PUT as verifyPassword } from '@/app/api/auth/route';
import { getDatabase, closeDatabase } from '@/lib/db';

function jsonRequest(url, method, body) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Auth API integration', () => {
  const testPassword = 'IntegrationTest#123';

  beforeAll(() => {
    const db = getDatabase();
    // Start with a clean doctor_password table for deterministic tests
    db.prepare('DELETE FROM doctor_password').run();
  });

  afterAll(() => {
    closeDatabase();
  });

  it('should report no password initially', async () => {
    const req = new Request('http://localhost/api/auth');
    const res = await checkPassword(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ passwordExists: false });
  });

  it('should set a new password', async () => {
    const req = jsonRequest('http://localhost/api/auth', 'POST', {
      password: testPassword,
    });
    const res = await setPassword(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ success: true });
  });

  it('should not allow setting a second password without update action', async () => {
    const req = jsonRequest('http://localhost/api/auth', 'POST', {
      password: testPassword,
    });
    const res = await setPassword(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('should verify the correct password', async () => {
    const req = jsonRequest('http://localhost/api/auth', 'PUT', {
      password: testPassword,
    });
    const res = await verifyPassword(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ success: true, authenticated: true });
  });

  it('should reject an incorrect password', async () => {
    const req = jsonRequest('http://localhost/api/auth', 'PUT', {
      password: 'WrongPassword',
    });
    const res = await verifyPassword(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toMatchObject({ authenticated: false });
  });
});


