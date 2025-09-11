const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error.message);
}

router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('cashBalance').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { cashBalance: user.cashBalance || 0, currency: 'aed' } });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching balance' });
  }
});

router.post('/create-topup-intent', [
  auth,
  body('amount').isFloat({ min: 1, max: 100000 }).withMessage('Amount must be between 1 and 100,000'),
  body('currency').optional().isIn(['aed', 'usd']).withMessage('Currency must be AED or USD')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Payment processing is not configured' });
    }

    const { amount, currency = 'aed' } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: {
        userId: req.user.userId,
        topupAmount: String(amount),
        currency: currency.toLowerCase(),
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`
      },
      automatic_payment_methods: { enabled: true },
      description: `RECtify Account Top-Up - ${user.firstName} ${user.lastName}`
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret, amount, currency });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment intent' });
  }
});

module.exports = router;


