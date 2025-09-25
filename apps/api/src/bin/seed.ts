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
  // Seed org structure and meetings for demo
  await seedOrgStructure(50);
  await seedExpertiseAndMeetings();
  await pool.end();
  console.log('seeded');
}

async function seedOrgStructure(target: number) {
  const people = await prisma.employees.findMany({ select: { id: true } });
  if (people.length < 10) return; // rely on CSV; keep light
  // Assign one c-suite, a few managers, rest ICs
  const ceo = people[0].id;
  await query(`update employees set org_role = 'c_suite', manager_id = null where id = $1`, [ceo]);
  const managers = people.slice(1, 6).map(p => p.id);
  for (const mid of managers) {
    await query(`update employees set org_role = 'manager', manager_id = $1 where id = $2`, [ceo, mid]);
  }
  let m = 0;
  for (const p of people.slice(6, Math.min(target, people.length))) {
    await query(`update employees set org_role = 'ic', manager_id = $1 where id = $2`, [managers[m % managers.length], p.id]);
    m++;
  }
}

async function seedExpertiseAndMeetings() {
  // Create a meeting on Kubernetes between two early employees if not present
  const emps = await prisma.employees.findMany({ select: { id: true }, take: 50 });
  if (emps.length < 2) return;
  const ins = await query<{ id: string }>(
    `insert into meetings(topic, summary) values ($1, $2) returning id`,
    ['Kubernetes', 'Probe tuning session']
  );
  const meetingId = ins.rows[0].id;
  await query(`insert into meeting_participants(meeting_id, employee_id) values ($1, $2)`, [meetingId, emps[0].id]);
  await query(`insert into meeting_participants(meeting_id, employee_id) values ($1, $2)`, [meetingId, emps[1].id]);
  const t = await prisma.topics.upsert({ where: { name: 'Kubernetes' }, update: {}, create: { name: 'Kubernetes' } });
  await query(
    `insert into meeting_topics(meeting_id, topic_id, confidence)
     values ($1, $2, $3)
     on conflict (meeting_id, topic_id) do update set confidence = excluded.confidence`,
    [meetingId, t.id as any, 0.9]
  );

  // Diversify topics across first 20 employees
  const demoTopics = ['Terraform', 'CI/CD', 'IAM', 'Payments', 'Postgres', 'React', 'TypeScript'];
  for (let i = 0; i < Math.min(20, emps.length); i++) {
    const e = emps[i];
    for (const name of demoTopics.slice(0, (i % demoTopics.length) + 1)) {
      const top = await prisma.topics.upsert({ where: { name }, update: {}, create: { name } });
      await prisma.expertise_scores.upsert({
        where: { employee_id_topic_id: { employee_id: e.id, topic_id: top.id } },
        create: { employee_id: e.id, topic_id: top.id, score: Math.max(0.4, Math.random()), freshness_days: Math.floor(Math.random() * 60) },
        update: { score: { set: Math.max(0.4, Math.random()) }, freshness_days: { set: Math.floor(Math.random() * 60) } }
      } as any);
    }
  }
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});

