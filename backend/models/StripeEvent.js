const mongoose = require('mongoose');

const stripeEventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true, index: true, required: true },
  type: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
  payload: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('StripeEvent', stripeEventSchema);


