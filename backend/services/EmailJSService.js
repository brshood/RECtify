const emailjs = require('@emailjs/nodejs');

class EmailJSService {
  constructor() {
    this.serviceId = process.env.EMAILJS_SERVICE_ID;
    this.templateId = process.env.EMAILJS_TEMPLATE_ID;
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY;
    
    if (!this.serviceId || !this.templateId || !this.publicKey) {
      console.warn('⚠️ EmailJS not configured - password reset emails will not be sent');
    }
  }

  async sendPasswordResetEmail(email, verificationCode, userName) {
    try {
      if (!this.serviceId || !this.templateId || !this.publicKey) {
        throw new Error('EmailJS not configured');
      }

      const templateParams = {
        to_email: email,
        user_name: userName || email.split('@')[0],
        verification_code: verificationCode,
        reset_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${verificationCode}`,
        subject: 'RECtify - Password Reset Code'
      };

      console.log('📧 Sending password reset email via EmailJS:', {
        to: email,
        serviceId: this.serviceId,
        templateId: this.templateId
      });

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        {
          publicKey: this.publicKey
        }
      );

      console.log('✅ Password reset email sent successfully:', response);
      return { success: true, messageId: response.text };
    } catch (error) {
      console.error('❌ EmailJS error:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendContactFormEmail(formData) {
    try {
      if (!this.serviceId || !this.templateId || !this.publicKey) {
        throw new Error('EmailJS not configured');
      }

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: 'team@rectifygo.com',
        reply_to: formData.email
      };

      console.log('📧 Sending contact form email via EmailJS');

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        {
          publicKey: this.publicKey
        }
      );

      console.log('✅ Contact form email sent successfully:', response);
      return { success: true, messageId: response.text };
    } catch (error) {
      console.error('❌ EmailJS contact form error:', error);
      throw new Error(`Failed to send contact form email: ${error.message}`);
    }
  }
}

module.exports = new EmailJSService();
