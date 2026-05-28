import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PASSWORD = encodeURIComponent('Resort2026.#$');
const CONN = `postgresql://postgres:${PASSWORD}@db.tstxmyowfesgaczlgjxp.supabase.co:5432/postgres`;

async function run() {
  const client = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Conectado a Supabase');

    const sql = `ALTER TABLE jo.fabrics ADD COLUMN IF NOT EXISTS image_url TEXT`;
    console.log('Ejecutando:', sql);
    await client.query(sql);
    console.log('OK: columna image_url agregada a jo.fabrics');

    const { rows } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'jo' AND table_name = 'fabrics' AND column_name = 'image_url'
    `);
    console.log('Verificacion:', JSON.stringify(rows));
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
