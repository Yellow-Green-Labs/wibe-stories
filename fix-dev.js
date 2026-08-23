// Dev server fix script
// 1. Ensures .env has Clerk keys (already created)
// 2. Restarts vercel dev with correct CSP

const { execSync } = require('child_process');
const fs = require('fs');

const envPath = 'C:\\\\Users\\\\srini\\\\Documents\\\\Wispr-Stories\\\\.env';
let envContent = fs.readFileSync(envPath, 'utf8');

// Ensure Clerk keys exist
if (!envContent.includes('CLERK_SECRET_KEY')) {
  envContent += '\nCLERK_SECRET_KEY=sk_test_VjHQJvuDSMQuxWtrcurlz8e5kob7Ild1iaM552cEyz';
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Added CLERK_SECRET_KEY to .env');
} else {
  console.log('✅ CLERK_SECRET_KEY already in .env');
}

// Restart vercel dev to apply CSP changes
try {
  console.log('🔄 Restarting vercel dev...');
  // Kill any existing vercel dev processes and restart
  execSync('taskkill /IM "node.exe" /F 2>/dev/null');
  const result = execSync('cd C:\\\\Users\\\\srini\\\\Documents\\\\Wispr-Stories && npx vercel dev --reload', {
    stdio: 'inherit',
    timeout: 30000
  });
  console.log('✅ vercel dev restarted');
} catch (e) {
  console.log('⚠️  Could not auto-restart vercel dev');
  console.log('📝 Manual steps needed:');
  console.log('   1. Stop any running vercel dev (Ctrl+C)');
  console.log('   2. Run: cd "C:\\\\Users\\\\srini\\\\Documents\\\\Wispr-Stories" && npx vercel dev');
  console.log('   3. Clear browser cache and try sign-in again');
}