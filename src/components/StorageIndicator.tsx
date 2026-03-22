import { HardDrive } from 'lucide-react';
import type { StorageAdapterType } from '../utils/storage-service';

interface StorageIndicatorProps {
  adapter: StorageAdapterType | null;
}

export function StorageIndicator({ adapter }: StorageIndicatorProps) {
  if (adapter !== 'opfs') return null;

  return (
    <span
      className="text-ohm-muted rounded-md p-1.5"
      aria-label="Using device storage (OPFS)"
      title="Using device storage (OPFS)"
    >
      <HardDrive size={16} />
    </span>
  );
}
