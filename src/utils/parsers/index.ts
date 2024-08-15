export function timeToSeconds(t: string): number {
  return (t?.match(/\d+/gm) || [0])
    .reverse()
    .map((s, i) => parseInt(s as string) * 60 ** i)
    .reduce((a, b) => a + b);
}

export function parseIntegerOr(n: string | number, or: number): number {
  return Number.isInteger(parseInt(n as string)) ? parseInt(n as string) : or;
}

// "data:02;body+head:async;void:;zero:;"
export function parseDataParams(str: string) {
  const params = str.split(';').flatMap(s => {
    const parsed = s.match(/([\+\w+]+):(\w+)?/);
    const value = parsed?.[2];
    if (value) return parsed[1].split('+').map(p => ({ [p]: value }));
  }).filter(_ => _);
  return Object.assign({}, ...params);
}

export function parseCSSUrl(s: string) {
  return s.replace(/url\("|\"\).*/g, '');
}