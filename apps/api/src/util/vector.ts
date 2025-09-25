export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function vectorLiteral(values: number[]): string {
  // pgvector accepts text literal: "[v1, v2, ...]"
  return '[' + values.map(v => Number.isFinite(v) ? v.toFixed(6) : '0').join(',') + ']';
}

