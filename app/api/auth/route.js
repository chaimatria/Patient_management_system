import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import crypto from 'crypto';

// Simple hash function for password (using SHA-256)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Check if password exists
export async function GET(request) {
  try {
    const db = getDatabase();
    const passwordRecord = db.prepare('SELECT id FROM doctor_password LIMIT 1').get();
    
    return NextResponse.json({ 
      passwordExists: !!passwordRecord 
    });
  } catch (error) {
    console.error('Error checking password:', error);
    return NextResponse.json(
      { error: 'Failed to check password', details: error.message },
      { status: 500 }
    );
  }
}

// Set or update password
export async function POST(request) {
  try {
    const body = await request.json();
    const { password, action } = body;

    if (!password || password.length < 1) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const passwordHash = hashPassword(password);

    // Check if password already exists
    const existing = db.prepare('SELECT id FROM doctor_password LIMIT 1').get();

    if (existing) {
      // Update existing password
      if (action === 'update') {
        db.prepare('UPDATE doctor_password SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(passwordHash, existing.id);
        return NextResponse.json({ success: true, message: 'Password updated successfully' });
      } else {
        return NextResponse.json(
          { error: 'Password already exists. Use update action to change it.' },
          { status: 400 }
        );
      }
    } else {
      // Insert new password
      db.prepare('INSERT INTO doctor_password (password_hash) VALUES (?)')
        .run(passwordHash);
      return NextResponse.json({ success: true, message: 'Password set successfully' });
    }
  } catch (error) {
    console.error('Error setting password:', error);
    return NextResponse.json(
      { error: 'Failed to set password', details: error.message },
      { status: 500 }
    );
  }
}

// Verify password
export async function PUT(request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const passwordRecord = db.prepare('SELECT password_hash FROM doctor_password LIMIT 1').get();

    if (!passwordRecord) {
      return NextResponse.json(
        { error: 'No password set. Please set a password first.' },
        { status: 404 }
      );
    }

    const passwordHash = hashPassword(password);
    const isValid = passwordHash === passwordRecord.password_hash;

    if (isValid) {
      return NextResponse.json({ success: true, authenticated: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid password', authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Failed to verify password', details: error.message },
      { status: 500 }
    );
  }
}

