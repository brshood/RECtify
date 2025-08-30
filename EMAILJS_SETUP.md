# EmailJS Setup Guide for RECtify Contact Form

This guide will help you set up EmailJS to automatically send emails from the contact form to `alsamrikhaled@gmail.com`.

## Step 1: Create EmailJS Account

1. **Go to [EmailJS.com](https://www.emailjs.com/)**
2. **Sign up for a free account**
3. **Verify your email address**

## Step 2: Add Email Service

1. **Go to Email Services** in your EmailJS dashboard
2. **Click "Add New Service"**
3. **Choose Gmail** (recommended) or another email provider
4. **Connect your Gmail account** (`alsamrikhaled@gmail.com`)
5. **Note the Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. **Go to Email Templates** in your EmailJS dashboard
2. **Click "Create New Template"**
3. **Use this template:**

```
Subject: New Contact Form Message from RECtify - {{subject}}

From: {{from_name}} <{{from_email}}>
Subject: {{subject}}

Message:
{{message}}

---
This message was sent through the RECtify contact form.
Reply to: {{reply_to}}
```

4. **Save the template** and note the Template ID (e.g., `template_xyz789`)

## Step 4: Get Public Key

1. **Go to Account** in your EmailJS dashboard
2. **Copy your Public Key** (e.g., `user_abc123xyz`)

## Step 5: Update Environment Variables

### For Local Development (.env):
Create `REC_Website/.env` with:
```env
VITE_API_URL=https://rectify-production.up.railway.app/api
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### For Netlify Production:
Add these environment variables in Netlify dashboard:
- `VITE_EMAILJS_SERVICE_ID` = your service ID
- `VITE_EMAILJS_TEMPLATE_ID` = your template ID  
- `VITE_EMAILJS_PUBLIC_KEY` = your public key

## Step 6: Test the Contact Form

1. **Deploy the updated code**
2. **Go to your website**
3. **Fill out the contact form**
4. **Check `alsamrikhaled@gmail.com` for the email**

## Email Template Variables

The contact form sends these variables to the email template:
- `{{from_name}}` - User's name
- `{{from_email}}` - User's email
- `{{subject}}` - Message subject
- `{{message}}` - Message content
- `{{reply_to}}` - User's email for replies

## Troubleshooting

- **Emails not sending?** Check your EmailJS dashboard logs
- **Wrong email address?** Verify the service is connected to `alsamrikhaled@gmail.com`
- **Template not working?** Make sure all variable names match exactly

## Security Note

The EmailJS public key is safe to expose in frontend code - it's designed for client-side use.
