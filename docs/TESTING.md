# Testing

This repo includes **integration tests** for the Next.js App Router API routes.

## Run tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## What the tests do

- Tests are in `tests/*.test.mjs`
- They import your route handlers directly, for example:
  - `app/api/auth/route.js`
  - `app/api/patients/route.js`
  - `app/api/appointments/route.js`
- They create `Request` objects and call exported handlers (`GET`, `POST`, `PUT`, `DELETE`)

## Database isolation (important)

During tests, the DB is **not** `data/medical_db.sqlite`.

`tests/setup.mjs` sets:

- `process.env.DB_PATH` to a temp location (one DB file per Vitest worker)
- `process.env.NODE_ENV = "test"`

This ensures:

- Tests do not corrupt real data
- Tests can run in parallel safely

If you need to reproduce a test DB locally, you can temporarily set:

```bash
cross-env DB_PATH=./data/medical_db.test.sqlite npm test
```


