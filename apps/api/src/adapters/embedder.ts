import fs from 'fs';
import { env, paths } from '../env.js';
import { setVectorDimIfEmpty } from '../db.js';
import { trace } from '../util/trace.js';
// Using HTTP for embeddings to avoid SDK version mismatches

export interface Embedder {
  embed(text: string): Promise<number[]>;
  getDim(): Promise<number>;
  model(): string;
}

function seededRandom(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

export class MockEmbedder implements Embedder {
  private dimVal = 256;
  async embed(text: string): Promise<number[]> {
    const start = Date.now();
    const rnd = seededRandom(hashStringToSeed(text));
    const v = Array.from({ length: this.dimVal }, () => rnd());
    const ms = Date.now() - start;
    await trace({ tool: 'embed.mock', ok: true, ms, detailsRedacted: { dim: this.dimVal } });
    try {
      // Persist dim for healthz and ensure DB column has matching dim when empty
      if (!fs.existsSync(paths.embedDimFile)) {
        fs.writeFileSync(paths.embedDimFile, String(this.dimVal), 'utf8');
      }
      await setVectorDimIfEmpty(this.dimVal);
    } catch {
      void 0;
    }
    return v;
  }
  async getDim(): Promise<number> { return this.dimVal; }
  model(): string { return 'mock'; }
}


export function getEmbedder(): Embedder {
  if (env.EMBED_MOCK) return new MockEmbedder();
  if (env.OPENAI_API_KEY) return new OpenAIEmbedder();
  return new MockEmbedder();
}

class OpenAIEmbedder implements Embedder {
  private dimCached: number | null = null;
  model(): string { return env.OPENAI_EMBED_MODEL; }
  async embed(text: string): Promise<number[]> {
    const start = Date.now();
    const resp = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${env.OPENAI_API_KEY ?? ''}`
      },
      body: JSON.stringify({ model: env.OPENAI_EMBED_MODEL, input: text })
    });
    if (!resp.ok) {
      const body = await resp.text();
      await trace({ tool: 'embed.openai', ok: false, ms: Date.now() - start, detailsRedacted: { status: resp.status, body: body.slice(0, 200) } });
      throw new Error(`Embedding failed: ${resp.status}`);
    }
    type OpenAIEmbeddingResponse = { data: Array<{ embedding: number[] }> };
    const json = (await resp.json()) as OpenAIEmbeddingResponse;
    const vector = json.data?.[0]?.embedding ?? [];
    const dim = vector.length;
    if (!this.dimCached && dim > 0) {
      this.dimCached = dim;
      try {
        fs.writeFileSync(paths.embedDimFile, String(dim), 'utf8');
        await setVectorDimIfEmpty(dim);
      } catch {
        void 0;
      }
    }
    await trace({ tool: 'embed.openai', ok: true, ms: Date.now() - start, detailsRedacted: { dim } });
    return vector;
  }
  async getDim(): Promise<number> {
    if (this.dimCached) return this.dimCached;
    try {
      const dimStr = fs.readFileSync(paths.embedDimFile, 'utf8');
      const dim = Number(dimStr.trim());
      if (dim > 0) {
        this.dimCached = dim;
        return dim;
      }
    } catch {}
    const v = await this.embed('probe');
    return v.length;
  }
}

