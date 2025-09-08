const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

let stripe = null;
try {
  const Stripe = require('stripe');
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }
} catch (e) {
  console.warn('Stripe SDK not available. Install "stripe" in backend to enable payments.');
}

const router = express.Router();

// POST /api/payments/create-intent
// Creates a PaymentIntent for a buy order total
router.post(
  '/create-intent',
  [
    auth,
    body('quantity').isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('currency').optional().isIn(['aed', 'usd']).withMessage('Unsupported currency')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      if (!stripe) {
        return res.status(500).json({ success: false, message: 'Stripe is not configured on the server' });
      }

      const { quantity, price, currency = 'aed' } = req.body;

      // Fees must match UI calculation to avoid mismatches
      const PLATFORM_FEE_RATE = 0.02; // 2%
      const BLOCKCHAIN_FEE = 5.0; // AED 5 fixed

      const subtotal = Number(quantity) * Number(price);
      const platformFee = subtotal * PLATFORM_FEE_RATE;
      const blockchainFee = quantity > 0 ? BLOCKCHAIN_FEE : 0;
      const total = subtotal + platformFee + blockchainFee;

      // Stripe amounts are in minor units
      const amountMinor = Math.round(total * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountMinor,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          type: 'buy_order_prepay',
          userId: req.user.userId,
          subtotal: subtotal.toFixed(2),
          platformFee: platformFee.toFixed(2),
          blockchainFee: blockchainFee.toFixed(2)
        }
      });

      return res.json({
        success: true,
        message: 'PaymentIntent created',
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: total,
          currency
        }
      });
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to create PaymentIntent' });
    }
  }
);

// POST /api/payments/create-checkout-session
// Creates a Stripe Checkout Session and returns sessionId for redirect
router.post(
  '/create-checkout-session',
  [
    auth,
    body('quantity').isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('currency').optional().isIn(['aed', 'usd']).withMessage('Unsupported currency'),
    body('successUrl').optional().isURL().withMessage('Invalid success URL'),
    body('cancelUrl').optional().isURL().withMessage('Invalid cancel URL'),
    body('facilityName').notEmpty().withMessage('Facility name is required'),
    body('facilityId').notEmpty().withMessage('Facility ID is required'),
    body('energyType').isIn(['solar', 'wind', 'hydro', 'biomass', 'geothermal', 'nuclear']).withMessage('Invalid energy type'),
    body('vintage').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Invalid vintage'),
    body('emirate').isIn(['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain']).withMessage('Invalid emirate'),
    body('purpose').isIn(['compliance', 'voluntary', 'resale', 'offset']).withMessage('Invalid purpose')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      if (!stripe) {
        return res.status(500).json({ success: false, message: 'Stripe is not configured on the server' });
      }

      const { quantity, price, currency = 'aed', successUrl, cancelUrl } = req.body;

      const PLATFORM_FEE_RATE = 0.02; // 2%
      const BLOCKCHAIN_FEE = 5.0; // AED 5 fixed
      const subtotal = Number(quantity) * Number(price);
      const platformFee = subtotal * PLATFORM_FEE_RATE;
      const blockchainFee = quantity > 0 ? BLOCKCHAIN_FEE : 0;
      const total = subtotal + platformFee + blockchainFee;

      const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: 'REC Buy Order Prepayment' },
              unit_amount: Math.round(total * 100),
            },
            quantity: 1,
          },
        ],
        success_url: (successUrl || `${origin}?payment=success&session_id={CHECKOUT_SESSION_ID}`),
        cancel_url: (cancelUrl || `${origin}?payment=cancel`),
        metadata: {
          type: 'buy_order_prepay',
          userId: req.user.userId,
          subtotal: subtotal.toFixed(2),
          platformFee: platformFee.toFixed(2),
          blockchainFee: blockchainFee.toFixed(2),
          facilityName: req.body.facilityName,
          facilityId: req.body.facilityId,
          energyType: req.body.energyType,
          vintage: String(req.body.vintage),
          emirate: req.body.emirate,
          purpose: req.body.purpose,
          price: String(price),
          quantity: String(quantity),
        },
      });

      return res.json({ success: true, message: 'Checkout session created', data: { sessionId: session.id } });
    } catch (error) {
      console.error('Error creating Checkout Session:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to create Checkout Session' });
    }
  }
);

module.exports = router;
 
// Below endpoints help the frontend confirm a Checkout payment and finalize orders without webhooks.
// GET /api/payments/session/:id - returns session status and metadata
router.get('/session/:id', auth, async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: 'Stripe not configured' });
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (String(session.metadata?.userId) !== String(req.user.userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return res.json({
      success: true,
      data: {
        id: session.id,
        payment_status: session.payment_status,
        payment_intent: session.payment_intent,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve session' });
  }
});
