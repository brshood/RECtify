# EmailJS Password Reset Template Setup

## 📧 **Create a New EmailJS Template for Password Reset**

### Step 1: Go to EmailJS Dashboard
1. Visit: https://dashboard.emailjs.com/
2. Go to **Email Templates**
3. Click **Create New Template**

### Step 2: Template Configuration

**Template Name:** `Password Reset - RECtify`

**Subject:** `RECtify - Password Reset Request`

**Template Content:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - RECtify</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2ecc71;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2ecc71;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .content {
      margin-bottom: 30px;
    }
    .verification-code {
      background-color: #f8f9fa;
      border: 2px solid #2ecc71;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
      font-family: 'Courier New', monospace;
      font-size: 24px;
      font-weight: bold;
      color: #2ecc71;
      letter-spacing: 3px;
    }
    .button {
      display: inline-block;
      background-color: #2ecc71;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #27ae60;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">RECtify</div>
      <div class="subtitle">UAE's First Digital I-REC Trading Platform</div>
    </div>
    
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hello {{user_name}},</p>
      
      <p>We received a request to reset your password for your RECtify account. If you made this request, please use the verification code below or click the button to reset your password:</p>
      
      <div class="verification-code">
        {{verification_code}}
      </div>
      
      <p style="text-align: center;">
        <a href="{{reset_url}}" class="button">Reset My Password</a>
      </p>
      
      <div class="warning">
        <strong>Important:</strong>
        <ul>
          <li>This verification code will expire in 10 minutes</li>
          <li>If you didn't request this password reset, please ignore this email</li>
          <li>For security reasons, never share this code with anyone</li>
        </ul>
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #2ecc71;">{{reset_url}}</p>
    </div>
    
    <div class="footer">
      <p>This email was sent from RECtify. If you have any questions, please contact our support team.</p>
      <p>&copy; 2024 RECtify. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### Step 3: Template Variables
Make sure these variables are available in your template:
- `{{user_name}}` - User's name (extracted from email)
- `{{verification_code}}` - 6-digit verification code
- `{{reset_url}}` - Password reset link

### Step 4: Save and Get Template ID
1. **Save the template**
2. **Copy the Template ID** (e.g., `template_xyz789`)
3. **Note it down** for the next step

## 🔧 **Next Steps:**
1. Create this template in EmailJS
2. Get your Service ID, Template ID, and Public Key
3. Update your backend .env file with these credentials
4. Test the password reset flow!
