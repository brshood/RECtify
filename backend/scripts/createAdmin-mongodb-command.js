// MongoDB Shell Command to Create Admin Account
// Run this in MongoDB shell or MongoDB Compass

// First, connect to your database, then run:

db.users.insertOne({
  email: 'team@rectifygo.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5Y', // This is a placeholder - you need to hash the password
  firstName: 'REC',
  lastName: 'Admin',
  company: 'RECtify',
  role: 'admin',
  tier: 'enterprise',
  emirate: 'Abu Dhabi',
  preferences: {
    currency: 'AED',
    language: 'en',
    notifications: true,
    darkMode: false,
    dashboardLayout: 'default'
  },
  verificationStatus: 'verified',
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// NOTE: The password above is a placeholder. You need to hash 'Admin2024!Secure' using bcrypt.
// The easiest way is to use the createAdmin.js script once the connection string is fixed,
// or use an online bcrypt generator and replace the password hash above.

