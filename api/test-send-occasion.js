export const config = { runtime: 'nodejs' };

import { getOccasionById, getNextOccasion, sendOccasionEmail } from '../lib/occasion-email.js';

export default async function handler(req, res) {
  // Admin-only: requires the same x-admin-secret used by the app's other
  // admin-gated endpoints. Prevents strangers from spending Resend credits
  // by calling this endpoint directly.
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret || !process.env.ADMIN_API_SECRET || adminSecret !== process.env.ADMIN_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const url = new URL(req.url, `https://${req.headers.host || 'wibestories.vercel.app'}`);
  const email = url.searchParams.get('email');
  const occasionId = url.searchParams.get('occasion');

  if (!email) {
    return res.status(400).json({ error: 'Missing "email" query param' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not set on server' });
  }

  let occasion;
  if (occasionId) {
    occasion = getOccasionById(occasionId);
    if (!occasion) {
      return res.status(400).json({ error: 'Unknown occasion: ' + occasionId });
    }
  } else {
    occasion = getNextOccasion();
    if (!occasion) {
      return res.status(404).json({ error: 'No upcoming occasion found in next 365 days' });
    }
  }

  const result = await sendOccasionEmail(resendApiKey, email, occasion);

  if (result.ok) {
    return res.status(200).json({ ok: true, occasion: occasion.id, name: occasion.name, sentTo: email });
  } else {
    return res.status(500).json({ ok: false, error: result.error, occasion: occasion.id, name: occasion.name });
  }
}
