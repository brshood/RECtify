#!/bin/bash

# RECtify Demo Data Seeding Script
# This script seeds comprehensive demo data for testing

echo "🌱 RECtify Demo Data Seeding Script"
echo "===================================="
echo ""

# Check if MongoDB URI is set
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  Warning: MONGODB_URI environment variable not set"
    echo "Reading from .env file..."
    echo ""
fi

# Navigate to backend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( dirname "$SCRIPT_DIR" )"
cd "$BACKEND_DIR"

echo "📍 Current directory: $BACKEND_DIR"
echo ""

# Run the seed script
echo "🚀 Starting demo data seeding..."
echo ""

node scripts/seedDemoData.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Demo data seeding completed successfully!"
    echo ""
    echo "📋 Demo User Credentials:"
    echo "------------------------"
    echo "👤 Ahmed Al Mansouri (Trader)"
    echo "   Email: ahmed.trader@example.com"
    echo "   Password: password123"
    echo ""
    
    echo "👤 Fatima Al Zahra (Facility Owner)"
    echo "   Email: fatima.energy@example.com"
    echo "   Password: password123"
    echo ""
    
    echo "👤 Mohammed Al Rashid (Compliance Officer)"
    echo "   Email: mohammed.compliance@example.com"
    echo "   Password: password123"
    echo ""
    
    echo "📊 Data Summary:"
    echo "------------------------"
    echo "   • 3 Users with different roles"
    echo "   • 15 Holdings (~13,280 MWh total)"
    echo "   • 10 Active Orders (Buy & Sell)"
    echo "   • 18 Completed Transactions (4 months history)"
    echo ""
    echo "📖 For detailed data breakdown, see:"
    echo "   backend/scripts/DEMO_DATA_SUMMARY.md"
    echo ""
else
    echo ""
    echo "❌ Demo data seeding failed!"
    echo "Please check the error messages above."
    echo ""
    exit 1
fi

