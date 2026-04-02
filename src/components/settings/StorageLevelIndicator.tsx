import type { StorageAdapterType } from '../../utils/storage-service';
import { getAuthLevel } from '../../utils/google-drive';

const STORAGE_SEGMENTS = ['Basic', 'Enhanced', 'Sync', 'Persist'] as const;

export function StorageLevelIndicator({
  storageAdapter,
}: {
  driveConnected: boolean;
  storageAdapter?: StorageAdapterType | null;
}) {
  // driveConnected prop triggers re-render so getAuthLevel() reads fresh state
  const authLevel = getAuthLevel(); // 0=none, 1=local, 2=sync, 3=persist
  const enhanced = storageAdapter === 'opfs';

  // Each segment lights up independently based on what's available
  const active = [
    authLevel >= 1, // Basic: any local storage
    enhanced, // Enhanced: OPFS available
    authLevel >= 2, // Sync: Drive connected (implicit flow)
    authLevel >= 3, // Persist: Drive with auth code flow
  ];

  const description =
    authLevel >= 3
      ? 'Persistent sync -- data backed up to Google Drive'
      : authLevel >= 2
        ? 'Sync active -- re-auth required on refresh'
        : enhanced
          ? 'Enhanced local storage -- protected from routine browser cleanup'
          : authLevel >= 1
            ? 'Basic storage -- may be cleared during browser cleanup'
            : storageAdapter === null
              ? 'Detecting...'
              : 'Storage unavailable';

  return (
    <div>
      <span className="font-display text-ohm-muted text-xs tracking-widest uppercase">
        Storage Level
      </span>
      <div className="mt-1.5 flex gap-1">
        {STORAGE_SEGMENTS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                active[i] ? 'bg-ohm-powered/60' : 'bg-ohm-border'
              }`}
            />
            <span className="font-body text-ohm-muted/60 mt-0.5 block text-center text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>
      <p className="font-body text-ohm-muted/80 mt-1 text-xs">{description}</p>
    </div>
  );
}
