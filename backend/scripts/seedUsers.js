const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const demoUsers = [
  {
    email: 'ahmed.alshamsi@adnoc.ae',
    password: 'Demo2024!Secure',
    firstName: 'Ahmed',
    lastName: 'Al Shamsi',
    company: 'ADNOC Clean Energy',
    role: 'facility-owner',
    tier: 'enterprise',
    emirate: 'Abu Dhabi',
    preferences: {
      currency: 'AED',
      language: 'en',
      notifications: true,
      darkMode: false,
      dashboardLayout: 'detailed'
    },
    portfolioValue: 2456789,
    totalRecs: 15420,
    verificationStatus: 'verified'
  },
  {
    email: 'fatima.hassan@masdar.ae',
    password: 'Demo2024!Secure',
    firstName: 'Fatima',
    lastName: 'Hassan',
    company: 'Masdar City',
    role: 'trader',
    tier: 'premium',
    emirate: 'Abu Dhabi',
    preferences: {
      currency: 'USD',
      language: 'en',
      notifications: true,
      darkMode: true,
      dashboardLayout: 'compact'
    },
    portfolioValue: 856432,
    totalRecs: 4250,
    verificationStatus: 'verified'
  },
  {
    email: 'omar.khalil@dewa.gov.ae',
    password: 'Demo2024!Secure',
    firstName: 'Omar',
    lastName: 'Khalil',
    company: 'Dubai Electricity & Water Authority',
    role: 'compliance-officer',
    tier: 'enterprise',
    emirate: 'Dubai',
    preferences: {
      currency: 'AED',
      language: 'en',
      notifications: true,
      darkMode: false,
      dashboardLayout: 'default'
    },
    portfolioValue: 0,
    totalRecs: 0,
    verificationStatus: 'verified'
  },
  {
    email: 'demo@rectify.ae',
    password: 'Demo2024!Secure',
    firstName: 'Guest',
    lastName: 'User',
    company: 'RECtify Demo',
    role: 'trader',
    tier: 'basic',
    emirate: 'Dubai',
    preferences: {
      currency: 'AED',
      language: 'en',
      notifications: false,
      darkMode: false,
      dashboardLayout: 'default'
    },
    portfolioValue: 45231,
    totalRecs: 1234,
    verificationStatus: 'pending'
  }
];

async function seedUsers() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing demo users...');
    await User.deleteMany({ email: { $in: demoUsers.map(u => u.email) } });

    console.log('👥 Creating demo users...');
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email}`);
    }

    console.log('🎉 Demo users seeded successfully!');
    console.log('\nDemo Credentials:');
    demoUsers.forEach(user => {
      console.log(`📧 ${user.email} | 🔑 ${user.password} | 👤 ${user.role} | 🏢 ${user.tier}`);
    });

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedUsers();
