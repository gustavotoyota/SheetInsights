import { useIndexedDB } from "@/misc/use-indexeddb";

export function useAppIndexedDB<T>(
  key: string,
  initialValue: () => T
): [T, (value: T | ((oldValue: T) => T)) => void] {
  return useIndexedDB("sheetinsights", "fields", key, initialValue);
}
