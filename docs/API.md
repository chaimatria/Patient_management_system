# API Documentation

This project uses **Next.js App Router** API routes under `app/api/*`.

Base path (dev): `http://localhost:3000/api`

## Auth

### `GET /api/auth`
Checks whether a password is already set.

- **Response 200**
  - `{ "passwordExists": true|false }`

### `POST /api/auth`
Sets a new password (only if no password exists), or updates an existing one when `action: "update"` is provided.

- **Body**
  - `password` (string, required)
  - `action` (string, optional) — use `"update"` to change an existing password

- **Response 200**: `{ "success": true, "message": "..." }`
- **Response 400**: `{ "error": "..." }`

### `PUT /api/auth`
Verifies a password.

- **Body**
  - `password` (string, required)

- **Response 200**: `{ "success": true, "authenticated": true }`
- **Response 401**: `{ "error": "Invalid password", "authenticated": false }`

## Patients

### `GET /api/patients`
- **Query**
  - `id` (string, optional) — if provided, returns a single patient

- **Response 200**
  - If `id` is provided: a single patient object (camelCase fields)
  - Otherwise: an array of patient objects

### `POST /api/patients`
Creates a patient.

- **Body (camelCase)**
  - `patientId` (string, required)
  - `fullName` (string, required)
  - `dateOfBirth` (YYYY-MM-DD, required)
  - `gender` (string, required)
  - Optional: `phoneNumber`, `email`, `lastVisit`, `pathology`, `familyHistory`, `allergies`, `previousTreatments`, `currentTreatment`, `notes`

- **Response 201**: `{ "success": true }`

### `PUT /api/patients`
Updates a patient.

- **Body**: same shape as POST, requires `patientId`
- **Response 200**: `{ "success": true }`

### `DELETE /api/patients`
Deletes a patient.

- **Query**
  - `id` (string, preferred)
- **Alternative**
  - JSON body with `patientId` or `id` (supported)

- **Response 200**: `{ "success": true }`

## Appointments

### `GET /api/appointments`
Fetch appointments.

- **Query**
  - `date` (YYYY-MM-DD, optional)
  - `startDate` + `endDate` (YYYY-MM-DD, optional)

- **Response 200**: array of appointments (snake_case fields from DB)

### `POST /api/appointments`
Creates an appointment. Includes **past-date validation** and **time conflict detection**.

- **Body**
  - `patientName` (string, required)
  - `appointmentDate` (YYYY-MM-DD, required)
  - `appointmentTime` (HH:mm, required)
  - `appointmentType` (string, required)
  - Optional: `duration` (minutes), `status`, `notes`

- **Response 201**: created appointment row
- **Response 409**: `{ "error": "Time conflict detected", "conflictWith": { ... } }`

### `PUT /api/appointments`
Updates an appointment.

- **Body**
  - `appointmentId` (number, required)
  - Other fields as in POST

- **Response 200**: updated appointment row

### `DELETE /api/appointments`
Deletes an appointment.

- **Body**
  - `appointmentId` (number, required)

- **Response 200**: `{ "message": "Appointment deleted successfully" }`

## Consultations

### `GET /api/consultations`
- **Query**
  - `patientId` (string, optional)

### `POST /api/consultations`
- **Body**
  - `patientId` (string, required)
  - `consultationDate` (ISO datetime, required)
  - Optional: `description`, `lastVisit`

### `PUT /api/consultations`
- **Body**
  - `consultationId` (number, required)
  - `consultationDate` (ISO datetime)
  - Optional: `description`, `lastVisit`

### `DELETE /api/consultations`
- **Body**
  - `consultationId` (number, required)

## Prescriptions

### `GET /api/prescriptions`
- **Query**
  - `id` (number, optional) — single prescription + medications
  - `patientId` (string, optional) — prescriptions for a patient

### `POST /api/prescriptions`
- **Body**
  - `medications` (array, required)
  - Optional: `patientId`, `prescriptionDate`, `doctorName`, `doctorSpecialty`, `doctorOrderNumber`, `clinicName`, `clinicAddress`, `clinicPhone`, `notes`

### `PUT /api/prescriptions`
- **Body**
  - `prescriptionId` (number, required)
  - `medications` (array)
  - Other optional fields as in POST

### `DELETE /api/prescriptions`
- **Body**
  - `prescriptionId` (number, required)

## Dashboard & Reports

- `GET /api/dashboard` returns summarized stats + recent activity.
- `GET /api/reports` returns trend and distribution data for charts.


