// Quick script to check if environment variables are set
import dotenv from 'dotenv';

dotenv.config();

const required = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const optional = [
  'OPENAI_API_KEY',
];

console.log('🔍 Checking environment variables...\n');

let allSet = true;

// Check required variables
required.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`❌ ${key}: NOT SET (REQUIRED)`);
    allSet = false;
  } else {
    const displayValue = key === 'FIREBASE_PRIVATE_KEY' 
      ? (value.substring(0, 20) + '...' + value.substring(value.length - 20))
      : value;
    console.log(`✅ ${key}: ${displayValue}`);
  }
});

console.log('\n📋 Optional variables:');
optional.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`⚠️  ${key}: NOT SET (Optional - Chatbot will be disabled)`);
  } else {
    const displayValue = key === 'OPENAI_API_KEY'
      ? (value.substring(0, 7) + '...' + value.substring(value.length - 4))
      : value;
    console.log(`✅ ${key}: ${displayValue}`);
  }
});

console.log('\n' + (allSet ? '✅ All required variables are set!' : '❌ Some required variables are missing. Please check your .env file.'));

if (!allSet) {
  console.log('\n📝 Make sure you have a .env file in the backend/ directory with:');
  console.log('   FIREBASE_PROJECT_ID=your-project-id');
  console.log('   FIREBASE_CLIENT_EMAIL=your-service-account-email');
  console.log('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  console.log('\n💡 Optional (for chatbot feature):');
  console.log('   OPENAI_API_KEY=your_openai_api_key');
  process.exit(1);
} else {
  if (!process.env.OPENAI_API_KEY) {
    console.log('\n💡 Tip: Add OPENAI_API_KEY to enable the chatbot feature.');
    console.log('   Get your key from: https://platform.openai.com/api-keys');
  }
}

