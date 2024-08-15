export function stringToWords(s: string): Array<string> {
  return s.split(",").map(s => s.trim().toLowerCase()).filter(_ => _);
}

export function sanitizeStr(s: string) {
  return s?.replace(/\n|\t/, ' ').replace(/ {2,}/, ' ').trim().toLowerCase() || "";
}
