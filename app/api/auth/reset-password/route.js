import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import crypto from 'crypto';

// Hash password function (same as in auth/route.js)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify token and reset password
export async function POST(request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 1) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Find the reset token
    const tokenRecord = db.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND used = 0
    `).get(token);

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);
    if (now > expiresAt) {
      // Mark as used and delete expired token
      db.prepare('DELETE FROM password_reset_tokens WHERE token = ?').run(token);
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify email matches
    const passwordRecord = db.prepare('SELECT id, doctor_email FROM doctor_password LIMIT 1').get();
    if (!passwordRecord) {
      return NextResponse.json(
        { error: 'No password record found' },
        { status: 500 }
      );
    }

    if (passwordRecord.doctor_email !== tokenRecord.email) {
      return NextResponse.json(
        { error: 'Email mismatch. Please use the correct reset link.' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = hashPassword(newPassword);

    // Update password
    db.prepare('UPDATE doctor_password SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(passwordHash, passwordRecord.id);

    // Mark token as used
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token);

    // Delete all other unused tokens for this email (security measure)
    db.prepare('DELETE FROM password_reset_tokens WHERE email = ? AND used = 0').run(tokenRecord.email);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password', details: error.message },
      { status: 500 }
    );
  }
}

// Verify if token is valid (for checking before showing reset form)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const tokenRecord = db.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND used = 0
    `).get(token);

    if (!tokenRecord) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired token',
      });
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);
    if (now > expiresAt) {
      return NextResponse.json({
        valid: false,
        error: 'Token has expired',
      });
    }

    return NextResponse.json({
      valid: true,
      email: tokenRecord.email,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Failed to verify token', details: error.message },
      { status: 500 }
    );
  }
}

