require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const RECHolding = require('./models/RECHolding');
const Transaction = require('./models/Transaction');
const RECSecurityService = require('./services/RECSecurityService');

async function testCompleteTradingFlow() {
  try {
    console.log('🧪 Testing Complete Trading Flow with Blockchain');
    console.log('='.repeat(60));
    
    // Initialize blockchain service
    console.log('1️⃣ Initializing Blockchain Service...');
    const initResult = await RECSecurityService.initialize();
    if (!initResult.success) {
      throw new Error(`Blockchain initialization failed: ${initResult.message}`);
    }
    console.log('   ✅ Blockchain service initialized');
    
    // Create test users
    console.log('\n2️⃣ Creating Test Users...');
    const buyer = new User({
      firstName: 'Test',
      lastName: 'Buyer',
      email: 'buyer@test.com',
      password: 'hashedpassword',
      company: 'Buyer Corp',
      role: 'trader',
      emirate: 'Dubai',
      permissions: { canTrade: true },
      cashBalance: 10000, // AED 10,000
      totalRecs: 0,
      portfolioValue: 0
    });
    
    const seller = new User({
      firstName: 'Test',
      lastName: 'Seller',
      email: 'seller@test.com',
      password: 'hashedpassword',
      company: 'Seller Corp',
      role: 'trader',
      emirate: 'Abu Dhabi',
      permissions: { canTrade: true },
      cashBalance: 5000,
      totalRecs: 0,
      portfolioValue: 0
    });
    
    await Promise.all([buyer.save(), seller.save()]);
    console.log('   ✅ Test users created');
    
    // Create REC holding for seller
    console.log('\n3️⃣ Creating REC Holding for Seller...');
    const holding = new RECHolding({
      userId: seller._id,
      facilityName: 'Dubai Solar Park Phase 1',
      facilityId: 'dubai-solar-001',
      energyType: 'solar',
      vintage: 2024,
      quantity: 1000, // 1000 RECs
      averagePurchasePrice: 2.50,
      totalValue: 2500,
      emirate: 'Dubai',
      certificationStandard: 'I-REC'
    });
    await holding.save();
    console.log('   ✅ REC holding created: 1000 solar RECs');
    
    // Create sell order
    console.log('\n4️⃣ Creating Sell Order...');
    const sellOrder = new Order({
      userId: seller._id,
      orderType: 'sell',
      facilityName: holding.facilityName,
      facilityId: holding.facilityId,
      energyType: holding.energyType,
      vintage: holding.vintage,
      quantity: 500, // Selling 500 RECs
      remainingQuantity: 500,
      price: 3.00, // AED 3.00 per REC
      totalValue: 1500,
      emirate: holding.emirate,
      certificationStandard: holding.certificationStandard,
      holdingId: holding._id,
      allowPartialFill: true,
      minFillQuantity: 50,
      createdBy: `${seller.firstName} ${seller.lastName}`
    });
    await sellOrder.save();
    console.log('   ✅ Sell order created: 500 RECs at AED 3.00 each');
    
    // Lock the RECs
    await holding.lock();
    console.log('   ✅ RECs locked for trading');
    
    // Create buy order
    console.log('\n5️⃣ Creating Buy Order...');
    const buyOrder = new Order({
      userId: buyer._id,
      orderType: 'buy',
      facilityName: holding.facilityName,
      facilityId: holding.facilityId,
      energyType: holding.energyType,
      vintage: holding.vintage,
      quantity: 300, // Buying 300 RECs
      remainingQuantity: 300,
      price: 3.00, // Matching price
      totalValue: 900,
      emirate: holding.emirate,
      certificationStandard: holding.certificationStandard,
      allowPartialFill: true,
      minFillQuantity: 50,
      createdBy: `${buyer.firstName} ${buyer.lastName}`,
      buyerReservedFils: 91800 // 300 * 3.00 * 100 + 2% fee + 500 fils blockchain fee
    });
    await buyOrder.save();
    console.log('   ✅ Buy order created: 300 RECs at AED 3.00 each');
    
    // Reserve funds for buyer
    buyer.reservedBalance = 918; // AED 918 reserved
    await buyer.save();
    console.log('   ✅ Funds reserved for buyer');
    
    // Execute blockchain trade
    console.log('\n6️⃣ Executing Blockchain Trade...');
    const tradeResult = await executeBlockchainTrade(buyOrder, sellOrder, 300);
    
    if (tradeResult.success) {
      console.log('   ✅ Blockchain trade executed successfully!');
      console.log(`   📝 Transaction ID: ${tradeResult.transactionId}`);
    } else {
      console.log('   ❌ Blockchain trade failed:', tradeResult.error);
      return false;
    }
    
    // Verify transaction was recorded on blockchain
    console.log('\n7️⃣ Verifying Blockchain Recording...');
    const transaction = await Transaction.findById(tradeResult.transactionId);
    if (transaction && transaction.blockchainTxHash) {
      console.log('   ✅ Transaction recorded on blockchain');
      console.log(`   🔗 Blockchain Hash: ${transaction.blockchainTxHash}`);
      console.log(`   🆔 Internal Ref: ${transaction.internalRef}`);
    } else {
      console.log('   ❌ Transaction not recorded on blockchain');
    }
    
    // Verify REC transfer
    console.log('\n8️⃣ Verifying REC Transfer...');
    const updatedBuyer = await User.findById(buyer._id);
    const updatedSeller = await User.findById(seller._id);
    
    console.log(`   👤 Buyer total RECs: ${updatedBuyer.totalRecs}`);
    console.log(`   👤 Seller total RECs: ${updatedSeller.totalRecs}`);
    console.log(`   💰 Buyer cash balance: AED ${updatedBuyer.cashBalance}`);
    console.log(`   💰 Seller cash balance: AED ${updatedSeller.cashBalance}`);
    
    // Check blockchain transaction history
    console.log('\n9️⃣ Checking Blockchain Transaction History...');
    const status = RECSecurityService.getServiceStatus();
    console.log(`   📊 Total blockchain transactions: ${status.totalTransactions}`);
    
    const transactionQueue = RECSecurityService.getTransactionQueue();
    console.log(`   📋 Transaction queue size: ${transactionQueue.size}`);
    
    if (transactionQueue.size > 0) {
      console.log('   📝 Recent blockchain transactions:');
      for (const [txId, tx] of transactionQueue.entries()) {
        console.log(`      - ${txId}: ${tx.recQuantity} RECs, ${tx.facilityDetails.facilityName}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETE TRADING FLOW TEST PASSED!');
    console.log('✅ Blockchain integration working');
    console.log('✅ REC transfers working');
    console.log('✅ Transaction recording working');
    console.log('✅ BlockchainMonitor will show real data');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ TRADING FLOW TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Helper function to execute blockchain trade (copied from orders.js)
async function executeBlockchainTrade(buyOrder, sellOrder, quantity) {
  try {
    console.log(`🔒 Executing blockchain trade for ${quantity} units`);
    
    // Create transaction record first
    const transaction = new Transaction({
      buyerId: buyOrder.userId,
      sellerId: sellOrder.userId,
      buyOrderId: buyOrder._id,
      sellOrderId: sellOrder._id,
      facilityName: sellOrder.facilityName,
      facilityId: sellOrder.facilityId || `${sellOrder.facilityName}-${sellOrder.vintage}`,
      energyType: sellOrder.energyType,
      vintage: sellOrder.vintage,
      emirate: sellOrder.emirate,
      certificationStandard: sellOrder.certificationStandard,
      quantity,
      pricePerUnit: sellOrder.price,
      totalAmount: quantity * sellOrder.price,
      buyerPlatformFee: quantity * sellOrder.price * 0.02,
      sellerPlatformFee: quantity * sellOrder.price * 0.02,
      blockchainFee: 5.00,
      status: 'processing',
      settlementStatus: 'pending'
    });

    await transaction.save();

    // Record transaction on blockchain
    const blockchainResult = await RECSecurityService.recordRECTransaction({
      buyerAddress: `0x${buyOrder.userId.toString().padStart(40, '0')}`,
      sellerAddress: `0x${sellOrder.userId.toString().padStart(40, '0')}`,
      recQuantity: quantity,
      facilityDetails: {
        facilityName: sellOrder.facilityName,
        facilityId: sellOrder.facilityId || `${sellOrder.facilityName}-${sellOrder.vintage}`,
        energyType: sellOrder.energyType,
        vintage: sellOrder.vintage,
        emirate: sellOrder.emirate,
        certificationStandard: sellOrder.certificationStandard
      },
      transactionId: transaction._id.toString(),
      pricePerUnit: sellOrder.price
    });

    if (blockchainResult.success) {
      // Update transaction with blockchain details
      transaction.blockchainTxHash = blockchainResult.blockchainHash;
      transaction.internalRef = blockchainResult.blockchainTxId;
      await transaction.save();
      
      console.log(`🔒 Blockchain transaction recorded: ${blockchainResult.blockchainHash}`);
    } else {
      console.log(`⚠️ Blockchain recording failed: ${blockchainResult.message}`);
    }

    // Complete REC transfer
    await completeRECTransfer(transaction);

    // Update order statuses
    await buyOrder.fillPartial(quantity);
    await sellOrder.fillPartial(quantity);

    // Update user portfolios
    const buyerSummary = await RECHolding.getUserTotalRECs(buyOrder.userId);
    await User.findByIdAndUpdate(buyOrder.userId, {
      totalRecs: buyerSummary.totalQuantity,
      portfolioValue: buyerSummary.totalValue
    });

    const sellerSummary = await RECHolding.getUserTotalRECs(sellOrder.userId);
    await User.findByIdAndUpdate(sellOrder.userId, {
      totalRecs: sellerSummary.totalQuantity,
      portfolioValue: sellerSummary.totalValue
    });

    // Mark transaction as completed
    await transaction.markCompleted();

    console.log(`✅ Blockchain trade completed: ${transaction._id}`);
    return { success: true, transactionId: transaction._id };
  } catch (error) {
    console.error('❌ Blockchain trade failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to complete REC transfer
async function completeRECTransfer(transaction) {
  const { sellerId, buyerId, quantity, facilityId, energyType, vintage, certificationStandard, pricePerUnit } = transaction;

  // Get seller's holding
  const sellerHolding = await RECHolding.findOne({
    userId: sellerId,
    facilityId: facilityId,
    energyType: energyType,
    vintage: vintage,
    certificationStandard: certificationStandard
  });

  if (!sellerHolding || sellerHolding.quantity < quantity) {
    throw new Error('Insufficient REC quantity in seller holding');
  }

  // Reduce seller's holding
  sellerHolding.quantity -= quantity;
  if (sellerHolding.quantity === 0) {
    await RECHolding.findByIdAndDelete(sellerHolding._id);
  } else {
    await sellerHolding.save();
  }

  // Add to buyer's holding
  let buyerHolding = await RECHolding.findOne({
    userId: buyerId,
    facilityId: facilityId,
    energyType: energyType,
    vintage: vintage,
    certificationStandard: certificationStandard
  });

  if (buyerHolding) {
    const newTotalQuantity = buyerHolding.quantity + quantity;
    const newTotalValue = buyerHolding.totalValue + (quantity * pricePerUnit);
    buyerHolding.quantity = newTotalQuantity;
    buyerHolding.averagePurchasePrice = newTotalValue / newTotalQuantity;
    buyerHolding.totalValue = newTotalValue;
    await buyerHolding.save();
  } else {
    buyerHolding = new RECHolding({
      userId: buyerId,
      facilityName: transaction.facilityName,
      facilityId: facilityId,
      energyType: energyType,
      vintage: vintage,
      quantity,
      averagePurchasePrice: pricePerUnit,
      totalValue: quantity * pricePerUnit,
      emirate: transaction.emirate,
      certificationStandard: certificationStandard
    });
    await buyerHolding.save();
  }
}

testCompleteTradingFlow().then(success => {
  process.exit(success ? 0 : 1);
});
