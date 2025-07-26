# Plaid Integration Setup

## Environment Variables Required

Create a `.env` file in the Backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/personal-finance-tracker

# Server Configuration
PORT=3001

# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id_here
PLAID_SECRET=your_plaid_secret_here
PLAID_ENV=sandbox
# PLAID_ENV can be: sandbox, development, or production

# Optional: Webhook URL for real-time updates
# PLAID_WEBHOOK_URL=https://your-domain.com/plaid/webhook
```

## How to Get Plaid Credentials

1. **Sign up at plaid.com** and create a developer account
2. **Go to your Plaid Dashboard**
3. **Navigate to API Keys section**
4. **Copy your Client ID and Secret**
5. **Set the environment** (start with sandbox for testing)

## Testing the Integration

1. **Start your backend server**: `npm start`
2. **Start your frontend**: `cd ../Frontend/my-project && npm run dev`
3. **Go to the Dashboard** and click "Link Bank Account"
4. **Use Plaid's sandbox credentials** for testing:
   - Username: `user_good`
   - Password: `pass_good`

## Features Implemented

✅ **Bank Account Linking** - Connect your SBI account
✅ **Balance Tracking** - Real-time account balance
✅ **Transaction Sync** - Automatic transaction import
✅ **UPI Transaction Support** - Works with GPay, PhonePe, Paytm
✅ **Webhook Support** - Real-time transaction updates
✅ **Account Management** - Link/unlink accounts

## API Endpoints

- `POST /plaid/create-link-token` - Create Plaid Link token
- `POST /plaid/exchange-token` - Exchange public token for access token
- `GET /plaid/balance` - Get account balance
- `GET /plaid/transactions` - Sync transactions
- `GET /plaid/accounts` - Get linked accounts
- `DELETE /plaid/unlink` - Unlink account
- `POST /plaid/webhook` - Handle real-time updates

## Security Notes

- Access tokens are stored in memory (for production, use a database)
- All API calls use HTTPS
- Plaid handles bank credentials securely
- No bank passwords are stored in your app 