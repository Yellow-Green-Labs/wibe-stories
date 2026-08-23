import { neon } from '@neondatabase/serverless';

const url = process.env.NEON_DATABASE_URL;
if (!url) {
  console.error('NEON_DATABASE_URL environment variable must be set');
  process.exit(1);
}

const sql = neon(url);

const res = await sql`
  CREATE TABLE IF NOT EXISTS vault_cards (
    id SERIAL PRIMARY KEY,
    client_id TEXT NOT NULL DEFAULT '',
    pro_key TEXT NOT NULL,
    short_id TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL DEFAULT '',
    author_name TEXT NOT NULL DEFAULT '',
    tone TEXT NOT NULL DEFAULT 'original',
    occasion TEXT NOT NULL DEFAULT '',
    has_audio BOOLEAN NOT NULL DEFAULT FALSE,
    audio_url TEXT NOT NULL DEFAULT '',
    theme TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    image_url TEXT NOT NULL DEFAULT '',
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

try {
  await sql`ALTER TABLE vault_cards ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT ''`;
  console.log('Column image_url ensured');
} catch (e) {
  console.log('Column image_url skipped:', e.message);
}

try {
  await sql`ALTER TABLE vault_cards ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
  console.log('Column last_accessed_at ensured');
} catch (e) {
  console.log('Column last_accessed_at skipped:', e.message);
}

console.log('Table vault_cards ready:', res);

try {
  await sql`CREATE INDEX IF NOT EXISTS idx_vault_cards_pro_key ON vault_cards (pro_key)`;
  console.log('Index idx_vault_cards_pro_key ready');
} catch (e) {
  console.log('Index idx_vault_cards_pro_key skipped (may already exist):', e.message);
}

try {
  await sql`CREATE INDEX IF NOT EXISTS idx_vault_cards_pro_key_created ON vault_cards (pro_key, created_at DESC)`;
  console.log('Index idx_vault_cards_pro_key_created ready');
} catch (e) {
  console.log('Index idx_vault_cards_pro_key_created skipped:', e.message);
}

try {
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_vault_cards_client_pro ON vault_cards (client_id, pro_key)`;
  console.log('Unique index idx_vault_cards_client_pro ready');
} catch (e) {
  console.log('Unique index idx_vault_cards_client_pro skipped:', e.message);
}

try {
  await sql`CREATE INDEX IF NOT EXISTS idx_vault_cards_last_access ON vault_cards (last_accessed_at)`;
  console.log('Index idx_vault_cards_last_access ready');
} catch (e) {
  console.log('Index idx_vault_cards_last_access skipped:', e.message);
}

console.log('Setup complete.');
