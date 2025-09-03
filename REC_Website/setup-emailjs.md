# Quick EmailJS Setup Guide

## Step 1: Get Your EmailJS Credentials

1. **Go to [EmailJS.com](https://www.emailjs.com/)**
2. **Sign up for free account**
3. **Add Gmail service** (connect to `alsamrikhaled@gmail.com`)
4. **Create email template** with this content:

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

5. **Get your 3 credentials:**
   - Service ID (e.g., `service_abc123`)
   - Template ID (e.g., `template_xyz789`) 
   - Public Key (e.g., `user_abc123xyz`)

## Step 2: Create Environment File

Create a file called `.env` in the `REC_Website` folder with:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## Step 3: Test

1. Run `npm run dev`
2. Go to your contact form
3. Fill it out and submit
4. Check `alsamrikhaled@gmail.com` for the email

## For Production (Netlify)

Add the same environment variables in Netlify dashboard:
- Go to Site Settings > Environment Variables
- Add each variable with your actual values
