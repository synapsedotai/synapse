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

class FallbackEmbedder implements Embedder {
  constructor(private primary: Embedder, private fallback: Embedder) {}
  async embed(text: string): Promise<number[]> {
    try {
      return await this.primary.embed(text);
    } catch (e) {
      await trace({ tool: 'embed.fallback', ok: false, ms: 0, detailsRedacted: { primary: this.primary.model(), error: e instanceof Error ? e.message : String(e) } });
      return await this.fallback.embed(text);
    }
  }
  async getDim(): Promise<number> {
    try { return await this.primary.getDim(); } catch { return await this.fallback.getDim(); }
  }
  model(): string { return `${this.primary.model()}|fallback`; }
}

// Replace direct embedder with fallback wrapper so demos never break on transient errors
export function getEmbedderWithFallback(): Embedder {
  const base = getEmbedder();
  if (env.EMBED_FALLBACK) {
    const fallback = new MockEmbedder();
    return new FallbackEmbedder(base, fallback);
  }
  return base;
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
    let vector = json.data?.[0]?.embedding ?? [];
    let dim = vector.length;
    // If an existing dim is persisted, adjust to it for compatibility
    try {
      const persisted = fs.readFileSync(paths.embedDimFile, 'utf8');
      const target = Number(persisted.trim());
      if (target > 0 && target !== dim) {
        if (target < dim) vector = vector.slice(0, target);
        else if (target > dim) vector = [...vector, ...Array(target - dim).fill(0)];
        dim = target;
      }
    } catch {}
    if (!this.dimCached && dim > 0) {
      this.dimCached = dim;
      try {
        if (!fs.existsSync(paths.embedDimFile)) fs.writeFileSync(paths.embedDimFile, String(dim), 'utf8');
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

