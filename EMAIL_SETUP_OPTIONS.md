# Email Setup Options for Password Reset

## 🎯 **What You Need to Understand:**

The password reset system sends emails **TO** any user who requests it (like `user@company.com`), but it needs to send emails **FROM** your application. You need email sending credentials, not receiving credentials.

## 📧 **Three Options for Email Sending:**

### **Option 1: Use Your Existing EmailJS Setup (Recommended)**
Since you already have EmailJS configured for contact forms, we can use the same service for password reset emails.

**Add to your `backend/.env`:**
```env
# Get these from your EmailJS dashboard
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id  
EMAILJS_PUBLIC_KEY=your_public_key
```

**Benefits:**
- ✅ Uses your existing EmailJS setup
- ✅ No additional Gmail configuration needed
- ✅ Professional email delivery
- ✅ Works for any user email address

### **Option 2: Gmail SMTP (Alternative)**
Use your Gmail account to send emails from your application.

**Add to your `backend/.env`:**
```env
EMAIL_USER=alsamrikhaled@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=noreply@rectify.ae
```

**Benefits:**
- ✅ Direct SMTP control
- ✅ Professional sender address
- ❌ Requires Gmail app password setup

### **Option 3: Development Mode (Current)**
Keep console logging for testing.

**Benefits:**
- ✅ No setup required
- ✅ Perfect for development
- ❌ No real emails sent

## 🚀 **Recommended Setup (EmailJS):**

1. **Go to your EmailJS dashboard**
2. **Create a new template** for password reset emails
3. **Add the template variables:**
   - `{{to_email}}` - User's email
   - `{{verification_code}}` - 6-digit code
   - `{{reset_url}}` - Password reset link
   - `{{user_name}}` - User's name

4. **Update your `backend/.env`** with EmailJS credentials
5. **Restart the backend**

## 📝 **Email Template for EmailJS:**

```
Subject: RECtify - Password Reset Request

Hello {{user_name}},

You requested a password reset for your RECtify account.

Verification Code: {{verification_code}}

Or click this link: {{reset_url}}

This code expires in 10 minutes.

Best regards,
RECtify Team
```

## 🔄 **How It Works:**

1. **User enters email** (e.g., `john@company.com`)
2. **System generates verification code**
3. **Email sent TO** `john@company.com` **FROM** your EmailJS/Gmail
4. **User receives email** with verification code
5. **User enters code** and sets new password

## ✅ **Current Status:**

Your system is currently in **development mode** - it logs emails to console instead of sending real emails. This is perfect for testing!

**Which option would you prefer to use?**
