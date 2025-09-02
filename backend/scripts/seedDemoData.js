const mongoose = require('mongoose');
const User = require('../models/User');
const RECHolding = require('../models/RECHolding');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
require('dotenv').config();

// Demo users data
const demoUsers = [
  {
    email: 'ahmed.trader@example.com',
    password: 'password123',
    firstName: 'Ahmed',
    lastName: 'Al Mansouri',
    company: 'Emirates Solar Trading LLC',
    role: 'trader',
    tier: 'premium',
    emirate: 'Dubai',
    preferences: {
      currency: 'AED',
      language: 'en',
      notifications: true,
      darkMode: false,
      dashboardLayout: 'default'
    }
  },
  {
    email: 'fatima.energy@example.com',
    password: 'password123',
    firstName: 'Fatima',
    lastName: 'Al Zahra',
    company: 'Green Energy Solutions',
    role: 'facility-owner',
    tier: 'enterprise',
    emirate: 'Abu Dhabi',
    preferences: {
      currency: 'AED',
      language: 'en',
      notifications: true,
      darkMode: false,
      dashboardLayout: 'detailed'
    }
  },
  {
    email: 'mohammed.compliance@example.com',
    password: 'password123',
    firstName: 'Mohammed',
    lastName: 'Al Rashid',
    company: 'Sustainable Industries Corp',
    role: 'compliance-officer',
    tier: 'basic',
    emirate: 'Sharjah',
    preferences: {
      currency: 'AED',
      language: 'en',
      notifications: true,
      darkMode: true,
      dashboardLayout: 'compact'
    }
  }
];

// Demo holdings data
const demoHoldings = [
  // Ahmed's holdings
  {
    userEmail: 'ahmed.trader@example.com',
    facilityName: 'Mohammed bin Rashid Al Maktoum Solar Park',
    facilityId: 'maktoum-solar-park-phase4',
    energyType: 'solar',
    vintage: 2024,
    quantity: 850,
    averagePurchasePrice: 165.50,
    emirate: 'Dubai',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'ahmed.trader@example.com',
    facilityName: 'Al Dhafra Solar Farm',
    facilityId: 'al-dhafra-solar-farm',
    energyType: 'solar',
    vintage: 2023,
    quantity: 420,
    averagePurchasePrice: 170.25,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'ahmed.trader@example.com',
    facilityName: 'Dubai Wind Farm',
    facilityId: 'dubai-wind-farm',
    energyType: 'wind',
    vintage: 2024,
    quantity: 300,
    averagePurchasePrice: 172.00,
    emirate: 'Dubai',
    certificationStandard: 'I-REC'
  },
  // Fatima's holdings
  {
    userEmail: 'fatima.energy@example.com',
    facilityName: 'Barakah Nuclear Power Plant',
    facilityId: 'barakah-nuclear-plant',
    energyType: 'nuclear',
    vintage: 2024,
    quantity: 1200,
    averagePurchasePrice: 158.75,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'fatima.energy@example.com',
    facilityName: 'Noor Abu Dhabi Solar Plant',
    facilityId: 'noor-abu-dhabi-solar',
    energyType: 'solar',
    vintage: 2023,
    quantity: 680,
    averagePurchasePrice: 162.30,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'fatima.energy@example.com',
    facilityName: 'Shams Solar Power Station',
    facilityId: 'shams-solar-power-station',
    energyType: 'solar',
    vintage: 2022,
    quantity: 350,
    averagePurchasePrice: 175.80,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC'
  },
  // Mohammed's holdings
  {
    userEmail: 'mohammed.compliance@example.com',
    facilityName: 'Sharjah Waste-to-Energy Plant',
    facilityId: 'sharjah-waste-to-energy',
    energyType: 'biomass',
    vintage: 2024,
    quantity: 150,
    averagePurchasePrice: 180.50,
    emirate: 'Sharjah',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'mohammed.compliance@example.com',
    facilityName: 'Dubai Clean Coal Plant',
    facilityId: 'dubai-clean-coal-plant',
    energyType: 'solar',
    vintage: 2023,
    quantity: 280,
    averagePurchasePrice: 168.90,
    emirate: 'Dubai',
    certificationStandard: 'I-REC'
  }
];

// Demo orders data
const demoOrders = [
  // Buy orders
  {
    userEmail: 'ahmed.trader@example.com',
    orderType: 'buy',
    facilityName: 'Sweihan Solar Park',
    facilityId: 'sweihan-solar-park',
    energyType: 'solar',
    vintage: 2024,
    quantity: 500,
    price: 168.50,
    emirate: 'Abu Dhabi',
    purpose: 'compliance',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'mohammed.compliance@example.com',
    orderType: 'buy',
    facilityName: 'Al Dhafra Solar Farm',
    facilityId: 'al-dhafra-solar-farm',
    energyType: 'solar',
    vintage: 2024,
    quantity: 200,
    price: 167.75,
    emirate: 'Abu Dhabi',
    purpose: 'voluntary',
    certificationStandard: 'I-REC'
  },
  // Sell orders
  {
    userEmail: 'fatima.energy@example.com',
    orderType: 'sell',
    quantity: 300,
    price: 169.25
  }
];

async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing demo data...');
    await User.deleteMany({ email: { $in: demoUsers.map(u => u.email) } });
    await RECHolding.deleteMany({});
    await Order.deleteMany({});
    await Transaction.deleteMany({});

    // Create demo users
    console.log('👥 Creating demo users...');
    const createdUsers = {};
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers[userData.email] = user;
      console.log(`   ✓ Created user: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }

    // Create demo holdings
    console.log('🏭 Creating demo holdings...');
    for (const holdingData of demoHoldings) {
      const user = createdUsers[holdingData.userEmail];
      if (user) {
        const holding = new RECHolding({
          userId: user._id,
          facilityName: holdingData.facilityName,
          facilityId: holdingData.facilityId,
          energyType: holdingData.energyType,
          vintage: holdingData.vintage,
          quantity: holdingData.quantity,
          averagePurchasePrice: holdingData.averagePurchasePrice,
          totalValue: holdingData.quantity * holdingData.averagePurchasePrice,
          emirate: holdingData.emirate,
          certificationStandard: holdingData.certificationStandard
        });
        await holding.save();
        console.log(`   ✓ Created holding: ${holdingData.quantity} MWh ${holdingData.energyType} for ${user.firstName}`);

        // Update user's totals
        const userSummary = await RECHolding.getUserTotalRECs(user._id);
        await User.findByIdAndUpdate(user._id, {
          totalRecs: userSummary.totalQuantity,
          portfolioValue: userSummary.totalValue
        });
      }
    }

    // Create demo orders
    console.log('📋 Creating demo orders...');
    for (const orderData of demoOrders) {
      const user = createdUsers[orderData.userEmail];
      if (user) {
        if (orderData.orderType === 'buy') {
          const order = new Order({
            userId: user._id,
            orderType: 'buy',
            facilityName: orderData.facilityName,
            facilityId: orderData.facilityId,
            energyType: orderData.energyType,
            vintage: orderData.vintage,
            quantity: orderData.quantity,
            remainingQuantity: orderData.quantity,
            price: orderData.price,
            totalValue: orderData.quantity * orderData.price,
            emirate: orderData.emirate,
            purpose: orderData.purpose,
            certificationStandard: orderData.certificationStandard,
            createdBy: `${user.firstName} ${user.lastName}`
          });
          await order.save();
          console.log(`   ✓ Created buy order: ${orderData.quantity} MWh @ AED ${orderData.price} by ${user.firstName}`);
        } else if (orderData.orderType === 'sell') {
          // Find a suitable holding for the sell order
          const holding = await RECHolding.findOne({ 
            userId: user._id,
            quantity: { $gte: orderData.quantity }
          });
          
          if (holding) {
            const order = new Order({
              userId: user._id,
              orderType: 'sell',
              facilityName: holding.facilityName,
              facilityId: holding.facilityId,
              energyType: holding.energyType,
              vintage: holding.vintage,
              quantity: orderData.quantity,
              remainingQuantity: orderData.quantity,
              price: orderData.price,
              totalValue: orderData.quantity * orderData.price,
              emirate: holding.emirate,
              certificationStandard: holding.certificationStandard,
              holdingId: holding._id,
              createdBy: `${user.firstName} ${user.lastName}`
            });
            await order.save();
            console.log(`   ✓ Created sell order: ${orderData.quantity} MWh @ AED ${orderData.price} by ${user.firstName}`);
          }
        }
      }
    }

    // Create some demo transactions
    console.log('💱 Creating demo transactions...');
    const ahmed = createdUsers['ahmed.trader@example.com'];
    const fatima = createdUsers['fatima.energy@example.com'];
    
    if (ahmed && fatima) {
      const ahmedHolding = await RECHolding.findOne({ userId: ahmed._id });
      const fatimaHolding = await RECHolding.findOne({ userId: fatima._id });
      
      if (ahmedHolding && fatimaHolding) {
        // Create a mock transaction
        const transaction = new Transaction({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(), // Mock order ID
          sellOrderId: new mongoose.Types.ObjectId(), // Mock order ID
          facilityName: fatimaHolding.facilityName,
          facilityId: fatimaHolding.facilityId,
          energyType: fatimaHolding.energyType,
          vintage: fatimaHolding.vintage,
          emirate: fatimaHolding.emirate,
          certificationStandard: fatimaHolding.certificationStandard,
          quantity: 100,
          pricePerUnit: 166.50,
          totalAmount: 100 * 166.50,
          buyerPlatformFee: 100 * 166.50 * 0.02,
          sellerPlatformFee: 100 * 166.50 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        });
        await transaction.save();
        console.log('   ✓ Created demo transaction between Ahmed and Fatima');
      }
    }

    console.log('🎉 Demo data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users created: ${Object.keys(createdUsers).length}`);
    console.log(`   Holdings created: ${demoHoldings.length}`);
    console.log(`   Orders created: ${demoOrders.length}`);
    console.log('   Transactions created: 1');
    
    console.log('\n🔑 Demo user credentials:');
    demoUsers.forEach(user => {
      console.log(`   ${user.firstName} ${user.lastName}: ${user.email} / password123`);
    });

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the seeding script
if (require.main === module) {
  seedDemoData();
}

module.exports = seedDemoData;
