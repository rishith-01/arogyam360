// Script to fix common .env file issues
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

console.log('🔧 Fixing .env file issues...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  console.log('\n📝 Creating a new .env file template...');
  console.log('Please add your Firebase and OpenAI credentials.');
  process.exit(1);
}

// Read the .env file
let envContent = fs.readFileSync(envPath, 'utf8');
let fixed = false;

// Fix common issues
const fixes = [
  {
    name: 'Remove line breaks from OPENAI_API_KEY',
    pattern: /OPENAI_API_KEY=([^\n"]*[\n\r]+[^\n"]*)+/g,
    replacement: (match) => {
      const key = match.replace(/OPENAI_API_KEY=/, '').replace(/[\n\r\s]+/g, '').trim();
      return `OPENAI_API_KEY=${key}`;
    }
  },
  {
    name: 'Fix OPENAI_API_KEY with quotes',
    pattern: /OPENAI_API_KEY=["']([^"']+)["']/g,
    replacement: (match, key) => {
      const cleanKey = key.replace(/[\n\r\s]+/g, '').trim();
      return `OPENAI_API_KEY=${cleanKey}`;
    }
  },
  {
    name: 'Fix FIREBASE_PRIVATE_KEY line breaks',
    pattern: /FIREBASE_PRIVATE_KEY=["']([^"']*\\n[^"']*)["']/g,
    replacement: (match, key) => {
      // Ensure proper \n escape sequences
      const fixedKey = key.replace(/\r\n/g, '\\n').replace(/\n/g, '\\n').replace(/\\\\n/g, '\\n');
      return `FIREBASE_PRIVATE_KEY="${fixedKey}"`;
    }
  },
  {
    name: 'Remove trailing whitespace',
    pattern: /^([^=]+)=(.*?)[\s\t]+$/gm,
    replacement: (match, key, value) => {
      return `${key}=${value.trim()}`;
    }
  },
  {
    name: 'Remove empty lines with spaces',
    pattern: /^\s+$/gm,
    replacement: ''
  }
];

fixes.forEach(fix => {
  const before = envContent;
  if (fix.replacement instanceof Function) {
    envContent = envContent.replace(fix.pattern, fix.replacement);
  } else {
    envContent = envContent.replace(fix.pattern, fix.replacement);
  }
  if (before !== envContent) {
    console.log(`✅ Fixed: ${fix.name}`);
    fixed = true;
  }
});

if (fixed) {
  // Backup original
  const backupPath = envPath + '.backup';
  fs.writeFileSync(backupPath, fs.readFileSync(envPath, 'utf8'));
  console.log(`\n💾 Backup saved to: ${backupPath}`);
  
  // Write fixed version
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file has been fixed!\n');
  console.log('⚠️  Please restart your backend server for changes to take effect.');
} else {
  console.log('✅ No issues found in .env file!');
}

// Validate the fixed file
console.log('\n🔍 Validating fixed .env file...\n');
import('dotenv/config').then(() => {
  const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
  let allValid = true;
  
  required.forEach(key => {
    const value = process.env[key];
    if (!value) {
      console.log(`❌ ${key}: NOT SET`);
      allValid = false;
    } else {
      console.log(`✅ ${key}: Set (length: ${value.length})`);
    }
  });
  
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const cleanKey = openaiKey.trim().replace(/\s+/g, '');
    console.log(`✅ OPENAI_API_KEY: Set (length: ${cleanKey.length})`);
    if (cleanKey.length < 20) {
      console.log('⚠️  Warning: OPENAI_API_KEY seems too short. Please verify it\'s correct.');
    }
  } else {
    console.log('⚠️  OPENAI_API_KEY: NOT SET (Optional)');
  }
  
  if (allValid) {
    console.log('\n✅ All required environment variables are valid!');
  } else {
    console.log('\n❌ Some required variables are missing.');
  }
});

