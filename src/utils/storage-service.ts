import { createStorageService } from '../../.toolbox/lib/storage-service';
import type { StorageService } from '../../.toolbox/lib/storage-service';

export type { StorageService };

/** Shared StorageService instance — scoped to 'ohm' prefix. */
export const storageService: Promise<StorageService> = createStorageService({
  prefix: 'ohm',
  logPrefix: '[Ohm]',
});
