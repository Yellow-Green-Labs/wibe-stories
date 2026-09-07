// Daily email/data job dispatcher.
//
// Runs every scheduled job on the Railway backend so all occasion,
// vault-chain, milestone, expiry, and cleanup jobs fire on time.
//
// Triggered by GitHub Actions (see .github/workflows/email-cron.yml),
// which sets CRON_SECRET from the repo secret.
//
// Usage:
//   node scripts/cron-dispatcher.mjs                # run all jobs
//   node scripts/cron-dispatcher.mjs <job>          # run one job
//
// Exits non-zero if any job fails, so GitHub Actions marks the run red.

const BASE = 'https://wibe-stories-production.up.railway.app';
const SECRET = process.env.CRON_SECRET;

if (!SECRET) {
  console.error('[CronDispatcher] CRON_SECRET is not set.');
  process.exit(1);
}

const ALL_JOBS = [
  'occasion-emails',
  'vault-chain',
  'milestones',
  'expiry-emails',
  'cleanup',
];

const JOBS = process.argv[2]
  ? process.argv[2].split(',').map((s) => s.trim()).filter(Boolean)
  : ALL_JOBS;

let failures = 0;

for (const job of JOBS) {
  try {
    const res = await fetch(`${BASE}/api/cron?job=${job}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}` },
    });
    const body = await res.text();
    const ok = res.status >= 200 && res.status < 300;
    if (!ok) failures++;
    console.log(`[CronDispatcher] ${job} -> ${res.status} | ${body.slice(0, 200)}`);
  } catch (e) {
    failures++;
    console.error(`[CronDispatcher] ${job} error:`, e.message);
  }
}

if (failures > 0) {
  console.error(`[CronDispatcher] ${failures} job(s) failed.`);
  process.exit(1);
}

console.log('[CronDispatcher] all jobs done.');
