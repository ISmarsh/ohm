import { useState } from 'react';
import { Settings, X, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  capacity: number;
  onSetCapacity: (capacity: number) => void;
  driveAvailable?: boolean;
  driveConnected?: boolean;
  onConnectDrive?: () => void;
  onDisconnectDrive?: () => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onRemoveCategory,
  capacity,
  onSetCapacity,
  driveAvailable,
  driveConnected,
  onConnectDrive,
  onDisconnectDrive,
}: SettingsDialogProps) {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      onAddCategory(trimmed);
    }
    setNewCategoryName('');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setNewCategoryName('');
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <div className="mb-3 flex items-center gap-2">
          <Settings size={16} className="text-ohm-muted" />
          <DialogTitle className="font-display text-xs uppercase tracking-widest text-ohm-muted">
            Settings
          </DialogTitle>
        </div>
        <DialogDescription className="sr-only">Board settings</DialogDescription>

        {/* Categories */}
        <div className="mb-5">
          <span className="mb-2 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
            Categories
          </span>
          <div className="flex flex-col gap-1.5">
            {categories.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-md border border-ohm-border bg-ohm-bg px-3 py-1.5"
              >
                <span className="font-body text-sm text-ohm-text">{cat}</span>
                <button
                  type="button"
                  onClick={() => onRemoveCategory(cat)}
                  className="rounded-sm p-0.5 text-ohm-muted transition-colors hover:text-ohm-live"
                  aria-label={`Remove ${cat} category`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCategory();
            }}
            className="mt-2 flex gap-2"
          >
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category..."
              aria-label="New category name"
              className="flex-1 border-ohm-border bg-ohm-bg px-3 py-1.5 font-body text-sm text-ohm-text placeholder:text-ohm-muted/40 focus-visible:ring-ohm-spark/20 focus-visible:ring-offset-0"
            />
            <Button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="bg-ohm-spark/20 font-display text-xs uppercase tracking-wider text-ohm-spark hover:bg-ohm-spark/30 active:bg-ohm-spark/40"
            >
              Add
            </Button>
          </form>
        </div>

        {/* Capacity */}
        <div>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
            Live Energy Capacity
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSetCapacity(Math.max(1, capacity - 1))}
              disabled={capacity <= 1}
              className="h-8 w-8 border-ohm-border text-ohm-muted hover:text-ohm-text"
              aria-label="Decrease capacity"
            >
              <Minus size={14} />
            </Button>
            <span className="min-w-[2ch] text-center font-display text-lg font-bold text-ohm-text">
              {capacity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSetCapacity(capacity + 1)}
              className="h-8 w-8 border-ohm-border text-ohm-muted hover:text-ohm-text"
              aria-label="Increase capacity"
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Google Drive */}
        {driveAvailable && (
          <div className="mt-5 border-t border-ohm-border pt-5">
            <span className="mb-2 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
              Google Drive Sync
            </span>
            {driveConnected ? (
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-ohm-powered">Connected</span>
                <Button
                  variant="outline"
                  onClick={onDisconnectDrive}
                  className="border-ohm-border text-xs text-ohm-muted hover:text-ohm-live"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={onConnectDrive}
                className="w-full bg-ohm-spark/20 font-display text-xs uppercase tracking-wider text-ohm-spark hover:bg-ohm-spark/30"
              >
                Connect Google Drive
              </Button>
            )}
            <p className="mt-1.5 font-body text-[11px] text-ohm-muted/60">
              Sync your board across devices. Data stored privately in app storage.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
