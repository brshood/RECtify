# Testing Guide: Admin Interface & Bank Transfer Instructions

## Admin Account

The admin account is configured as:
- **Email:** `team@rectifygo.com`
- **Password:** `Admin2024!Secure`
- **Role:** `admin`
- **Tier:** `enterprise`

This account is created when you run the seed script: `cd backend && node scripts/seedUsers.js`

## Quick Start Testing

### Step 1: Login as Admin

1. Open the login interface
2. Enter your admin credentials manually:
   - Email: `team@rectifygo.com`
   - Password: `Admin2024!Secure`
3. Click "Sign In"

### Step 2: Test Admin Interface

1. After login, navigate to **Dashboard**
2. You should see an **"Admin"** tab in the tab list
3. Click on the **"Admin"** tab
4. You should see:
   - List of all users
   - Each user's current balance
   - Input fields to add funds to any user
   - Currency selector (AED/USD)

### Step 3: Test Adding Funds to a User

1. In the Admin tab, find a user (not yourself)
2. Enter an amount (e.g., `1000`)
3. Select currency (AED or USD)
4. Click "Add Funds" button
5. You should see:
   - Success toast notification
   - User's balance updated immediately
   - Amount field cleared

### Step 4: Test Bank Transfer Instructions

1. Click on your profile icon (top right)
2. In the User Profile modal, you should see:
   - Your current balance
   - "Add Funds" button next to "Refresh"
3. Click "Add Funds" button
4. Bank Transfer Instructions card should appear showing:
   - Bank account details (Emirates Development Bank)
   - Account number: 607991
   - IBAN: AE528090000000000607991
   - SWIFT Code: EMDVAEAD
   - Copy buttons for each field
   - Clear instructions about:
     - Name matching requirements
     - Processing time (1-2 business days)
     - Minimum transfer amount (AED 100)
     - Reference field requirements
5. Test copy buttons - they should copy the text and show a checkmark

## What to Verify

### Admin Interface
- ✅ Admin tab appears only for admin users
- ✅ Can see all users in the system
- ✅ Can add funds to any user (except yourself)
- ✅ Balance updates immediately after adding funds
- ✅ Currency selection works (AED/USD)
- ✅ Validation prevents adding funds to your own account
- ✅ Validation prevents invalid amounts

### Bank Transfer Instructions
- ✅ "Add Funds" button appears in User Profile
- ✅ Bank details are correct and match the certificate
- ✅ Copy buttons work for all fields
- ✅ Instructions are clear and comprehensive
- ✅ User's email appears in the reference instruction
- ✅ Processing timeline is clear
- ✅ Support contact information is visible

### Security
- ✅ Non-admin users cannot access `/api/users` endpoint
- ✅ Non-admin users cannot access `/api/payments/admin/manual-credit` endpoint
- ✅ Admin cannot credit their own account
- ✅ All admin actions are logged in audit trail

## Admin Account Setup

The admin account (`team@rectifygo.com`) should be created in the database. You can do this by:

1. **Using the seed script:**
   ```bash
   cd backend && node scripts/seedUsers.js
   ```

2. **Or manually in MongoDB:**
   - Create a user with email `team@rectifygo.com`
   - Set role to `admin`
   - Set tier to `enterprise`
   - Set verificationStatus to `verified`

## Troubleshooting

### Cannot access Admin tab
- Verify your user role is 'admin' in the database
- Check browser console for errors
- Make sure you're logged in

### Bank Transfer Instructions not showing
- Make sure you clicked "Add Funds" button in User Profile
- Check browser console for any errors
- Verify the component imported correctly

### Cannot create admin account
- Run the seed script: `cd backend && node scripts/seedUsers.js`
- Or manually create the admin account in MongoDB with email `team@rectifygo.com` and role `admin`

## Notes

- Admin account email: `team@rectifygo.com` (configured in seed script)
- All admin fund additions are logged in the audit trail
- Bank transfer instructions are visible to all users (not just admins)
- Admin interface is only accessible to users with `role: 'admin'`

