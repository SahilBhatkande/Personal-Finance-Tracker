const fs = require('fs');
const path = require('path');

console.log('🔧 Plaid Configuration Setup');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');
  
  // Read existing .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for Plaid variables
  const hasPlaidClientId = envContent.includes('PLAID_CLIENT_ID=');
  const hasPlaidSecret = envContent.includes('PLAID_SECRET=');
  const hasPlaidEnv = envContent.includes('PLAID_ENV=');
  
  console.log('📋 Current Configuration:');
  console.log(`   PLAID_CLIENT_ID: ${hasPlaidClientId ? '✅ Set' : '❌ Not Set'}`);
  console.log(`   PLAID_SECRET: ${hasPlaidSecret ? '✅ Set' : '❌ Not Set'}`);
  console.log(`   PLAID_ENV: ${hasPlaidEnv ? '✅ Set' : '❌ Not Set'}`);
  
  if (!hasPlaidClientId || !hasPlaidSecret) {
    console.log('\n❌ Missing Plaid credentials!');
    console.log('\n📝 To fix this:');
    console.log('1. Go to https://dashboard.plaid.com/');
    console.log('2. Sign up or log in to your Plaid account');
    console.log('3. Go to API Keys section');
    console.log('4. Copy your Client ID and Secret');
    console.log('5. Edit the .env file and replace the placeholder values');
    console.log('\nExample .env content:');
    console.log('PLAID_CLIENT_ID=your_actual_client_id_here');
    console.log('PLAID_SECRET=your_actual_secret_here');
    console.log('PLAID_ENV=sandbox');
  } else {
    console.log('\n✅ Plaid credentials appear to be configured!');
    console.log('Try running your server again.');
  }
} else {
  console.log('❌ .env file not found');
  console.log('\n📝 Creating .env file with template...');
  
  const envTemplate = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/personal-finance-tracker

# Server Configuration
PORT=3001

# Plaid Configuration - REPLACE WITH YOUR ACTUAL CREDENTIALS
PLAID_CLIENT_ID=your_plaid_client_id_here
PLAID_SECRET=your_plaid_secret_here
PLAID_ENV=sandbox
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created!');
  console.log('\n📝 Next steps:');
  console.log('1. Edit the .env file in the Backend directory');
  console.log('2. Replace the placeholder values with your actual Plaid credentials');
  console.log('3. Get your credentials from https://dashboard.plaid.com/');
}

console.log('\n🚀 After configuring, restart your server with: npm start'); 