# Email Setup for Password Reset

To enable password reset via email, you need to configure SMTP settings.

## Configuration Steps

1. Create a `.env.local` file in the root directory of your project.

2. Add the following environment variables:

```env
# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Base URL (for password reset links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Gmail Setup

If you're using Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use this App Password as `SMTP_PASS` (not your regular Gmail password)

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Custom SMTP
Use your email provider's SMTP settings.

## Testing

1. Start your application
2. Go to the login page
3. Click "Mot de passe oublié?" (Forgot password)
4. Enter your email address
5. Check your inbox for the reset link

## Development Mode

If email is not configured, the system will:
- Still create reset tokens
- Log the reset URL to the console (in development mode)
- Allow you to manually copy the reset link

## Security Notes

- Reset tokens expire after 1 hour
- Each token can only be used once
- Old tokens are automatically deleted when a new one is created

