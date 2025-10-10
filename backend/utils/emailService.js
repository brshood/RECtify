const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Check if real email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your-gmail-app-password' && process.env.EMAIL_USER !== 'your-email@gmail.com') {
      // Real email configuration (using Gmail SMTP)
      console.log('📧 Using real Gmail SMTP for email delivery');
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Use App Password for Gmail
        }
      });
    } else {
      // Development email configuration (console logging for testing)
      console.log('📧 Using development mode - emails will be logged to console');
      this.transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n📧 EMAIL SENT (Development Mode):');
          console.log('To:', mailOptions.to);
          console.log('Subject:', mailOptions.subject);
          console.log('From:', mailOptions.from);
          if (mailOptions.replyTo) {
            console.log('Reply-To:', mailOptions.replyTo);
          }
          console.log('HTML Content:', mailOptions.html ? 'Present' : 'Not present');
          if (mailOptions.html && mailOptions.html.includes('verification-code')) {
            console.log('Verification Code:', this.extractCodeFromEmail(mailOptions.html));
            console.log('Reset URL:', this.extractUrlFromEmail(mailOptions.html));
          }
          console.log('📧 End of Email\n');
          
          return {
            messageId: 'dev-' + Date.now(),
            response: 'Email logged to console (development mode)'
          };
        }
      };
    }
  }

  extractCodeFromEmail(html) {
    const codeMatch = html.match(/<div class="verification-code">\s*([A-Z0-9]+)\s*<\/div>/);
    return codeMatch ? codeMatch[1] : '123456';
  }

  extractUrlFromEmail(html) {
    const urlMatch = html.match(/href="([^"]+)"/);
    return urlMatch ? urlMatch[1] : 'http://localhost:5173/reset-password';
  }

  async sendPasswordResetEmail(email, resetToken, firstName) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@rectify.ae',
        to: email,
        subject: 'RECtify - Password Reset Request',
        html: this.getPasswordResetEmailTemplate(firstName, resetUrl, resetToken)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  getPasswordResetEmailTemplate(firstName, resetUrl, resetToken) {
    return `
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
            <p>Hello ${firstName || 'Valued User'},</p>
            
            <p>We received a request to reset your password for your RECtify account. If you made this request, please use the verification code below or click the button to reset your password:</p>
            
            <div class="verification-code">
              ${resetToken.substring(0, 6).toUpperCase()}
            </div>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
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
            <p style="word-break: break-all; color: #2ecc71;">${resetUrl}</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from RECtify. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 RECtify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendContactFormEmail(formData) {
    try {
      const { name, email, subject, message } = formData;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@rectify.ae',
        to: 'team@rectifygo.com',
        subject: `Contact Form: ${subject}`,
        html: this.getContactFormEmailTemplate(name, email, subject, message),
        replyTo: email
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending contact form email:', error);
      throw new Error('Failed to send contact form email');
    }
  }

  getContactFormEmailTemplate(name, email, subject, message) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission - RECtify</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin: 15px 0; }
          .label { font-weight: bold; color: #22c55e; }
          .value { background: white; padding: 10px; border-radius: 4px; border-left: 4px solid #22c55e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>RECtify Website Contact Form</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Reply directly to this email to respond to ${name}.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
