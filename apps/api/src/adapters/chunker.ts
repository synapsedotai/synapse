// Approximate tokens. For English, ~4 chars per token on average.
function estimateTokens(s: string): number {
  const chars = s.length;
  const words = s.trim().split(/\s+/).length;
  // Blend char and word heuristics for robustness
  return Math.max(1, Math.ceil(Math.max(chars / 4, words * 0.75)));
}

function splitByParagraphs(text: string): string[] {
  // Split on blank lines or markdown headings/list boundaries
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const blocks: string[] = [];
  let buf: string[] = [];
  const flush = () => {
    const joined = buf.join('\n').trim();
    if (joined) blocks.push(joined);
    buf = [];
  };
  for (const line of lines) {
    const isBoundary = /^\s*$/.test(line) || /^(#{1,6}\s|[-*]\s|\d+\.\s)/.test(line);
    if (isBoundary) {
      flush();
      if (line.trim()) blocks.push(line.trim());
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks.filter(Boolean);
}

function splitIntoSentences(block: string): string[] {
  // Simple sentence splitter handling ., !, ? and newlines
  const sentences: string[] = [];
  let acc = '';
  for (const part of block.split(/(\n+|[.!?]+\s+)/)) {
    if (!part) continue;
    acc += part;
    if (/\n+/.test(part) || /[.!?]+\s+/.test(part)) {
      const s = acc.trim();
      if (s) sentences.push(s);
      acc = '';
    }
  }
  const tail = acc.trim();
  if (tail) sentences.push(tail);
  return sentences.length ? sentences : [block.trim()];
}

export function chunk(
  text: string,
  opts?: { size?: number; overlap?: number; tokenBudget?: number; overlapTokens?: number }
): string[] {
  // Back-compat mapping from char size/overlap to token budgets
  const tokenBudget = Math.max(100, Math.min(1200, opts?.tokenBudget ?? Math.ceil((opts?.size ?? 550) / 4)));
  const overlapTokens = Math.max(0, Math.min(tokenBudget - 1, opts?.overlapTokens ?? Math.ceil((opts?.overlap ?? 70) / 4)));

  const blocks = splitByParagraphs(text);
  const chunks: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;
  let lastOverlap: string[] = [];

  const pushChunk = () => {
    if (current.length === 0) return;
    const chunkText = current.join(' ').trim();
    if (chunkText) chunks.push(chunkText);
    // compute overlap sentences from the end
    if (overlapTokens > 0) {
      const tail: string[] = [];
      let t = 0;
      for (let i = current.length - 1; i >= 0; i--) {
        const s = current[i];
        const st = estimateTokens(s);
        if (t + st > overlapTokens && tail.length) break;
        tail.unshift(s);
        t += st;
      }
      lastOverlap = tail;
    } else {
      lastOverlap = [];
    }
    current = [];
    currentTokens = 0;
  };

  for (const block of blocks) {
    const blockTokens = estimateTokens(block);
    if (blockTokens <= tokenBudget) {
      // Try to fit block as a whole
      if (currentTokens + blockTokens <= tokenBudget) {
        current.push(block);
        currentTokens += blockTokens;
      } else {
        pushChunk();
        // seed overlap into next chunk
        if (lastOverlap.length) {
          current.push(...lastOverlap);
          currentTokens = lastOverlap.reduce((a, s) => a + estimateTokens(s), 0);
        }
        current.push(block);
        currentTokens += blockTokens;
      }
    } else {
      // Block too large: split into sentences and pack
      const sentences = splitIntoSentences(block);
      for (const s of sentences) {
        const st = estimateTokens(s);
        if (st > tokenBudget) {
          // Hard cut very long sentences
          const approxChars = Math.max(50, Math.floor(tokenBudget * 4));
          for (let i = 0; i < s.length; i += approxChars) {
            const slice = s.slice(i, i + approxChars);
            const sv = estimateTokens(slice);
            if (currentTokens + sv > tokenBudget) {
              pushChunk();
              if (lastOverlap.length) {
                current.push(...lastOverlap);
                currentTokens = lastOverlap.reduce((a, v) => a + estimateTokens(v), 0);
              }
            }
            current.push(slice);
            currentTokens += sv;
          }
          continue;
        }
        if (currentTokens + st > tokenBudget) {
          pushChunk();
          if (lastOverlap.length) {
            current.push(...lastOverlap);
            currentTokens = lastOverlap.reduce((a, v) => a + estimateTokens(v), 0);
          }
        }
        current.push(s);
        currentTokens += st;
      }
    }
  }
  pushChunk();
  return chunks;
}

