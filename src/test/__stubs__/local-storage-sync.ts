/** Test stub for .toolbox/lib/local-storage-sync */
export function createLocalStorage<T>(opts: {
  storageKey: string;
  logPrefix?: string;
  version?: number;
  sanitize?: (raw: unknown) => T;
  createDefault: () => T;
}) {
  let data: T = opts.createDefault();
  return {
    loadFromLocal: () => data,
    saveToLocal: (val: T) => {
      data = val;
    },
  };
}
