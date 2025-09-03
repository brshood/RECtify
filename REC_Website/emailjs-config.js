// EmailJS Configuration
// Copy these values to your .env file or set them as environment variables

export const EMAILJS_CONFIG = {
  // Replace these with your actual EmailJS credentials
  SERVICE_ID: 'your_service_id_here',
  TEMPLATE_ID: 'your_template_id_here', 
  PUBLIC_KEY: 'your_public_key_here'
};

// Instructions:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Add Gmail as your email service (connect to alsamrikhaled@gmail.com)
// 3. Create an email template with the subject: "New Contact Form Message from RECtify - {{subject}}"
// 4. Get your Service ID, Template ID, and Public Key from your EmailJS dashboard
// 5. Create a .env file in this directory with:
//    VITE_EMAILJS_SERVICE_ID=your_actual_service_id
//    VITE_EMAILJS_TEMPLATE_ID=your_actual_template_id
//    VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key
