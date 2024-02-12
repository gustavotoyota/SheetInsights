import { useEffect, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: () => T,
): [T, (value: T | ((oldValue: T) => T)) => void] {
  const [value, setValue] = useState(() => {
    const item =
      typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;

    if (item) {
      try {
        return JSON.parse(item);
      } catch (error) {
        console.error(error);
      }
    }

    return initialValue();
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
