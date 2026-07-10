export const config = { runtime: 'nodejs' };

import { getOccasionById, getNextOccasion, sendOccasionEmail } from '../api/lib/occasion-email.js';

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

export default async function handler(req) {
  const url = new URL(req.url, `https://${req.headers.host || 'wibestories.vercel.app'}`);
  const email = url.searchParams.get('email');
  const occasionId = url.searchParams.get('occasion');

  if (!email) {
    return new Response(JSON.stringify({ error: 'Missing "email" query param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const smtpConfig = getSmtpConfig();
  if (!smtpConfig.user || !smtpConfig.pass) {
    return new Response(JSON.stringify({ error: 'SMTP credentials not set on server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let occasion;
  if (occasionId) {
    occasion = getOccasionById(occasionId);
    if (!occasion) {
      return new Response(JSON.stringify({ error: 'Unknown occasion: ' + occasionId }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    occasion = getNextOccasion();
    if (!occasion) {
      return new Response(JSON.stringify({ error: 'No upcoming occasion found in next 365 days' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const result = await sendOccasionEmail(smtpConfig, email, occasion);

  if (result.ok) {
    return new Response(JSON.stringify({ ok: true, occasion: occasion.id, name: occasion.name, sentTo: email }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response(JSON.stringify({ ok: false, error: result.error, occasion: occasion.id, name: occasion.name }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
