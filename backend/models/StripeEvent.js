const mongoose = require('mongoose');

const stripeEventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true, index: true, required: true },
  type: { type: String, required: true },
  processed: { type: Boolean, default: false }, // Changed from processedAt
  processedAt: { type: Date },
  data: { type: Object }, // Changed from payload for consistency
  payload: { type: Object } // Keep for backward compatibility
}, { timestamps: true });

module.exports = mongoose.model('StripeEvent', stripeEventSchema);


