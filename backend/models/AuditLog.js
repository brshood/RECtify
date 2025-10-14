const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // User who performed the action
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  
  // Action performed
  action: { 
    type: String, 
    required: true,
    enum: [
      // Order actions
      'ORDER_CREATE', 'ORDER_CANCEL', 'ORDER_MATCH', 'ORDER_UPDATE',
      // Transaction actions
      'TRANSACTION_CREATE', 'TRANSACTION_SETTLE', 'TRANSACTION_FAIL',
      // REC actions
      'REC_TRANSFER', 'REC_REGISTER', 'REC_RETIRE',
      // Payment actions
      'PAYMENT_DEPOSIT', 'PAYMENT_WITHDRAW', 'PAYMENT_REFUND',
      // Holdings actions
      'HOLDING_CREATE', 'HOLDING_UPDATE', 'HOLDING_DELETE',
      // User actions
      'USER_LOGIN', 'USER_REGISTER', 'USER_UPDATE', 'USER_DELETE',
      // Security actions
      'PASSWORD_RESET', 'PASSWORD_CHANGE', 'EMAIL_VERIFY',
      // Admin actions
      'ADMIN_ACTION', 'COMPLIANCE_CHECK'
    ],
    index: true
  },
  
  // Type of entity affected
  entityType: { 
    type: String,
    enum: ['Order', 'Transaction', 'Holding', 'User', 'Payment', 'System']
  },
  
  // ID of the affected entity
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  // Additional metadata about the action
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Request details
  ipAddress: String,
  userAgent: String,
  
  // HTTP details
  method: String,
  endpoint: String,
  statusCode: Number,
  
  // Success/failure
  success: { 
    type: Boolean, 
    default: true 
  },
  
  // Error details if action failed
  errorMessage: String,
  
  // Timestamp
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  }
}, {
  // Options
  timestamps: false // We use custom timestamp field
});

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

// TTL index - automatically delete logs older than 90 days (optional, for data retention)
// Uncomment if you want automatic log expiration
// auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

