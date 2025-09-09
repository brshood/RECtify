const Stripe = require('stripe');
const Order = require('../models/Order');
const RECHolding = require('../models/RECHolding');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Export a single handler so server can mount it with express.raw before JSON parser
module.exports = async function paymentsWebhook(req, res) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('Stripe webhook called but STRIPE keys are not configured');
      return res.status(200).send('[noop]');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status !== 'paid') {
        return res.status(200).send('Ignored: not paid');
      }

      const md = session.metadata || {};
      const userId = md.userId;
      if (!userId) {
        console.warn('Checkout session missing userId in metadata');
        return res.status(200).send('Missing userId');
      }

      // Build order from metadata
      const orderFields = {
        facilityName: md.facilityName,
        facilityId: md.facilityId,
        energyType: md.energyType,
        vintage: parseInt(md.vintage, 10),
        quantity: parseFloat(md.quantity),
        price: parseFloat(md.price),
        emirate: md.emirate,
        purpose: md.purpose
      };

      // Basic validation
      const required = ['facilityName','facilityId','energyType','vintage','quantity','price','emirate','purpose'];
      for (const key of required) {
        if (orderFields[key] === undefined || orderFields[key] === null || orderFields[key] === '' || Number.isNaN(orderFields[key])) {
          console.warn('Invalid/missing order field from metadata:', key);
          return res.status(200).send('Invalid metadata');
        }
      }

      const user = await User.findById(userId);
      if (!user) {
        console.warn('User not found for webhook order creation:', userId);
        return res.status(200).send('User not found');
      }

      // Create order similar to POST /orders/buy
      const order = new Order({
        userId: userId,
        orderType: 'buy',
        facilityName: orderFields.facilityName,
        facilityId: orderFields.facilityId,
        energyType: orderFields.energyType,
        vintage: orderFields.vintage,
        quantity: orderFields.quantity,
        remainingQuantity: orderFields.quantity,
        price: orderFields.price,
        totalValue: orderFields.quantity * orderFields.price,
        emirate: orderFields.emirate,
        purpose: orderFields.purpose,
        certificationStandard: 'I-REC',
        allowPartialFill: true,
        minFillQuantity: 1,
        createdBy: `${user.firstName} ${user.lastName}`
      });

      await order.save();

      // Try to match with existing sell orders (traditional matching)
      let matchedQuantity = 0;
      try {
        const matchingOrders = await Order.findMatchingOrders(order);
        for (const sellOrder of matchingOrders) {
          if (matchedQuantity >= order.remainingQuantity) break;
          const matchQty = Math.min(order.remainingQuantity - matchedQuantity, sellOrder.remainingQuantity);
          if (matchQty >= Math.max(order.minFillQuantity, sellOrder.minFillQuantity)) {
            await traditionalMatch(order, sellOrder, matchQty);
            matchedQuantity += matchQty;
          }
        }
      } catch (e) {
        console.error('Matching failed during webhook:', e.message);
      }

      return res.status(200).json({ success: true, orderId: order._id, matchedQuantity });
    }

    // Other event types can be acknowledged
    return res.status(200).send('ok');
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).send('Server error');
  }
};

// Minimal traditional matching copied from orders route
async function traditionalMatch(buyOrder, sellOrder, matchQuantity) {
  const transaction = new Transaction({
    buyerId: buyOrder.userId,
    sellerId: sellOrder.userId,
    buyOrderId: buyOrder._id,
    sellOrderId: sellOrder._id,
    facilityName: sellOrder.facilityName,
    facilityId: sellOrder.facilityId,
    energyType: sellOrder.energyType,
    vintage: sellOrder.vintage,
    emirate: sellOrder.emirate,
    certificationStandard: sellOrder.certificationStandard,
    quantity: matchQuantity,
    pricePerUnit: sellOrder.price,
    totalAmount: matchQuantity * sellOrder.price,
    buyerPlatformFee: matchQuantity * sellOrder.price * 0.02,
    sellerPlatformFee: matchQuantity * sellOrder.price * 0.02,
    blockchainFee: 5.00,
    status: 'completed',
    settlementStatus: 'completed',
    settlementDate: new Date()
  });

  await transaction.save();

  await buyOrder.fillPartial(matchQuantity);
  await sellOrder.fillPartial(matchQuantity);

  const sellerHolding = await RECHolding.findById(sellOrder.holdingId);
  if (sellerHolding && sellerHolding.quantity >= matchQuantity) {
    sellerHolding.quantity -= matchQuantity;
    if (sellerHolding.quantity === 0) {
      await RECHolding.findByIdAndDelete(sellerHolding._id);
    } else {
      await sellerHolding.save();
    }

    let buyerHolding = await RECHolding.findOne({
      userId: buyOrder.userId,
      facilityId: sellOrder.facilityId,
      energyType: sellOrder.energyType,
      vintage: sellOrder.vintage,
      certificationStandard: sellOrder.certificationStandard
    });

    if (buyerHolding) {
      const newTotalQuantity = buyerHolding.quantity + matchQuantity;
      const newTotalValue = buyerHolding.totalValue + (matchQuantity * sellOrder.price);
      buyerHolding.quantity = newTotalQuantity;
      buyerHolding.averagePurchasePrice = newTotalValue / newTotalQuantity;
      buyerHolding.totalValue = newTotalValue;
      await buyerHolding.save();
    } else {
      buyerHolding = new RECHolding({
        userId: buyOrder.userId,
        facilityName: sellOrder.facilityName,
        facilityId: sellOrder.facilityId,
        energyType: sellOrder.energyType,
        vintage: sellOrder.vintage,
        quantity: matchQuantity,
        averagePurchasePrice: sellOrder.price,
        totalValue: matchQuantity * sellOrder.price,
        emirate: sellOrder.emirate,
        certificationStandard: sellOrder.certificationStandard
      });
      await buyerHolding.save();
    }

    const buyerSummary = await RECHolding.getUserTotalRECs(buyOrder.userId);
    await User.findByIdAndUpdate(buyOrder.userId, {
      totalRecs: buyerSummary.totalQuantity,
      portfolioValue: buyerSummary.totalValue
    });

    const sellerSummary = await RECHolding.getUserTotalRECs(sellOrder.userId);
    await User.findByIdAndUpdate(sellOrder.userId, {
      totalRecs: sellerSummary.totalQuantity,
      portfolioValue: sellerSummary.totalValue
    });
  }
}

