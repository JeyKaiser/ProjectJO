import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PASSWORD = encodeURIComponent('Resort2026.#$');
const CONN = `postgresql://postgres:${PASSWORD}@db.tstxmyowfesgaczlgjxp.supabase.co:5432/postgres`;

const SQL_FILES = [
  path.join(__dirname, 'database_schema.sql'),
  path.join(__dirname, 'migracion', 'seed_catalogos.sql'),
  path.join(__dirname, 'migracion', 'seed_fases_workflow.sql'),
];

async function run() {
  const client = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Conectado a Supabase PostgreSQL');

    for (const file of SQL_FILES) {
      if (!fs.existsSync(file)) {
        console.log(`  SKIP (no existe): ${path.basename(file)}`);
        continue;
      }
      const sql = fs.readFileSync(file, 'utf8');
      console.log(`\nEjecutando: ${path.basename(file)} (${sql.length} bytes)...`);
      await client.query(sql);
      console.log(`  OK: ${path.basename(file)}`);
    }

    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'jo'
      ORDER BY table_name
    `);
    console.log(`\n=== ${rows.length} tablas creadas en schema jo ===`);
    rows.forEach(r => console.log(`  jo.${r.table_name}`));

  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.position) {
      const sql = fs.readFileSync(SQL_FILES[0], 'utf8');
      const snippet = sql.substring(Math.max(0, err.position - 80), err.position + 40);
      console.error('Cerca de:', snippet);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
