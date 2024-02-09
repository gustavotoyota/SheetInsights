export function swap<T extends object>(obj: T, a: keyof T, b: keyof T): T {
  const temp = obj[a];
  obj[a] = obj[b];
  obj[b] = temp;

  return obj;
}
