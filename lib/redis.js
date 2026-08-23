import { Redis } from '@upstash/redis';

// Shared Upstash Redis client for all serverless functions
// Used for: daily user counter, upgrade key validation, email lookup

let redis = null;

export function getRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
    }

    redis = new Redis({ url, token });
  }
  return redis;
}

// Key prefixes to avoid collisions
export const KEYS = {
  // Daily user counter: wispr:daily:2026-05-19
  dailyCounter: (date) => `wispr:daily:${date}`,

  // Upgrade key validation: wispr:keys:WS-BDAY-2026-A7K2
  upgradeKey: (key) => `wispr:keys:${key}`,

  // Email lookup: wispr:emails:user@example.com
  emailLookup: (email) => `wispr:emails:${email}`,

  // Per-user recording counter: wispr:recordings:{sessionId}:2026-05-19
  userRecordings: (sessionId, date) => `wispr:recordings:${sessionId}:${date}`,

  // Per-user cumulative seconds: wispr:cumulative:{sessionId}:2026-05-19
  userCumulative: (sessionId, date) => `wispr:cumulative:${sessionId}:${date}`,

  // Per-user tone rewrite counter (legacy, shared across all tones — kept for backward compatibility)
  userRewrites: (sessionId, date) => `wispr:rewrites:${sessionId}:${date}`,

  // Per-user per-tone rewrite counter: wispr:rewrites:{sessionId}:warm:2026-05-19
  // Used to enforce a separate daily quota for each tone.
  userRewritesByTone: (sessionId, tone, date) => `wispr:rewrites:${sessionId}:${tone}:${date}`,

  // Pro email set: wispr:pro-emails (Redis Set of all Pro subscriber emails)
  proEmailsSet: 'wispr:pro-emails',

  // Occasion sent dedup: wispr:occasion-sent:{email}:{occasionId}
  occasionSent: (email, occasionId) => `wispr:occasion-sent:${email}:${occasionId}`,

  // Email subscriber set (free users signing up for occasion reminders): wispr:email-subscribers
  emailSubscribersSet: 'wispr:email-subscribers',

  // Session token lookup: wispr:session:{uuid}
  sessionToken: (token) => `wispr:session:${token}`,

  // Previous pass for email: wispr:user-prev-pass:{email}
  userPrevPass: (email) => `wispr:user-prev-pass:${email}`,

  // Occasion-subscriber display name: wispr:sub:name:<email>
  subscriberName: (email) => `wispr:sub:name:${email}`,

  // Unsubscribe Undo gate marker: wispr:unsub-gate:<email> (set on GET so the Undo POST can act)
  unsubGate: (email) => `wispr:unsub-gate:${email}`,

  // Vault chain sent-dedup: wispr:vaultchain:{30|60|90}:<email>
  vaultChainSent: (stage, email) => `wispr:vaultchain:${stage}:${email}`,

  // Vault chain "cards existed at T+60" flag: wispr:vaultchain:hadcards:<email>
  vaultChainHadCards: (email) => `wispr:vaultchain:hadcards:${email}`,

  // Milestone last-sent record: wispr:milestone:last:<key> (JSON {threshold, ts})
  milestoneLast: (key) => `wispr:milestone:last:${key}`,

  // Founder Letter monthly dedupe: wispr:founder:YYYY-MM (set once per calendar month)
  founderSent: (month) => `wispr:founder:${month}`,

  // Expiry email sent-dedup: wispr:expiry:{t-7|t-1|t+7}:<email>
  expirySent: (stage, email) => `wispr:expiry:${stage}:${email}`,

  // Gift code lookup: wispr:gift:GIFT-ABCD-EFGH-2345
  giftCode: (code) => `wispr:gift:${code}`,

  // Gift codes by buyer email: wispr:gift-email:user@example.com (Redis Set)
  giftEmailSet: (email) => `wispr:gift-email:${email}`,

  // Gift codes by payment ID: wispr:gift-payment:pi_xxx (Redis Set)
  giftPaymentSet: (paymentId) => `wispr:gift-payment:${paymentId}`,

  // Gift code claim lock: wispr:gift-claim:GIFT-ABCD-EFGH-2345
  giftClaimLock: (code) => `wispr:gift-claim:${code}`,

  // Clerk email cache: wispr:clerk-email:{userId} -> email (1h TTL)
  clerkEmail: (userId) => `wispr:clerk-email:${userId}`,

  // Clerk user mapping: wispr:clerk-user:{email} -> userId (7d TTL; read by BMAC webhook at purchase time)
  clerkUser: (email) => `wispr:clerk-user:${email}`,
};

// Midnight UTC expiration helper
export function secondsUntilMidnightUTC() {
  const now = new Date();
  const midnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return Math.floor((midnight - now) / 1000);
}
