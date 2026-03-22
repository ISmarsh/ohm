import { createStorageService } from '../../.toolbox/lib/storage-service';
import type { StorageService, StorageAdapterType } from '../../.toolbox/lib/storage-service';

export type { StorageService, StorageAdapterType };

/** Shared StorageService instance — scoped to 'ohm' prefix. */
export const storageService: Promise<StorageService> = createStorageService({
  prefix: 'ohm',
  logPrefix: '[Ohm]',
});
