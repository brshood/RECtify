const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri || mongoUri.trim() === '') {
      console.error('❌ MONGODB_URI is not set or is empty in .env file');
      console.error('💡 Please check your backend/.env file and ensure MONGODB_URI is set');
      process.exit(1);
    }
    
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      console.error('❌ Invalid MongoDB connection string format');
      console.error('💡 Connection string must start with "mongodb://" or "mongodb+srv://"');
      console.error(`   Current value starts with: ${mongoUri.substring(0, 20)}...`);
      process.exit(1);
    }
    
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'team@rectifygo.com';
    const adminPassword = 'Admin2024!Secure';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`⚠️  Admin account already exists: ${adminEmail}`);
      console.log('   If you want to update it, delete it first or change the email.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
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
      permissions: {
        canTrade: true,
        canRegisterFacilities: true,
        canViewAnalytics: true,
        canExportReports: true,
        canManageUsers: true
      },
      verificationStatus: 'verified',
      isActive: true,
      emailVerified: true
    });

    await adminUser.save();

    console.log('✅ Admin account created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    if (error.message.includes('MongoParseError') || error.message.includes('Invalid scheme')) {
      console.error('\n💡 Tip: Make sure MONGODB_URI is set in your .env file');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createAdmin();

