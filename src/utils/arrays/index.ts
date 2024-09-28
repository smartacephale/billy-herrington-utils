export function chunks<T>(arr: Array<T>, n: number): Array<Array<T>> {
  const res = [];
  for (let i = 0; i < arr.length; i += n) {
    res.push(arr.slice(i, i + n));
  }
  return res;
}

export function range(size: number, startAt: number = 1, step: number = 1): number[] {
  return Array.from({ length: size }, (_, index) => startAt + index * step);
}
