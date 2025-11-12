const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function makeUserAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri || mongoUri.trim() === '') {
      console.error('❌ MONGODB_URI is not set or is empty in .env file');
      console.error('💡 The backend server must be using a different connection method');
      console.error('💡 Trying to use the same connection as the running server...');
      
      // Try to connect using a default local connection
      console.log('🌱 Attempting connection to local MongoDB...');
      try {
        await mongoose.connect('mongodb://localhost:27017/rectify');
        console.log('✅ Connected to local MongoDB');
      } catch (localError) {
        console.error('❌ Could not connect to local MongoDB either');
        console.error('💡 Please ensure:');
        console.error('   1. MongoDB is running locally, OR');
        console.error('   2. Add MONGODB_URI to backend/.env file');
        console.error('   3. Or provide the connection string');
        process.exit(1);
      }
    } else {
      if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
        console.error('❌ Invalid MongoDB connection string format');
        process.exit(1);
      }
      
      console.log('🌱 Connecting to MongoDB...');
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
    }

    const adminEmail = 'team@rectifygo.com';

    // Find the user
    const user = await User.findOne({ email: adminEmail });
    
    if (!user) {
      console.error(`❌ User with email ${adminEmail} not found`);
      console.error('💡 Please create the user first through the registration form');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Update user to admin
    user.role = 'admin';
    user.tier = 'enterprise';
    user.verificationStatus = 'verified';
    user.isActive = true;
    user.emailVerified = true;
    
    // Set admin permissions
    user.permissions = {
      canTrade: true,
      canRegisterFacilities: true,
      canViewAnalytics: true,
      canExportReports: true,
      canManageUsers: true
    };

    await user.save();

    console.log('✅ User updated to admin successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`🏢 Tier: ${user.tier}`);
    console.log('\nYou can now login with this account and access the Admin interface.');

  } catch (error) {
    console.error('❌ Error updating user to admin:', error.message);
    if (error.message.includes('MongoParseError') || error.message.includes('Invalid scheme')) {
      console.error('\n💡 Tip: Make sure MONGODB_URI is set in your .env file');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

makeUserAdmin();

