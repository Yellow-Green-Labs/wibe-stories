// Railway cron dispatcher — runs once daily at 02:00 UTC (see railway.toml).
// Calls every scheduled email/data job on the Railway backend so all
// occasion, vault-chain, milestone, expiry, and cleanup jobs fire on time.
//
// Each job needs the CRON_SECRET header (same value Railway env already has).

const BASE = 'https://wibe-stories-production.up.railway.app';
const SECRET = process.env.CRON_SECRET;

if (!SECRET) {
  console.error('[CronDispatcher] CRON_SECRET not set in Railway env.');
  process.exit(1);
}

const JOBS = [
  'occasion-emails',
  'vault-chain',
  'milestones',
  'expiry-emails',
  'cleanup',
];

for (const job of JOBS) {
  try {
    const res = await fetch(`${BASE}/api/cron?job=${job}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}` },
    });
    const body = await res.text();
    console.log(`[CronDispatcher] ${job} -> ${res.status} | ${body.slice(0, 200)}`);
  } catch (e) {
    console.error(`[CronDispatcher] ${job} error:`, e.message);
  }
}

console.log('[CronDispatcher] done.');