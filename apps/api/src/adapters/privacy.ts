import { query, withTransaction } from '../db.js';

export async function exportForEmployee(employeeId: string) {
  const [topics, docs, snippets] = await Promise.all([
    query(`select t.name, e.score, e.freshness_days from expertise_scores e join topics t on t.id = e.topic_id where e.employee_id = $1`, [employeeId]),
    query(`select id, title, source_url, visibility, created_at from docs where employee_id = $1`, [employeeId]),
    query(`select c.text_snippet, c.doc_id from chunks c join docs d on d.id = c.doc_id where d.employee_id = $1`, [employeeId])
  ]);
  return {
    topics: topics.rows,
    docs: docs.rows,
    snippets: snippets.rows.map(r => ({ text: String(r.text_snippet).slice(0, 400), docId: r.doc_id }))
  };
}

export async function deleteForEmployee(employeeId: string) {
  await withTransaction(async (client) => {
    await client.query(`delete from expertise_scores where employee_id = $1`, [employeeId]);
    // delete chunks tied to user's docs
    await client.query(`delete from chunks where doc_id in (select id from docs where employee_id = $1)`, [employeeId]);
    // keep docs metadata but could anonymize title/source if needed
  });
}

