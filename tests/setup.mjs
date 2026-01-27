import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Runs before each test file (via vitest setupFiles).
// We force the app to use an isolated SQLite DB file so integration tests
// never touch the real `data/medical_db.sqlite`.
const dir = path.join(os.tmpdir(), 'patient-management-system-tests');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// One DB file per Vitest worker so test files can run in parallel safely.
const workerId = process.env.VITEST_POOL_ID || process.env.VITEST_WORKER_ID || '0';
const dbPath = path.join(dir, `medical_db.test.worker-${workerId}.sqlite`);

process.env.NODE_ENV = 'test';
process.env.DB_PATH = dbPath;

// Best-effort cleanup at the start of the worker.
try {
  fs.rmSync(dbPath, { force: true });
  fs.rmSync(`${dbPath}-shm`, { force: true });
  fs.rmSync(`${dbPath}-wal`, { force: true });
} catch {
  // ignore
}


