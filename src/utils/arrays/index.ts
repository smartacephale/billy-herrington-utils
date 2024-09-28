export function chunks<T>(arr: Array<T>, n: number): Array<Array<T>> {
  return Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
}

export function range(size: number, startAt: number = 1, step: number = 1): number[] {
  return Array.from({ length: size }, (_, index) => startAt + index * step);
}
