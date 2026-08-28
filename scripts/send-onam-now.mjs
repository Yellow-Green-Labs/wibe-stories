import { getOccasionById, sendOccasionEmail } from '../lib/occasion-email.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('Set RESEND_API_KEY in the environment first.');
  process.exit(1);
}

const toEmail = process.argv[2];
if (!toEmail) {
  console.error('Usage: node scripts/send-onam-now.mjs recipient@example.com');
  process.exit(1);
}

const occasion = getOccasionById('onam');
if (!occasion) {
  console.error('Onam occasion not found.');
  process.exit(1);
}

console.log(`Sending Onam email to ${toEmail} ...`);
const result = await sendOccasionEmail(RESEND_API_KEY, toEmail, occasion);
if (result.ok) {
  console.log('Sent. Check the inbox for ' + toEmail);
} else {
  console.error('Failed:', result.error);
  process.exit(1);
}