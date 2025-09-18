// Frontend Email Service using EmailJS
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export interface PasswordResetEmailData {
  to_email: string;
  user_name: string;
  verification_code: string;
  reset_url: string;
}

export class FrontendEmailService {
  static async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    try {
      console.log('📧 EmailJS Configuration Check:', {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing'
      });

      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        console.error('❌ EmailJS not configured properly');
        console.error('Missing:', {
          serviceId: !EMAILJS_SERVICE_ID,
          templateId: !EMAILJS_TEMPLATE_ID,
          publicKey: !EMAILJS_PUBLIC_KEY
        });
        return false;
      }

      const templateParams = {
        to_email: data.to_email,
        user_name: data.user_name,
        verification_code: data.verification_code,
        reset_url: data.reset_url,
        subject: 'RECtify - Password Reset Code'
      };

      console.log('📧 Sending email with params:', templateParams);

      // Initialize EmailJS
      emailjs.init(EMAILJS_PUBLIC_KEY);
      
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('❌ EmailJS error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }
  }
}

export default FrontendEmailService;
