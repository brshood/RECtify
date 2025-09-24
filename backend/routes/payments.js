const express = require('express');
const auth = require('../middleware/auth');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (stripeSecret) {
  stripe = require('stripe')(stripeSecret);
}

const router = express.Router();

// GET /api/payments/balance - return current user cash balance (AED)
router.get('/balance', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    return res.json({
      success: true,
      data: {
        cashBalance: user.cashBalance || 0,
        cashCurrency: user.cashCurrency || 'AED',
        reservedBalance: user.reservedBalance || 0
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch balance' });
  }
});

// POST /api/payments/add-funds - Add funds directly (bypass Stripe for development)
router.post('/add-funds', auth, async (req, res) => {
  try {
    const { amount, currency = 'AED' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount. Amount must be greater than 0.' 
      });
    }

    if (!['AED', 'USD'].includes(currency)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid currency. Only AED and USD are supported.' 
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Add funds to user's cash balance
    user.cashBalance = (user.cashBalance || 0) + amount;
    user.cashCurrency = currency;
    await user.save();

    console.log(`💰 Added ${amount} ${currency} to user ${user.email} (ID: ${user._id})`);

    return res.json({
      success: true,
      message: `Successfully added ${amount} ${currency} to your account`,
      data: {
        cashBalance: user.cashBalance,
        cashCurrency: user.cashCurrency,
        reservedBalance: user.reservedBalance || 0,
        addedAmount: amount
      }
    });
  } catch (error) {
    console.error('Error adding funds:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to add funds' 
    });
  }
});

// POST /api/payments/topup-session - create Embedded Checkout Session
router.post('/topup-session', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ success: false, message: 'Stripe not configured' });
    }
    const { amount, currency } = req.body || {};
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const normalizedCurrency = (currency || 'AED').toLowerCase();

    // Load user to provide customer email for receipts/invoices
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      currency: normalizedCurrency,
      line_items: [
        {
          price_data: {
            currency: normalizedCurrency,
            product_data: { name: 'Wallet Top-up' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: user?.email || undefined,
      payment_intent_data: {
        metadata: {
          rectify_user_id: req.user.userId.toString(),
          topup_amount: String(amount),
          topup_currency: normalizedCurrency.toUpperCase()
        },
        receipt_email: user?.email || undefined
      },
      metadata: {
        rectify_user_id: req.user.userId.toString(),
        topup_amount: String(amount),
        topup_currency: normalizedCurrency.toUpperCase()
      }
    });

    return res.json({ success: true, data: { id: session.id, client_secret: session.client_secret } });
  } catch (e) {
    console.error('Stripe topup-session error:', e);
    return res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
});

// Standalone webhook handler export (mounted in server before json)
async function webhookHandler(req, res) {
  try {
    if (!stripe) return res.status(400).send('Stripe not configured');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event = req.body;

    if (endpointSecret) {
      const sig = req.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    // Idempotency using session ID (simple approach)
    const StripeEvent = require('../models/StripeEvent');
    const exists = await StripeEvent.findOne({ eventId: event.id });
    if (exists) return res.json({ received: true, duplicate: true });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session?.metadata?.rectify_user_id;
      const amount = (session?.amount_total ?? 0) / 100;
      const paid = session?.payment_status === 'paid';

      if (userId && paid && amount > 0) {
        const User = require('../models/User');
        const user = await User.findById(userId);
        if (user) {
          user.cashBalance = (user.cashBalance || 0) + amount;
          user.cashCurrency = 'AED';
          await user.save();
        }

        // Create and send a Stripe Invoice for the top-up (optional but requested)
        try {
          const email = user?.email;
          if (email) {
            // Find or create customer by email
            const customers = await stripe.customers.list({ email, limit: 1 });
            const customer = customers.data[0] || await stripe.customers.create({ email, name: `${user.firstName} ${user.lastName}` });
            const currency = (session?.currency || 'aed').toLowerCase();
            await stripe.invoiceItems.create({
              customer: customer.id,
              amount: Math.round(amount * 100),
              currency,
              description: 'Wallet Top-up'
            });
            const invoice = await stripe.invoices.create({ customer: customer.id, auto_advance: true, collection_method: 'send_invoice' });
            await stripe.invoices.finalizeInvoice(invoice.id);
            await stripe.invoices.sendInvoice(invoice.id);
          }
        } catch (e) {
          console.warn('Invoice creation failed:', e?.message || e);
        }
      }
    }

    // Support Payment Element flow (if used later)
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const userId = pi?.metadata?.rectify_user_id;
      const amount = (pi?.amount_received ?? 0) / 100;
      if (userId && amount > 0) {
        const User = require('../models/User');
        const user = await User.findById(userId);
        if (user) {
          user.cashBalance = (user.cashBalance || 0) + amount;
          user.cashCurrency = 'AED';
          await user.save();
        }
        // Optional invoice for Payment Element flow
        try {
          const email = user?.email;
          if (email) {
            const customers = await stripe.customers.list({ email, limit: 1 });
            const customer = customers.data[0] || await stripe.customers.create({ email, name: `${user.firstName} ${user.lastName}` });
            const currency = (pi?.currency || 'aed');
            await stripe.invoiceItems.create({ customer: customer.id, amount: Math.round(amount * 100), currency, description: 'Wallet Top-up' });
            const invoice = await stripe.invoices.create({ customer: customer.id, auto_advance: true, collection_method: 'send_invoice' });
            await stripe.invoices.finalizeInvoice(invoice.id);
            await stripe.invoices.sendInvoice(invoice.id);
          }
        } catch (e) {
          console.warn('Invoice creation (PI) failed:', e?.message || e);
        }
      }
    }

    // If you use Hosted Invoices directly, we can also react to invoice.paid
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      const amount = (invoice.amount_paid ?? 0) / 100;
      const email = invoice.customer_email || invoice.customer_email?.toLowerCase?.();
      if (amount > 0 && email) {
        const User = require('../models/User');
        const user = await User.findOne({ email });
        if (user) {
          user.cashBalance = (user.cashBalance || 0) + amount;
          user.cashCurrency = (invoice.currency || 'aed').toUpperCase();
          await user.save();
        }
      }
    }

    await StripeEvent.create({ eventId: event.id, type: event.type, payload: event });
    res.json({ received: true });
  } catch (e) {
    console.error('Webhook handler error:', e);
    res.status(500).send('Webhook handler failed');
  }
}

module.exports = { router, webhookHandler };


