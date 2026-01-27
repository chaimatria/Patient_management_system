const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
function createTransporter() {
  // Use environment variables for email configuration
  // For Gmail, you'll need to use an App Password
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // Add connection timeout and retry options
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // For Gmail, we might need to allow less secure apps or use OAuth2
    // But App Password is the recommended way
  });

  return transporter;
}

// Verify email configuration
async function verifyEmailConfig() {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return { 
        configured: false, 
        error: 'Email credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.' 
      };
    }

    const transporter = createTransporter();
    await transporter.verify();
    return { configured: true, verified: true };
  } catch (error) {
    console.error('Email configuration verification failed:', error.message);
    return { 
      configured: true, 
      verified: false, 
      error: error.message 
    };
  }
}

// Send password reset email
async function sendPasswordResetEmail(email, resetToken, resetUrl) {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Warning: email is not configured. Password reset link:', resetUrl);
      console.log('Warning: to enable email, create .env.local with SMTP_USER and SMTP_PASS');
      return { 
        success: false, 
        configured: false,
        message: 'Email not configured. Please configure SMTP settings to receive emails.',
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
      };
    }

    const transporter = createTransporter();

    // Verify connection before sending
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP connection verification failed:', verifyError.message);
      return { 
        success: false, 
        configured: true,
        verified: false,
        error: `Email server connection failed: ${verifyError.message}. Please check your SMTP settings.`,
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
      };
    }

    const mailOptions = {
      from: `"DocFlow System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request - DocFlow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .button:hover { background-color: #2563eb; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>DocFlow Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have requested to reset your password for your DocFlow account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
              <div class="warning">
                <strong>Security notice:</strong> this link will expire in 1 hour. If you did not request this password reset, please ignore this email.
              </div>
              <p>Best regards,<br>DocFlow System</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - DocFlow
        
        Hello,
        
        You have requested to reset your password for your DocFlow account.
        
        Click the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you did not request this password reset, please ignore this email.
        
        Best regards,
        DocFlow System
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
    console.log('   Message ID:', info.messageId);
    console.log('   To:', email);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Password reset email sent successfully. Please check your inbox (and spam folder).'
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to send email. ';
    if (error.code === 'EAUTH') {
      errorMessage += 'Authentication failed. Please check your email and password (use App Password for Gmail).';
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage += 'Connection to email server failed. Please check your SMTP settings and internet connection.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage += 'Invalid email address.';
    } else {
      errorMessage += error.message;
    }

    return { 
      success: false, 
      configured: true,
      error: errorMessage,
      errorCode: error.code,
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    };
  }
}

module.exports = {
  sendPasswordResetEmail,
  createTransporter,
  verifyEmailConfig,
};

