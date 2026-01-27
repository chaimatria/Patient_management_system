# Patient Management System (Next.js + Electron + SQLite)

A desktop-ready patient management system built with **Next.js App Router**, packaged via **Electron**, and backed by **SQLite** (`better-sqlite3`).

## Features

- **Patients**: CRUD, profile view
- **Appointments**: scheduling + conflict detection
- **Consultations**: patient-linked consultation history
- **Prescriptions & medications**: prescription creation and print view
- **Dashboard & reports**: key stats and trends
- **Authentication**: local password + email-based reset flow

## Tech stack

- **UI**: Next.js 16 (App Router), React 19, Tailwind
- **Desktop**: Electron
- **Database**: SQLite (`better-sqlite3`)
- **Testing**: Vitest integration tests for API routes

## Getting started

Install dependencies:

```bash
npm install
```

Run the app (Next.js + Electron):

```bash
npm run dev
```

Run Next.js only:

```bash
npm run dev:next
```

## Database

- In development (non-Electron), the DB file is created in `data/medical_db.sqlite`.
- In Electron, it is created inside Electron user data.

The database schema is created automatically on first run by `lib/db.js`.

## Environment variables

See `EMAIL_SETUP.md` for SMTP + password reset email setup. At minimum, create `.env.local` if you want password reset emails:

```env
SMTP_HOST=...
SMTP_PORT=...
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Testing

Run the integration tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

### Notes on integration tests

- Tests live in `tests/*.test.mjs` and call your App Router route handlers directly.
- Tests run against an **isolated temporary SQLite file** (via `DB_PATH`) so they never modify `data/medical_db.sqlite`.

## Documentation

- API documentation: `docs/API.md`
- Testing documentation: `docs/TESTING.md`
