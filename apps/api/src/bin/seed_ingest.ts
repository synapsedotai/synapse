import { withTransaction } from '../db.js';
import { getEmbedder } from '../adapters/embedder.js';
import { chunk } from '../adapters/chunker.js';

export async function ingestFile({ employeeId, title, text, visibility }: { employeeId: string; title: string; text: string; visibility: 'private'|'team'|'org' }) {
  const embedder = getEmbedder();
  const pieces = chunk(text, { size: 550, overlap: 70 });
  await withTransaction(async (client) => {
    const doc = await client.query(
      `insert into docs(id, employee_id, title, source_url, visibility, created_at)
       values (gen_random_uuid(), $1, $2, null, $3, now()) returning id`,
      [employeeId, title, visibility]
    );
    const docId = doc.rows[0].id as string;
    for (const p of pieces) {
      const v = await embedder.embed(p);
      await client.query(
        `insert into chunks(id, doc_id, text_snippet, embedding)
         values (gen_random_uuid(), $1, $2, $3)`,
        [docId, p.slice(0, 400), v]
      );
    }
  });
}

