/** Test stub for .toolbox/lib/storage-service */

import type { StorageService, StorageServiceOptions } from '../../.toolbox/lib/storage-service';

export type { StorageService, StorageServiceOptions };
export type { StorageAdapterType } from '../../.toolbox/lib/storage-service';

export async function createStorageService(_opts?: StorageServiceOptions): Promise<StorageService> {
  const store = new Map<string, string>();

  return {
    adapter: 'localstorage',
    async get<T>(key: string): Promise<T | null> {
      const raw = store.get(key);
      if (raw === undefined) return null;
      return JSON.parse(raw) as T;
    },
    async set<T>(key: string, value: T): Promise<void> {
      store.set(key, JSON.stringify(value));
    },
    async delete(key: string): Promise<void> {
      store.delete(key);
    },
    async clear(): Promise<void> {
      store.clear();
    },
    async keys(): Promise<string[]> {
      return [...store.keys()];
    },
  };
}
