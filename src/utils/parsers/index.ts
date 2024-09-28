export function timeToSeconds(t: string): number {
  return (t?.match(/\d+/gm) || [0])
    .reverse()
    .map((s, i) => parseInt(s as string) * 60 ** i)
    .reduce((a, b) => a + b);
}

export function parseIntegerOr(n: string | number, or: number): number {
  return (num => Number.isNaN(num) ? or : num)(parseInt(n as string));
}

// "data:02;body+head:async;void:;zero:;"
export function parseDataParams(str: string): Record<string, string> {
  return str.split(';').reduce((acc, s) => {
    const parsed = s.match(/([\+\w]+):(\w+)?/);
    if (parsed) {
      const [, key, value] = parsed;
      if (value) {
        key.split('+').forEach(p => { acc[p] = value; });
      }
    }
    return acc;
  }, {} as Record<string, string>);
}

export function parseCSSUrl(s: string) {
  return s.replace(/url\("|\"\).*/g, '');
}
