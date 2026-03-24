import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

const { Pool } = pg;

const MIGRATIONS_TABLE = 'schema_migrations';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(
  __dirname,
  '../src/infrastructure/database/migrations',
);

function getDatabaseConfig() {
  return {
    host: process.env.POSTGRES_HOST ?? '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'book_maker',
    user: process.env.POSTGRES_USER ?? 'book_maker',
    password: process.env.POSTGRES_PASSWORD ?? 'book_maker',
  };
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id BIGSERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query(
    `SELECT filename FROM ${MIGRATIONS_TABLE} ORDER BY filename ASC`,
  );

  return new Set(result.rows.map((row) => row.filename));
}

async function getMigrationFiles() {
  const entries = await readdir(migrationsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function applyMigration(client, filename) {
  const migrationPath = path.join(migrationsDir, filename);
  const sql = await readFile(migrationPath, 'utf8');

  await client.query('BEGIN');

  try {
    await client.query(sql);
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES ($1)`,
      [filename],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function run() {
  const pool = new Pool(getDatabaseConfig());
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const [files, appliedMigrations] = await Promise.all([
      getMigrationFiles(),
      getAppliedMigrations(client),
    ]);

    const pendingMigrations = files.filter(
      (filename) => !appliedMigrations.has(filename),
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    for (const filename of pendingMigrations) {
      await applyMigration(client, filename);
      console.log(`Applied migration: ${filename}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
