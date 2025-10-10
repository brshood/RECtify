const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../utils/emailService');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Health check endpoint for contact form
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Contact form service is running',
    timestamp: new Date().toISOString()
  });
});

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 contact form submissions per 15 minutes
  message: {
    error: 'Too many contact form submissions. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});

// @route   POST /api/contact/send
// @desc    Send contact form email
// @access  Public
router.post('/send', contactLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Send email using Gmail SMTP (EmailJS doesn't support server-side)
    await emailService.sendContactFormEmail({
      name,
      email,
      subject,
      message
    });

    res.json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Log more details for debugging
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

module.exports = router;
