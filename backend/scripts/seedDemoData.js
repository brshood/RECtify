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
    password: 'Demo2024!Secure',
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
    password: 'Demo2024!Secure',
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
    password: 'Demo2024!Secure',
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
  // Ahmed Al Mansouri's holdings - Active Trader Portfolio
  {
    userEmail: 'ahmed.trader@example.com',
    facilityName: 'Mohammed bin Rashid Al Maktoum Solar Park',
    facilityId: 'maktoum-solar-park-phase4',
    energyType: 'solar',
    vintage: 2024,
    quantity: 1250,
    averagePurchasePrice: 165.50,
    emirate: 'Dubai',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'ahmed.trader@example.com',
    facilityName: 'Al Dhafra Solar Farm',
    facilityId: 'al-dhafra-solar-farm',
    energyType: 'solar',
    vintage: 2024,
    quantity: 820,
    averagePurchasePrice: 167.25,
    emirate: 'Abu Dhabi',
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
    quantity: 650,
    averagePurchasePrice: 172.00,
    emirate: 'Dubai',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'ahmed.trader@example.com',
    facilityName: 'Sweihan Solar Park',
    facilityId: 'sweihan-solar-park',
    energyType: 'solar',
    vintage: 2024,
    quantity: 580,
    averagePurchasePrice: 164.80,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'ahmed.trader@example.com',
    facilityName: 'Noor Abu Dhabi Solar Plant',
    facilityId: 'noor-abu-dhabi-solar',
    energyType: 'solar',
    vintage: 2024,
    quantity: 430,
    averagePurchasePrice: 163.50,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC'
  },
  // Fatima Al Zahra's holdings - Large Facility Owner Portfolio
  {
    userEmail: 'fatima.energy@example.com',
    facilityName: 'Barakah Nuclear Power Plant',
    facilityId: 'barakah-nuclear-plant',
    energyType: 'nuclear',
    vintage: 2024,
    quantity: 2500,
    averagePurchasePrice: 158.75,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'fatima.energy@example.com',
    facilityName: 'Barakah Nuclear Power Plant',
    facilityId: 'barakah-nuclear-plant',
    energyType: 'nuclear',
    vintage: 2023,
    quantity: 1800,
    averagePurchasePrice: 161.20,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'fatima.energy@example.com',
    facilityName: 'Noor Abu Dhabi Solar Plant',
    facilityId: 'noor-abu-dhabi-solar',
    energyType: 'solar',
    vintage: 2024,
    quantity: 1350,
    averagePurchasePrice: 162.30,
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
    averagePurchasePrice: 165.80,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC'
  },
  {
    userEmail: 'fatima.energy@example.com',
    facilityName: 'Shams Solar Power Station',
    facilityId: 'shams-solar-power-station',
    energyType: 'solar',
    vintage: 2024,
    quantity: 920,
    averagePurchasePrice: 169.40,
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
  {
    userEmail: 'fatima.energy@example.com',
    facilityName: 'Al Dhafra Solar Farm',
    facilityId: 'al-dhafra-solar-farm',
    energyType: 'solar',
    vintage: 2024,
    quantity: 1100,
    averagePurchasePrice: 166.90,
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

// Demo orders data - Live active orders
const demoOrders = [
  // Ahmed's Buy Orders - Active Trader
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
    certificationStandard: 'I-REC',
    status: 'pending'
  },
  {
    userEmail: 'ahmed.trader@example.com',
    orderType: 'buy',
    facilityName: 'Barakah Nuclear Power Plant',
    facilityId: 'barakah-nuclear-plant',
    energyType: 'nuclear',
    vintage: 2024,
    quantity: 750,
    price: 160.00,
    emirate: 'Abu Dhabi',
    purpose: 'voluntary',
    certificationStandard: 'I-REC',
    status: 'pending'
  },
  {
    userEmail: 'ahmed.trader@example.com',
    orderType: 'buy',
    facilityName: 'Mohammed bin Rashid Al Maktoum Solar Park',
    facilityId: 'maktoum-solar-park-phase4',
    energyType: 'solar',
    vintage: 2024,
    quantity: 300,
    price: 166.00,
    emirate: 'Dubai',
    purpose: 'trading',
    certificationStandard: 'I-REC',
    status: 'pending'
  },
  {
    userEmail: 'ahmed.trader@example.com',
    orderType: 'buy',
    facilityName: 'Noor Abu Dhabi Solar Plant',
    facilityId: 'noor-abu-dhabi-solar',
    energyType: 'solar',
    vintage: 2024,
    quantity: 400,
    price: 163.75,
    emirate: 'Abu Dhabi',
    purpose: 'trading',
    certificationStandard: 'I-REC',
    status: 'pending'
  },
  // Fatima's Sell Orders - Large Facility Owner
  {
    userEmail: 'fatima.energy@example.com',
    orderType: 'sell',
    quantity: 500,
    price: 169.50,
    status: 'pending'
  },
  {
    userEmail: 'fatima.energy@example.com',
    orderType: 'sell',
    quantity: 800,
    price: 168.75,
    status: 'pending'
  },
  {
    userEmail: 'fatima.energy@example.com',
    orderType: 'sell',
    quantity: 350,
    price: 170.00,
    status: 'pending'
  },
  {
    userEmail: 'fatima.energy@example.com',
    orderType: 'sell',
    quantity: 600,
    price: 167.50,
    status: 'pending'
  },
  // Fatima's Buy Orders (she also buys sometimes)
  {
    userEmail: 'fatima.energy@example.com',
    orderType: 'buy',
    facilityName: 'Dubai Wind Farm',
    facilityId: 'dubai-wind-farm',
    energyType: 'wind',
    vintage: 2024,
    quantity: 400,
    price: 171.00,
    emirate: 'Dubai',
    purpose: 'compliance',
    certificationStandard: 'I-REC',
    status: 'pending'
  },
  // Mohammed's Orders
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
    purpose: 'compliance',
    certificationStandard: 'I-REC',
    status: 'pending'
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
            status: orderData.status || 'pending',
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
              status: orderData.status || 'pending',
              createdBy: `${user.firstName} ${user.lastName}`
            });
            await order.save();
            console.log(`   ✓ Created sell order: ${orderData.quantity} MWh @ AED ${orderData.price} by ${user.firstName}`);
          }
        }
      }
    }

    // Create comprehensive demo transactions showing monthly trading activity
    console.log('💱 Creating demo transactions...');
    const ahmed = createdUsers['ahmed.trader@example.com'];
    const fatima = createdUsers['fatima.energy@example.com'];
    const mohammed = createdUsers['mohammed.compliance@example.com'];
    
    if (ahmed && fatima) {
      const fatimaHoldings = await RECHolding.find({ userId: fatima._id }).limit(3);
      
      if (fatimaHoldings.length > 0) {
        const now = new Date();
        const transactions = [];
        
        // Month 1 (90-120 days ago) - 3 transactions
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[0].facilityName,
          facilityId: fatimaHoldings[0].facilityId,
          energyType: fatimaHoldings[0].energyType,
          vintage: fatimaHoldings[0].vintage,
          emirate: fatimaHoldings[0].emirate,
          certificationStandard: fatimaHoldings[0].certificationStandard,
          quantity: 250,
          pricePerUnit: 164.50,
          totalAmount: 250 * 164.50,
          buyerPlatformFee: 250 * 164.50 * 0.02,
          sellerPlatformFee: 250 * 164.50 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 105 * 24 * 60 * 60 * 1000)
        });
        
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[1].facilityName,
          facilityId: fatimaHoldings[1].facilityId,
          energyType: fatimaHoldings[1].energyType,
          vintage: fatimaHoldings[1].vintage,
          emirate: fatimaHoldings[1].emirate,
          certificationStandard: fatimaHoldings[1].certificationStandard,
          quantity: 180,
          pricePerUnit: 166.25,
          totalAmount: 180 * 166.25,
          buyerPlatformFee: 180 * 166.25 * 0.02,
          sellerPlatformFee: 180 * 166.25 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000)
        });
        
        // Month 2 (60-90 days ago) - 4 transactions
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[0].facilityName,
          facilityId: fatimaHoldings[0].facilityId,
          energyType: fatimaHoldings[0].energyType,
          vintage: fatimaHoldings[0].vintage,
          emirate: fatimaHoldings[0].emirate,
          certificationStandard: fatimaHoldings[0].certificationStandard,
          quantity: 320,
          pricePerUnit: 165.75,
          totalAmount: 320 * 165.75,
          buyerPlatformFee: 320 * 165.75 * 0.02,
          sellerPlatformFee: 320 * 165.75 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000)
        });
        
        if (mohammed) {
          transactions.push({
            buyerId: mohammed._id,
            sellerId: fatima._id,
            buyOrderId: new mongoose.Types.ObjectId(),
            sellOrderId: new mongoose.Types.ObjectId(),
            facilityName: fatimaHoldings[1].facilityName,
            facilityId: fatimaHoldings[1].facilityId,
            energyType: fatimaHoldings[1].energyType,
            vintage: fatimaHoldings[1].vintage,
            emirate: fatimaHoldings[1].emirate,
            certificationStandard: fatimaHoldings[1].certificationStandard,
            quantity: 150,
            pricePerUnit: 167.00,
            totalAmount: 150 * 167.00,
            buyerPlatformFee: 150 * 167.00 * 0.02,
            sellerPlatformFee: 150 * 167.00 * 0.02,
            blockchainFee: 5.00,
            status: 'completed',
            settlementStatus: 'completed',
            completedAt: new Date(now.getTime() - 68 * 24 * 60 * 60 * 1000)
          });
        }
        
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[2].facilityName,
          facilityId: fatimaHoldings[2].facilityId,
          energyType: fatimaHoldings[2].energyType,
          vintage: fatimaHoldings[2].vintage,
          emirate: fatimaHoldings[2].emirate,
          certificationStandard: fatimaHoldings[2].certificationStandard,
          quantity: 200,
          pricePerUnit: 168.50,
          totalAmount: 200 * 168.50,
          buyerPlatformFee: 200 * 168.50 * 0.02,
          sellerPlatformFee: 200 * 168.50 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 62 * 24 * 60 * 60 * 1000)
        });
        
        // Month 3 (30-60 days ago) - 5 transactions
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[0].facilityName,
          facilityId: fatimaHoldings[0].facilityId,
          energyType: fatimaHoldings[0].energyType,
          vintage: fatimaHoldings[0].vintage,
          emirate: fatimaHoldings[0].emirate,
          certificationStandard: fatimaHoldings[0].certificationStandard,
          quantity: 280,
          pricePerUnit: 166.00,
          totalAmount: 280 * 166.00,
          buyerPlatformFee: 280 * 166.00 * 0.02,
          sellerPlatformFee: 280 * 166.00 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000)
        });
        
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[1].facilityName,
          facilityId: fatimaHoldings[1].facilityId,
          energyType: fatimaHoldings[1].energyType,
          vintage: fatimaHoldings[1].vintage,
          emirate: fatimaHoldings[1].emirate,
          certificationStandard: fatimaHoldings[1].certificationStandard,
          quantity: 350,
          pricePerUnit: 167.25,
          totalAmount: 350 * 167.25,
          buyerPlatformFee: 350 * 167.25 * 0.02,
          sellerPlatformFee: 350 * 167.25 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
        });
        
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[2].facilityName,
          facilityId: fatimaHoldings[2].facilityId,
          energyType: fatimaHoldings[2].energyType,
          vintage: fatimaHoldings[2].vintage,
          emirate: fatimaHoldings[2].emirate,
          certificationStandard: fatimaHoldings[2].certificationStandard,
          quantity: 220,
          pricePerUnit: 165.50,
          totalAmount: 220 * 165.50,
          buyerPlatformFee: 220 * 165.50 * 0.02,
          sellerPlatformFee: 220 * 165.50 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 38 * 24 * 60 * 60 * 1000)
        });
        
        // Current month (0-30 days ago) - 6 transactions
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[0].facilityName,
          facilityId: fatimaHoldings[0].facilityId,
          energyType: fatimaHoldings[0].energyType,
          vintage: fatimaHoldings[0].vintage,
          emirate: fatimaHoldings[0].emirate,
          certificationStandard: fatimaHoldings[0].certificationStandard,
          quantity: 400,
          pricePerUnit: 168.00,
          totalAmount: 400 * 168.00,
          buyerPlatformFee: 400 * 168.00 * 0.02,
          sellerPlatformFee: 400 * 168.00 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
        });
        
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[1].facilityName,
          facilityId: fatimaHoldings[1].facilityId,
          energyType: fatimaHoldings[1].energyType,
          vintage: fatimaHoldings[1].vintage,
          emirate: fatimaHoldings[1].emirate,
          certificationStandard: fatimaHoldings[1].certificationStandard,
          quantity: 300,
          pricePerUnit: 169.50,
          totalAmount: 300 * 169.50,
          buyerPlatformFee: 300 * 169.50 * 0.02,
          sellerPlatformFee: 300 * 169.50 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        });
        
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[2].facilityName,
          facilityId: fatimaHoldings[2].facilityId,
          energyType: fatimaHoldings[2].energyType,
          vintage: fatimaHoldings[2].vintage,
          emirate: fatimaHoldings[2].emirate,
          certificationStandard: fatimaHoldings[2].certificationStandard,
          quantity: 275,
          pricePerUnit: 167.75,
          totalAmount: 275 * 167.75,
          buyerPlatformFee: 275 * 167.75 * 0.02,
          sellerPlatformFee: 275 * 167.75 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
        });
        
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[0].facilityName,
          facilityId: fatimaHoldings[0].facilityId,
          energyType: fatimaHoldings[0].energyType,
          vintage: fatimaHoldings[0].vintage,
          emirate: fatimaHoldings[0].emirate,
          certificationStandard: fatimaHoldings[0].certificationStandard,
          quantity: 180,
          pricePerUnit: 168.25,
          totalAmount: 180 * 168.25,
          buyerPlatformFee: 180 * 168.25 * 0.02,
          sellerPlatformFee: 180 * 168.25 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
        });
        
        transactions.push({
          buyerId: ahmed._id,
          sellerId: fatima._id,
          buyOrderId: new mongoose.Types.ObjectId(),
          sellOrderId: new mongoose.Types.ObjectId(),
          facilityName: fatimaHoldings[1].facilityName,
          facilityId: fatimaHoldings[1].facilityId,
          energyType: fatimaHoldings[1].energyType,
          vintage: fatimaHoldings[1].vintage,
          emirate: fatimaHoldings[1].emirate,
          certificationStandard: fatimaHoldings[1].certificationStandard,
          quantity: 230,
          pricePerUnit: 166.50,
          totalAmount: 230 * 166.50,
          buyerPlatformFee: 230 * 166.50 * 0.02,
          sellerPlatformFee: 230 * 166.50 * 0.02,
          blockchainFee: 5.00,
          status: 'completed',
          settlementStatus: 'completed',
          completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        });
        
        // Save all transactions
        for (const txData of transactions) {
          const transaction = new Transaction(txData);
        await transaction.save();
        }
        
        console.log(`   ✓ Created ${transactions.length} demo transactions with monthly distribution`);
      }
    }

    console.log('🎉 Demo data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users created: ${Object.keys(createdUsers).length}`);
    console.log(`   Holdings created: ${demoHoldings.length}`);
    console.log(`   Orders created: ${demoOrders.length}`);
    
    // Count transactions
    const txCount = await Transaction.countDocuments();
    console.log(`   Transactions created: ${txCount}`);
    
    console.log('\n🔑 Demo user credentials:');
    demoUsers.forEach(user => {
      console.log(`   ${user.firstName} ${user.lastName}: ${user.email} / Demo2024!Secure`);
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
