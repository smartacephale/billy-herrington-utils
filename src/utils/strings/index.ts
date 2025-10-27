export function stringToWords(s: string): Array<string> {
  return s
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((_) => _);
}

export function sanitizeStr(s: string) {
  return s?.replace(/\n|\t/g, ' ').replace(/ {2,}/g, ' ').trim().toLowerCase() || '';
}
