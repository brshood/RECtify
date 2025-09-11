const express = require('express');
const router = express.Router();
const User = require('../models/User');

let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.error('Failed to initialize Stripe for webhook:', error.message);
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !endpointSecret) {
    return res.status(500).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      default:
        break;
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handlePaymentIntentSucceeded(paymentIntent) {
  const { userId, topupAmount, currency } = paymentIntent.metadata || {};
  const amount = parseFloat(topupAmount);
  if (!userId || !amount || amount <= 0) return;

  // Idempotency: check if already recorded
  const alreadyRecorded = await User.findOne({ 'paymentHistory.paymentIntentId': paymentIntent.id }).lean();
  if (alreadyRecorded) return;

  await User.findByIdAndUpdate(userId, {
    $inc: { cashBalance: amount },
    $push: {
      paymentHistory: {
        paymentIntentId: paymentIntent.id,
        amount,
        currency: currency || 'aed',
        type: 'topup',
        status: 'completed',
        processedAt: new Date()
      }
    }
  });
}

async function handlePaymentIntentFailed(paymentIntent) {
  const { userId, topupAmount, currency } = paymentIntent.metadata || {};
  await User.findByIdAndUpdate(userId, {
    $push: {
      paymentHistory: {
        paymentIntentId: paymentIntent.id,
        amount: parseFloat(topupAmount) || 0,
        currency: currency || 'aed',
        type: 'topup',
        status: 'failed',
        processedAt: new Date(),
        failureReason: paymentIntent.last_payment_error?.message || 'Unknown'
      }
    }
  });
}

module.exports = router;


