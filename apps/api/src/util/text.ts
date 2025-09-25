export function safeSubstring(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max);
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

