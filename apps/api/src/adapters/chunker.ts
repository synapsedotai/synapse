export function chunk(text: string, opts?: { size?: number; overlap?: number }): string[] {
  const size = Math.max(100, Math.min(1000, opts?.size ?? 500));
  const overlap = Math.max(0, Math.min(size - 1, opts?.overlap ?? 70));
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + size);
    const piece = text.slice(i, end);
    chunks.push(piece);
    if (end >= text.length) break;
    i = end - overlap;
  }
  return chunks;
}

