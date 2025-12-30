const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;
let DB_PATH = null;

// Initialize database connection
function initDatabase() {
  if (db) return db;

  // Check if we're in Electron main process
  try {
    const { app } = require('electron');
    DB_PATH = path.join(app.getPath('userData'), 'medical_db.sqlite');
  } catch (e) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    DB_PATH = path.join(dataDir, 'medical_db.sqlite');
  }

  console.log('📁 Database location:', DB_PATH);

  db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
  });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  // Create tables
  createTables();
  
  // Run migrations
  runMigrations();

  console.log('✅ SQLite Database initialized successfully');

  return db;
}

// Check if a column exists in a table
function columnExists(tableName, columnName) {
  const columns = db.pragma(`table_info(${tableName})`);
  return columns.some(col => col.name === columnName);
}

// Run database migrations
function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    // Migration 1: Add email column to patients table if it doesn't exist
    if (!columnExists('patients', 'email')) {
      console.log('  ➕ Adding email column to patients table...');
      db.exec('ALTER TABLE patients ADD COLUMN email TEXT;');
      console.log('  ✅ Email column added successfully');
    } else {
      console.log('  ✓ Email column already exists');
    }

    // Migration 2: Add medical history and treatment fields to patients table if they don't exist
    if (!columnExists('patients', 'pathology')) {
      console.log('  ➕ Adding pathology column to patients table...');
      db.exec('ALTER TABLE patients ADD COLUMN pathology TEXT;');
      console.log('  ✅ Pathology column added successfully');
    } else {
      console.log('  ✓ Pathology column already exists');
    }

    if (!columnExists('patients', 'family_history')) {
      console.log('  ➕ Adding family_history column to patients table...');
      db.exec('ALTER TABLE patients ADD COLUMN family_history TEXT;');
      console.log('  ✅ family_history column added successfully');
    } else {
      console.log('  ✓ family_history column already exists');
    }

    if (!columnExists('patients', 'allergies')) {
      console.log('  ➕ Adding allergies column to patients table...');
      db.exec('ALTER TABLE patients ADD COLUMN allergies TEXT;');
      console.log('  ✅ allergies column added successfully');
    } else {
      console.log('  ✓ allergies column already exists');
    }

    if (!columnExists('patients', 'previous_treatments')) {
      console.log('  ➕ Adding previous_treatments column to patients table...');
      db.exec('ALTER TABLE patients ADD COLUMN previous_treatments TEXT;');
      console.log('  ✅ previous_treatments column added successfully');
    } else {
      console.log('  ✓ previous_treatments column already exists');
    }

    if (!columnExists('patients', 'current_treatment')) {
      console.log('  ➕ Adding current_treatment column to patients table...');
      db.exec('ALTER TABLE patients ADD COLUMN current_treatment TEXT;');
      console.log('  ✅ current_treatment column added successfully');
    } else {
      console.log('  ✓ current_treatment column already exists');
    }

    if (!columnExists('patients', 'notes')) {
      console.log('  ➕ Adding notes column to patients table...');
      db.exec('ALTER TABLE patients ADD COLUMN notes TEXT;');
      console.log('  ✅ notes column added successfully');
    } else {
      console.log('  ✓ notes column already exists');
    }

    // Migration: Add doctor_email column to doctor_password table if it doesn't exist
    if (!columnExists('doctor_password', 'doctor_email')) {
      console.log('  ➕ Adding doctor_email column to doctor_password table...');
      db.exec('ALTER TABLE doctor_password ADD COLUMN doctor_email TEXT;');
      console.log('  ✅ doctor_email column added successfully');
    } else {
      console.log('  ✓ doctor_email column already exists');
    }
    
    console.log('✅ All migrations completed');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Create all tables
function createTables() {
  db.exec(`
  
    CREATE TABLE IF NOT EXISTS patients (
      patient_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'Male', 'Female', 'Other')),
      phone_number TEXT,
      email TEXT,
      weight REAL,
      height REAL,
      consultation_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

 
    CREATE TABLE IF NOT EXISTS consultations (
      consultation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      consultation_date DATETIME NOT NULL,
      description TEXT,
      last_visit DATETIME,
      total_consultations INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS appointments (
      appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      appointment_type TEXT NOT NULL,
      duration INTEGER DEFAULT 30,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS prescriptions (
      prescription_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT,
      prescription_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      doctor_name TEXT DEFAULT 'Dr. Bouzourene',
      doctor_specialty TEXT DEFAULT 'Médecin Généraliste',
      doctor_order_number TEXT DEFAULT '00152017',
      clinic_name TEXT DEFAULT 'DocLink Clinic',
      clinic_address TEXT DEFAULT 'Alger',
      clinic_phone TEXT DEFAULT '0552265120',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
    );

 
    CREATE TABLE IF NOT EXISTS medications (
      medication_id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_id INTEGER NOT NULL,
      medication_order INTEGER NOT NULL,
      drug_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      instructions TEXT NOT NULL,
      duration TEXT,
      quantity TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS medications_library (
      medication_lib_id INTEGER PRIMARY KEY AUTOINCREMENT,
      drug_name TEXT NOT NULL UNIQUE,
      common_dosages TEXT,
      common_instructions TEXT,
      typical_duration TEXT,
      category TEXT DEFAULT 'General',
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS pathologies (
      pathology_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      pathology_name TEXT NOT NULL,
      family_members TEXT,
      allergies TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS treatments (
      treatment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      previous_treatment TEXT,
      active_treatment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
    );

   
    CREATE TABLE IF NOT EXISTS notes (
      note_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      note_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doctor_password (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password_hash TEXT NOT NULL,
      doctor_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

   
    CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
    CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone_number);
    CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
    CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_name ON appointments(patient_name);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(prescription_date);
    CREATE INDEX IF NOT EXISTS idx_medications ON medications(prescription_id);
    CREATE INDEX IF NOT EXISTS idx_medications_library_name ON medications_library(drug_name);
    CREATE INDEX IF NOT EXISTS idx_medications_library_usage ON medications_library(usage_count DESC);
    CREATE INDEX IF NOT EXISTS idx_pathologies_patient ON pathologies(patient_id);
    CREATE INDEX IF NOT EXISTS idx_treatments_patient ON treatments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_notes_patient ON notes(patient_id);

 
    CREATE TRIGGER IF NOT EXISTS update_patients_timestamp
    AFTER UPDATE ON patients
    BEGIN
      UPDATE patients SET updated_at = CURRENT_TIMESTAMP WHERE patient_id = NEW.patient_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_consultations_timestamp
    AFTER UPDATE ON consultations
    BEGIN
      UPDATE consultations SET updated_at = CURRENT_TIMESTAMP WHERE consultation_id = NEW.consultation_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_appointments_timestamp
    AFTER UPDATE ON appointments
    BEGIN
      UPDATE appointments SET updated_at = CURRENT_TIMESTAMP WHERE appointment_id = NEW.appointment_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_prescriptions_timestamp
    AFTER UPDATE ON prescriptions
    BEGIN
      UPDATE prescriptions SET updated_at = CURRENT_TIMESTAMP WHERE prescription_id = NEW.prescription_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_medications_library_timestamp
    AFTER UPDATE ON medications_library
    BEGIN
      UPDATE medications_library SET updated_at = CURRENT_TIMESTAMP WHERE medication_lib_id = NEW.medication_lib_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_pathologies_timestamp
    AFTER UPDATE ON pathologies
    BEGIN
      UPDATE pathologies SET updated_at = CURRENT_TIMESTAMP WHERE pathology_id = NEW.pathology_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_treatments_timestamp
    AFTER UPDATE ON treatments
    BEGIN
      UPDATE treatments SET updated_at = CURRENT_TIMESTAMP WHERE treatment_id = NEW.treatment_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_notes_timestamp
    AFTER UPDATE ON notes
    BEGIN
      UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE note_id = NEW.note_id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_doctor_password_timestamp
    AFTER UPDATE ON doctor_password
    BEGIN
      UPDATE doctor_password SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
  `);
}

// Get database instance
function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// Close database connection
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('🔒 Database connection closed');
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  getDBPath: () => DB_PATH
};