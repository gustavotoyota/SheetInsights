export type NestedObjPaths<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? never
      : [K] | [K, ...NestedObjPaths<T[K]>]
    : never;
}[keyof T];

export type NestedValueType<T, K extends any[]> = K extends [
  infer F,
  ...infer R
]
  ? F extends keyof T
    ? R extends any[]
      ? NestedValueType<T[F], R>
      : T[F]
    : never
  : T;

export function leanClone<T extends object>(
  obj: T,
  path?: NestedObjPaths<T> | []
): T {
  const clonedRoot = (Array.isArray(obj) ? [...obj] : { ...obj }) as T;

  if (!path) {
    return clonedRoot;
  }

  let currentObj: any = clonedRoot;

  for (let i = 0; i < path.length; i++) {
    const prop = path[i];

    if (Array.isArray(currentObj[prop])) {
      currentObj[prop] = [...currentObj[prop]];
    } else {
      currentObj[prop] = { ...currentObj[prop] };
    }

    currentObj = currentObj[prop];
  }

  return clonedRoot;
}

export function leanCloneThen<
  Obj extends object,
  Path extends NestedObjPaths<Obj> | [],
  TargetObj extends NestedValueType<Obj, Path>
>(obj: Obj, path: Path, func: (targetObj: TargetObj, obj: Obj) => void): Obj {
  const clonedObj = leanClone(obj, path as any);

  let currentObj: any = clonedObj;

  for (let i = 0; i < path.length; i++) {
    currentObj = currentObj[path[i]];
  }

  func(currentObj, clonedObj);

  return clonedObj;
}
