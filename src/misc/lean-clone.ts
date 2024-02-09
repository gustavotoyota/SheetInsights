export type NestedObjPaths<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? never
      : [K] | [K, ...NestedObjPaths<T[K]>]
    : never;
}[keyof T];

export function leanClone<T extends object>(
  obj: T,
  path?: NestedObjPaths<T> | []
): T {
  const clonedRoot = Array.isArray(obj) ? [...obj] : { ...obj };

  if (!path) {
    return clonedRoot as any;
  }

  let currentLevel: any = clonedRoot;

  for (let i = 0; i < path.length; i++) {
    const prop = path[i];

    if (Array.isArray(currentLevel[prop])) {
      currentLevel[prop] = [...currentLevel[prop]];
    } else {
      currentLevel[prop] = { ...currentLevel[prop] };
    }

    currentLevel = currentLevel[prop];
  }

  return clonedRoot as any;
}

export function leanCloneThenSet<T extends object>(
  obj: T,
  path: NestedObjPaths<T>,
  key: any,
  value: any
): T {
  const clonedObj = leanClone(obj, path as any);

  let currentLevel: any = clonedObj;

  for (let i = 0; i < path.length; i++) {
    currentLevel = currentLevel[path[i]];
  }

  currentLevel[key] = value;

  return clonedObj;
}

export function leanCloneThenSwap<T extends object>(
  obj: T,
  path: NestedObjPaths<T> | [],
  key1: any,
  key2: any
): T {
  const clonedObj = leanClone(obj, path);

  let currentLevel: any = clonedObj;

  for (let i = 0; i < path.length; i++) {
    currentLevel = currentLevel[path[i]];
  }

  const temp = currentLevel[key1];
  currentLevel[key1] = currentLevel[key2];
  currentLevel[key2] = temp;

  return clonedObj;
}

export function leanCloneThenPush<T extends object>(
  obj: T,
  path: NestedObjPaths<T> | [],
  value: any
): T {
  const clonedObj = leanClone(obj, path as any);

  let currentLevel: any = clonedObj;

  for (let i = 0; i < path.length; i++) {
    currentLevel = currentLevel[path[i]];
  }

  currentLevel.push(value);

  return clonedObj;
}
