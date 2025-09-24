import fs from 'fs';
import path from 'path';
import { pool, query } from '../db.js';
import { fileURLToPath } from 'url';
import { ingestFile } from './seed_ingest.js';
import { extractTopics } from '../adapters/kb.js';
import { prisma } from '../db.js';

async function seedEmployees(csvPath: string) {
  const csv = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
  const [header, ...rows] = csv;
  for (const row of rows) {
    const [email, name, team, role, pay_band] = row.split(',');
    await query(
      `insert into employees(id, email, name, team, role, pay_band)
       values (gen_random_uuid(), $1, $2, $3, $4, $5)
       on conflict (email) do update set name = excluded.name`,
      [email, name, team, role, Number(pay_band)]
    );
  }
}

async function main() {
  const baseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../seeds');
  await seedEmployees(path.join(baseDir, 'employees.csv'));

  // pick a few employees to attribute docs to
  const employees = await query<{ id: string; email: string }>(`select id, email from employees order by email asc`);
  const owners = employees.rows.slice(0, 5);
  const docsDir = path.join(baseDir, 'docs');
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
  let ownerIdx = 0;
  for (const f of files) {
    const full = path.join(docsDir, f);
    const text = fs.readFileSync(full, 'utf8');
    const title = text.split('\n')[0].trim();
    const employeeId = owners[ownerIdx % owners.length].id;
    ownerIdx++;
    await ingestFile({ employeeId, title, text, visibility: 'org' });
    // derive initial expertise from doc content
    const topics = await extractTopics(text, 3);
    for (const t of topics) {
      const topic = await prisma.topics.upsert({
        where: { name: t.name },
        create: { name: t.name },
        update: { name: t.name }
      });
      await prisma.expertise_scores.upsert({
        where: { employee_id_topic_id: { employee_id: employeeId, topic_id: topic.id } },
        create: { employee_id: employeeId, topic_id: topic.id, score: t.confidence, freshness_days: 0 },
        update: { score: { set: t.confidence }, freshness_days: { set: 0 } }
      } as any);
    }
  }
  await pool.end();
  console.log('seeded');
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});

