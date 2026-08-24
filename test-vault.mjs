import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.NEON_DATABASE_URL);
try {
  const r = await sql`CREATE TABLE IF NOT EXISTS vault_cards (
    id SERIAL PRIMARY KEY,
    client_id TEXT NOT NULL,
    pro_key TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, pro_key)
  )`;
  console.log("Table ready:", r);
  const count = await sql`SELECT COUNT(*) as count FROM vault_cards`;
  console.log("Count:", count[0].count);
} catch(e) {
  console.error("ERR:", e.message, e.stack);
}
