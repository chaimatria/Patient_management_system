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
    // Not in Electron, use local path for development
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    DB_PATH = path.join(dataDir, 'medical_db.sqlite');
  }

  console.log('📍 Database location:', DB_PATH);

  db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
  });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  // Create tables
  createTables();

  console.log('✅ SQLite Database initialized successfully');

  return db;
}

// Create all tables
function createTables() {
  db.exec(`
    -- ============================================
    -- PATIENTS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS patients (
      patient_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'Male', 'Female', 'Other')),
      phone_number TEXT,
      weight REAL,
      height REAL,
      consultation_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- CONSULTATIONS TABLE
    -- ============================================
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

    -- ============================================
    -- PATHOLOGIES TABLE
    -- ============================================
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

    -- ============================================
    -- TREATMENTS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS treatments (
      treatment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      previous_treatment TEXT,
      active_treatment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
    );

    -- ============================================
    -- NOTES TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS notes (
      note_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      note_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
    );

    -- ============================================
    -- INDEXES FOR PERFORMANCE
    -- ============================================
    CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
    CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone_number);
    CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
    CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
    CREATE INDEX IF NOT EXISTS idx_pathologies_patient ON pathologies(patient_id);
    CREATE INDEX IF NOT EXISTS idx_treatments_patient ON treatments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_notes_patient ON notes(patient_id);

    -- ============================================
    -- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
    -- ============================================
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

