/**
 * Local test script for occasion email.
 * Usage:
 *   node scripts/test-send-occasion.mjs your@email.com grandparents-day
 *
 * Requires RESEND_API_KEY env var (set in .env or export before running).
 */

import { getOccasionById, getNextOccasion, sendOccasionEmail } from '../lib/occasion-email.js';

const email = process.argv[2];
const occasionId = process.argv[3];

if (!email) {
  console.error('Missing email argument. Usage: node scripts/test-send-occasion.mjs your@email.com [occasion-id]');
  process.exit(1);
}

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('RESEND_API_KEY environment variable not set.');
  process.exit(1);
}

let occasion;
if (occasionId) {
  occasion = getOccasionById(occasionId);
  if (!occasion) {
    console.error('Unknown occasion:', occasionId);
    process.exit(1);
  }
} else {
  occasion = getNextOccasion();
  if (!occasion) {
    console.error('No upcoming occasion found in next 365 days');
    process.exit(1);
  }
}

console.log(`Sending "${occasion.name}" to ${email}...`);
const result = await sendOccasionEmail(resendApiKey, email, occasion);

if (result.ok) {
  console.log('Sent successfully!');
} else {
  console.error('Failed:', result.error);
  process.exit(1);
}
