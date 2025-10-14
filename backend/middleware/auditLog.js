const AuditLog = require('../models/AuditLog');

/**
 * Audit logging middleware factory
 * Creates middleware that logs specific actions to the audit trail
 * 
 * @param {string} action - The action being performed (e.g., 'ORDER_CREATE')
 * @param {string} entityType - The type of entity (e.g., 'Order')
 * @param {object} options - Additional options
 * @returns {Function} Express middleware
 */
const auditLog = (action, entityType, options = {}) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);
    
    // Override res.json to capture response and log
    res.json = function(body) {
      // Only log successful operations (status < 400) unless configured otherwise
      const shouldLog = options.logErrors ? true : res.statusCode < 400;
      
      if (shouldLog) {
        // Create audit log entry (async, don't block response)
        setImmediate(async () => {
          try {
            const auditData = {
              userId: req.user?.userId || null,
              action,
              entityType,
              entityId: res.locals.entityId || body?.data?.id || body?.id || null,
              metadata: {
                // Include relevant request data
                ...(options.includeBody ? { requestBody: sanitizeBody(req.body) } : {}),
                ...(options.includeParams ? { params: req.params } : {}),
                ...(options.includeQuery ? { query: req.query } : {}),
                // Include custom metadata if provided
                ...(res.locals.auditMetadata || {}),
                // Include response summary
                statusCode: res.statusCode,
                success: res.statusCode < 400
              },
              ipAddress: req.ip || req.connection?.remoteAddress,
              userAgent: req.get('user-agent'),
              method: req.method,
              endpoint: req.originalUrl || req.url,
              statusCode: res.statusCode,
              success: res.statusCode < 400,
              errorMessage: body?.message && res.statusCode >= 400 ? body.message : undefined,
              timestamp: new Date()
            };

            await AuditLog.create(auditData);
          } catch (error) {
            // Don't let audit logging errors break the application
            console.error('Audit logging error:', error.message);
          }
        });
      }
      
      // Call original res.json with the body
      return originalJson(body);
    };
    
    next();
  };
};

/**
 * Sanitize request body to remove sensitive data from audit logs
 */
function sanitizeBody(body) {
  if (!body) return {};
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'resetCode', 'cvv', 'cardNumber', 'pin'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Helper to set audit metadata in route handlers
 * Usage in route: res.locals.auditMetadata = { orderId: order._id, amount: 1000 };
 */
const setAuditMetadata = (res, metadata) => {
  res.locals.auditMetadata = {
    ...(res.locals.auditMetadata || {}),
    ...metadata
  };
};

/**
 * Helper to set entity ID for audit logs
 * Usage in route: res.locals.entityId = order._id;
 */
const setEntityId = (res, entityId) => {
  res.locals.entityId = entityId;
};

/**
 * Query audit logs by user
 */
const getAuditLogsByUser = async (userId, options = {}) => {
  const {
    limit = 100,
    skip = 0,
    action = null,
    startDate = null,
    endDate = null
  } = options;
  
  const query = { userId };
  
  if (action) {
    query.action = action;
  }
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return await AuditLog.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

/**
 * Query audit logs by entity
 */
const getAuditLogsByEntity = async (entityType, entityId, options = {}) => {
  const { limit = 100, skip = 0 } = options;
  
  return await AuditLog.find({ entityType, entityId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

module.exports = {
  auditLog,
  setAuditMetadata,
  setEntityId,
  getAuditLogsByUser,
  getAuditLogsByEntity
};

