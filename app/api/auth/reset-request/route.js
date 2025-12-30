import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

// Request password reset - sends email with reset token
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Check if password exists (user must have set a password first)
    const passwordRecord = db.prepare('SELECT id FROM doctor_password LIMIT 1').get();
    if (!passwordRecord) {
      return NextResponse.json(
        { error: 'No password has been set yet. Please set a password first.' },
        { status: 400 }
      );
    }

    // Rate limiting: Check if too many reset requests in the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const recentRequests = db.prepare(`
      SELECT COUNT(*) as count FROM password_reset_tokens 
      WHERE email = ? AND created_at > ?
    `).get(email, oneHourAgo.toISOString());

    if (recentRequests && recentRequests.count >= 3) {
      return NextResponse.json(
        { error: 'Too many reset requests. Please wait before requesting another reset link.' },
        { status: 429 }
      );
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store or update email in doctor_password table
    db.prepare('UPDATE doctor_password SET doctor_email = ? WHERE id = ?')
      .run(email, passwordRecord.id);

    // Delete any existing reset tokens for this email
    db.prepare('DELETE FROM password_reset_tokens WHERE email = ?').run(email);

    // Insert new reset token
    db.prepare(`
      INSERT INTO password_reset_tokens (token, email, expires_at)
      VALUES (?, ?, ?)
    `).run(resetToken, email, expiresAt.toISOString());

    // Generate reset URL - dedicated reset password page with token parameter
    // Get the origin from the request headers or use environment variable
    const origin = request.headers.get('origin') || 
                   request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
                   process.env.NEXT_PUBLIC_BASE_URL || 
                   'http://localhost:3000';
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    // Send email
    const emailResult = await sendPasswordResetEmail(email, resetToken, resetUrl);

    if (!emailResult.success) {
      // Even if email fails, we still created the token
      // Return the reset URL in development mode so user can still reset
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: emailResult.message || 'Reset token created, but email could not be sent.',
        error: emailResult.error,
        resetUrl: isDevelopment ? resetUrl : undefined,
        // Always show reset URL if email is not configured
        showResetLink: !emailResult.configured || isDevelopment,
      });
    }

    // Email sent successfully
    return NextResponse.json({
      success: true,
      emailSent: true,
      message: emailResult.message || 'Password reset email sent successfully. Please check your inbox (and spam folder).',
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request', details: error.message },
      { status: 500 }
    );
  }
}

