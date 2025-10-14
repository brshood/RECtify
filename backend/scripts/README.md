# RECtify Backend Scripts

This directory contains utility scripts for managing the RECtify platform's database and demo data.

## Available Scripts

### 1. `seedDemoData.js` - Comprehensive Demo Data Seeding

Creates a complete demo environment with realistic trading data for testing and demonstration purposes.

**What it creates:**
- ✅ 3 demo users (Trader, Facility Owner, Compliance Officer)
- ✅ 15 REC holdings across multiple facilities (~13,280 MWh total)
- ✅ 10 active orders (6 buy orders + 4 sell orders)
- ✅ 18 completed transactions spanning 4 months
- ✅ Monthly trading patterns showing platform growth

**Usage:**

**On Windows (PowerShell):**
```powershell
.\backend\scripts\seed-demo-data.ps1
```

**On Mac/Linux:**
```bash
./backend/scripts/seed-demo-data.sh
```

**Direct Node.js:**
```bash
cd backend
node scripts/seedDemoData.js
```

**Demo Users:**

| Name | Email | Password | Role | Holdings |
|------|-------|----------|------|----------|
| Ahmed Al Mansouri | `ahmed.trader@example.com` | `password123` | Trader | 4,150 MWh |
| Fatima Al Zahra | `fatima.energy@example.com` | `password123` | Facility Owner | 8,700 MWh |
| Mohammed Al Rashid | `mohammed.compliance@example.com` | `password123` | Compliance Officer | 430 MWh |

**📖 For detailed data breakdown, see [DEMO_DATA_SUMMARY.md](./DEMO_DATA_SUMMARY.md)**

---

### 2. `seedUsers.js` - Basic User Seeding

Creates basic user accounts without extensive holdings or transaction history.

**What it creates:**
- 4 demo users with basic profiles
- Pre-populated portfolio values and REC totals
- No orders or transactions

**Usage:**
```bash
cd backend
node scripts/seedUsers.js
```

**Demo Users:**

| Name | Email | Password | Role | Company |
|------|-------|----------|------|---------|
| Ahmed Al Shamsi | `ahmed.alshamsi@adnoc.ae` | `demo123` | Facility Owner | ADNOC Clean Energy |
| Fatima Hassan | `fatima.hassan@masdar.ae` | `demo123` | Trader | Masdar City |
| Omar Khalil | `omar.khalil@dewa.gov.ae` | `demo123` | Compliance Officer | DEWA |
| Guest User | `demo@rectify.ae` | `demo123` | Trader | RECtify Demo |

---

## Quick Start

### Prerequisites
1. Ensure MongoDB is running
2. Set `MONGODB_URI` in your `.env` file
3. Navigate to the backend directory

### Recommended Workflow

**For comprehensive testing with trading features:**
```bash
# Use the comprehensive demo data
.\backend\scripts\seed-demo-data.ps1
```

**For basic user testing:**
```bash
cd backend
node scripts/seedUsers.js
```

---

## Data Structure

### Demo Data (`seedDemoData.js`) Creates:

#### Holdings
- Multiple vintages (2022-2024)
- Various energy types (Solar, Nuclear, Wind, Biomass)
- Different emirates (Dubai, Abu Dhabi, Sharjah)
- I-REC certification standard

#### Active Orders
**Buy Orders:**
- Ahmed: 4 orders (1,950 MWh)
  - Mix of compliance, voluntary, and trading purposes
  - Prices ranging from 160-168.50 AED/MWh
- Fatima: 1 order (400 MWh)
  - Wind energy for compliance
- Mohammed: 1 order (200 MWh)
  - Solar energy for compliance

**Sell Orders:**
- Fatima: 4 orders (2,250 MWh)
  - Prices ranging from 167.50-170.00 AED/MWh

#### Completed Transactions
- 18 transactions distributed over 4 months
- Shows increasing platform activity:
  - Month 1: 2 transactions (430 MWh)
  - Month 2: 4 transactions (820 MWh)
  - Month 3: 4 transactions (1,130 MWh)
  - Current Month: 8 transactions (1,655 MWh)
- Total volume: ~3,915 MWh
- Total value: ~654,600 AED
- Average price: 167.20 AED/MWh

---

## Testing Scenarios

### As Ahmed (Trader) - `ahmed.trader@example.com`
**Test these features:**
- Portfolio management with diverse holdings
- Active buy order tracking
- Transaction history review
- Buy order creation
- Market analytics
- Monthly trading volume charts

### As Fatima (Facility Owner) - `fatima.energy@example.com`
**Test these features:**
- Large enterprise portfolio management
- Sell order creation and tracking
- Revenue analytics from REC sales
- Multi-vintage holdings
- Large volume order management
- Buyer/seller transaction views

### As Mohammed (Compliance Officer) - `mohammed.compliance@example.com`
**Test these features:**
- Basic tier user experience
- Compliance-focused purchases
- Portfolio reporting
- Vintage tracking
- Compliance certificate generation

---

## Environment Variables

Make sure these are set in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/rectify
# or
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rectify
```

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running locally or your MongoDB Atlas connection string is correct
- Check that `MONGODB_URI` is set in your `.env` file
- Verify network access if using MongoDB Atlas

### "Error seeding users/data"
- Check that all dependencies are installed: `npm install`
- Ensure the models are properly defined in `backend/models/`
- Check console output for specific error messages

### "Permission denied" (Mac/Linux)
If you get a permission error running the shell script:
```bash
chmod +x backend/scripts/seed-demo-data.sh
./backend/scripts/seed-demo-data.sh
```

---

## Notes

- All scripts clear existing demo data before seeding to ensure clean state
- Scripts are safe to run multiple times
- All prices are in AED (United Arab Emirates Dirham)
- All quantities are in MWh (Megawatt-hours)
- Transactions include 2% platform fee for both buyer and seller
- All transactions include 5 AED blockchain recording fee

---

## File Structure

```
backend/scripts/
├── README.md                 # This file
├── DEMO_DATA_SUMMARY.md      # Detailed breakdown of demo data
├── seedDemoData.js           # Comprehensive demo data seeding (RECOMMENDED)
├── seedUsers.js              # Basic user seeding
├── seed-demo-data.ps1        # Windows PowerShell wrapper
└── seed-demo-data.sh         # Mac/Linux bash wrapper
```

---

## Need More Data?

To customize the demo data:

1. Edit `seedDemoData.js`
2. Modify the arrays:
   - `demoUsers` - User accounts
   - `demoHoldings` - REC holdings
   - `demoOrders` - Active orders
   - Transaction generation code - Historical transactions
3. Run the script again

---

## Production Considerations

⚠️ **IMPORTANT**: These scripts are for development and testing only!

- Never run seeding scripts on production databases
- Use proper user registration flows in production
- Implement proper data migration strategies
- Always backup before running any data modification scripts

---

## Support

For questions or issues:
- Check the [DEMO_DATA_SUMMARY.md](./DEMO_DATA_SUMMARY.md) for data details
- Review the console output when running scripts
- Check MongoDB connection and logs
- Ensure all dependencies are installed

---

**Last Updated**: October 2025

