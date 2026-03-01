import { Cloud, Loader2, CloudAlert, WifiOff } from 'lucide-react';
import type { SyncStatus } from '../hooks/useDriveSync';

interface SyncIndicatorProps {
  connected: boolean;
  status: SyncStatus;
  onSync: () => void;
}

const statusConfig: Record<SyncStatus, { icon: typeof Cloud; className: string; label: string }> = {
  idle: { icon: Cloud, className: 'text-ohm-muted', label: 'Drive connected' },
  syncing: { icon: Loader2, className: 'text-ohm-spark animate-spin', label: 'Syncing...' },
  synced: { icon: Cloud, className: 'text-ohm-powered', label: 'Synced to Drive' },
  error: { icon: CloudAlert, className: 'text-ohm-live', label: 'Sync error - tap to retry' },
  offline: { icon: WifiOff, className: 'text-ohm-muted', label: 'Offline' },
};

export function SyncIndicator({ connected, status, onSync }: SyncIndicatorProps) {
  if (!connected) return null;

  const { icon: Icon, className, label } = statusConfig[status];

  return (
    <button
      type="button"
      onClick={onSync}
      className={`rounded-md p-1.5 transition-colors hover:bg-ohm-surface ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}
