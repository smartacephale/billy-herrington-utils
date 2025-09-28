export function formatTimeToHHMMSS(timeString: string): string {
  const regex: RegExp = /(?:(\d+)\s*h\s*)?(?:(\d+)\s*mi?n?\s*)?(?:(\d+)\s*sec)?/;
  const match: RegExpMatchArray | null = timeString.match(regex);
  const h: number = parseInt(match?.[1] || '0');
  const m: number = parseInt(match?.[2] || '0');
  const s: number = parseInt(match?.[3] || '0');
  const pad = (num: number): string => String(num).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// "01:22:03" -> 4923
export function timeToSeconds(t: string): number {
  const r = /sec|min|h|m/.test(t) ? formatTimeToHHMMSS(t) : t;
  return (r?.match(/\d+/gm) || [0])
    .reverse()
    .map((s, i) => parseInt(s as string) * 60 ** i)
    .reduce((a, b) => a + b);
}

export function parseIntegerOr(n: string | number, or: number): number {
  return (num => Number.isNaN(num) ? or : num)(parseInt(n as string));
}

// "data:02;body+head:async;void:;zero:;"
export function parseDataParams(str: string): Record<string, string> {
  const paramsStr = decodeURI(str.trim()).split(';');
  return paramsStr.reduce((acc, s) => {
    const parsed = s.match(/([\+\w]+):([\w\-\ ]+)?/);
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
