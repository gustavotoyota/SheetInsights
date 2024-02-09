import { useEffect, useRef, useState } from "react";

export function useIndexedDB<T>(
  dbName: string,
  storeName: string,
  key: string,
  initialValue: () => T
): [T, (value: T | ((oldValue: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);

  const loaded = useRef(false);

  useEffect(() => {
    let db: IDBDatabase | null = null;

    const openRequest = window.indexedDB.open(dbName);

    openRequest.onerror = function (event: any) {
      console.error("IndexedDB error:", event.target?.error);
    };

    openRequest.onsuccess = function (event) {
      db = openRequest.result;

      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = function (event: any) {
        console.error("IndexedDB request error:", event.target?.error);
      };

      request.onsuccess = function (event) {
        if (request.result !== undefined) {
          setValue(request.result);
        }
      };

      transaction.oncomplete = function () {
        db?.close();

        loaded.current = true;
      };

      transaction.onerror = function (event: any) {
        console.error("IndexedDB transaction error:", event.target?.error);

        loaded.current = true;
      };
    };

    openRequest.onupgradeneeded = function (event: any) {
      db = event.target?.result;

      db?.createObjectStore(storeName);
    };
  }, []);

  useEffect(() => {
    if (!loaded.current) {
      return;
    }

    let db: IDBDatabase | null = null;

    const openRequest = window.indexedDB.open(dbName);

    openRequest.onerror = function (event: any) {
      console.error("IndexedDB error:", event.target?.error);
    };

    openRequest.onsuccess = function (event) {
      db = openRequest.result;

      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      store.put(value, key);

      transaction.oncomplete = function () {
        db?.close();
      };
    };

    openRequest.onupgradeneeded = function (event: any) {
      db = event.target?.result;

      db?.createObjectStore(storeName);
    };
  }, [dbName, storeName, key, value]);

  return [value, setValue] as const;
}
