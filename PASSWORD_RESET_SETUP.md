# Password Reset Setup Guide

This guide will help you set up the password reset functionality with email confirmation for RECtify.

## Overview

The password reset system includes:
- **Forgot Password**: User enters email to receive verification code
- **Email Verification**: 6-digit code sent via email with 10-minute expiry
- **Password Reset**: User enters code and new password to complete reset
- **Security**: Tokens are hashed and expire automatically

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install nodemailer
```

### 2. Environment Variables

Add these to your `backend/.env` file:

```env
# Email configuration for password reset
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@rectify.ae

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:5173

# Development email testing (Ethereal)
ETHEREAL_USER=ethereal.user@ethereal.email
ETHEREAL_PASS=ethereal.pass
```

### 3. Email Service Configuration

#### For Production (Gmail):
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this as `EMAIL_PASS`

#### For Development (Ethereal):
1. **Create Ethereal account** at https://ethereal.email/
2. **Get credentials** from the dashboard
3. **Use in development** - emails will be previewed in Ethereal

### 4. Database Schema

The User model already includes the required fields:
- `passwordResetToken`: Hashed token for verification
- `passwordResetExpires`: Expiration timestamp (10 minutes)

## Frontend Setup

### 1. Components Added

- **ForgotPassword.tsx**: Email input and code verification
- **ResetPassword.tsx**: New password entry with code verification
- **Updated LoginForm.tsx**: Added "Forgot password?" link

### 2. API Integration

The following API endpoints are available:
- `POST /api/auth/forgot-password` - Send verification code
- `POST /api/auth/verify-reset-code` - Verify 6-digit code
- `POST /api/auth/reset-password` - Reset password with code

## Testing the Flow

### 1. Start the Backend

```bash
cd backend
npm start
```

### 2. Start the Frontend

```bash
cd REC_Website
npm run dev
```

### 3. Test Password Reset

1. **Go to login page**
2. **Click "Forgot your password?"**
3. **Enter email address**
4. **Check email for 6-digit code**
5. **Enter verification code**
6. **Set new password**
7. **Login with new password**

## Email Templates

The system sends professional HTML emails with:
- **RECtify branding**
- **6-digit verification code**
- **Reset link** (alternative to code)
- **Security warnings**
- **10-minute expiry notice**

## Security Features

### 1. Token Security
- **Hashed tokens** stored in database
- **10-minute expiry** for all reset tokens
- **One-time use** tokens (cleared after use)
- **Rate limiting** on reset requests

### 2. User Experience
- **No user enumeration** (same response for valid/invalid emails)
- **Clear error messages** for invalid codes
- **Resend functionality** for expired codes
- **Password strength validation**

### 3. Email Security
- **Professional templates** to avoid spam filters
- **Clear sender identification**
- **Security warnings** in emails
- **No sensitive data** in email content

## Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check email credentials in `.env`
   - Verify Gmail app password (not regular password)
   - Check Ethereal credentials for development

2. **Code not working**:
   - Ensure code is exactly 6 digits
   - Check if code has expired (10 minutes)
   - Verify email matches the one used to request reset

3. **Backend errors**:
   - Check MongoDB connection
   - Verify JWT_SECRET is set
   - Check email service configuration

### Development Testing

For development, use Ethereal email service:
1. **Check console logs** for preview URLs
2. **Use Ethereal dashboard** to view sent emails
3. **Test with real email addresses** in production

## Production Deployment

### 1. Railway Backend
- Add environment variables in Railway dashboard
- Ensure `EMAIL_USER` and `EMAIL_PASS` are set
- Set `FRONTEND_URL` to your production domain

### 2. Netlify Frontend
- No additional configuration needed
- Frontend will use production API automatically

### 3. Email Service
- Use Gmail with app password for production
- Consider professional email service for high volume
- Monitor email delivery rates

## API Endpoints Reference

### POST /api/auth/forgot-password
```json
{
  "email": "user@example.com"
}
```

### POST /api/auth/verify-reset-code
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### POST /api/auth/reset-password
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on reset endpoints
2. **Email Validation**: Validate email format and domain
3. **Password Policy**: Enforce strong password requirements
4. **Token Cleanup**: Regularly clean expired tokens
5. **Audit Logging**: Log password reset attempts for security

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test email service configuration separately
4. Ensure database connection is working
5. Check network connectivity between frontend and backend

The password reset system is now fully integrated and ready for use!
