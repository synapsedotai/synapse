import fs from 'fs';
import path from 'path';
import { pool, query } from '../db.js';

async function main() {
  const schemaPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await query(sql);
  await pool.end();
  console.log('migrated');
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});

