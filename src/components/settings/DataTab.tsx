import type { RefObject } from 'react';
import { X, Download, Upload, Save, RotateCcw, Trash2, Database } from 'lucide-react';
import type { OhmBoard } from '../../types/board';
import type { StorageAdapterType } from '../../utils/storage-service';
import { Button } from '../ui/button';
import type { RestorePoint } from '../../utils/restore-points';
import { StorageLevelIndicator } from './StorageLevelIndicator';

interface DataTabProps {
  driveAvailable?: boolean;
  driveConnected?: boolean;
  onConnectDrive?: () => void;
  onDisconnectDrive?: () => void;
  handleExport: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importPending: OhmBoard | null;
  handleImportMerge: () => void;
  handleImportReplace: () => void;
  setImportPending: (v: OhmBoard | null) => void;
  restorePoints: RestorePoint[];
  handleCreateRestorePoint: () => void;
  handleRestore: (rp: RestorePoint) => void;
  handleDeleteRestorePoint: (id: string) => void;
  confirmRestoreId: string | null;
  formatDate: (iso: string) => string;
  storageAdapter?: StorageAdapterType | null;
}

export function DataTab({
  driveAvailable,
  driveConnected,
  onConnectDrive,
  onDisconnectDrive,
  handleExport,
  fileInputRef,
  handleFileSelected,
  importPending,
  handleImportMerge,
  handleImportReplace,
  setImportPending,
  restorePoints,
  handleCreateRestorePoint,
  handleRestore,
  handleDeleteRestorePoint,
  confirmRestoreId,
  formatDate,
  storageAdapter,
}: DataTabProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Google Drive */}
      {driveAvailable && (
        <section>
          <div className="flex items-center gap-2">
            <Database size={14} className="text-ohm-muted" />
            <span className="font-display text-ohm-muted text-xs tracking-widest uppercase">
              Google Drive Sync
            </span>
          </div>
          <p className="font-body text-ohm-muted/80 mt-1.5 mb-3 text-xs">
            Sync your board across devices. Data stored privately in app storage.
          </p>
          {driveConnected ? (
            <div className="flex items-center justify-between">
              <span className="font-body text-ohm-powered text-sm">Connected</span>
              <Button
                variant="outline"
                onClick={onDisconnectDrive}
                className="border-ohm-border text-ohm-muted hover:text-ohm-live text-xs"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={onConnectDrive}
              className="bg-ohm-spark/20 font-display text-ohm-spark hover:bg-ohm-spark/30 w-full text-xs tracking-wider uppercase"
            >
              Connect Google Drive
            </Button>
          )}
        </section>
      )}

      {/* Export / Import */}
      <section>
        <div className="flex items-center gap-2">
          <Download size={14} className="text-ohm-muted" />
          <span className="font-display text-ohm-muted text-xs tracking-widest uppercase">
            Export / Import
          </span>
        </div>
        <p className="font-body text-ohm-muted/80 mt-1.5 mb-3 text-xs">
          Back up your board or restore from a file.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-ohm-border text-ohm-muted hover:text-ohm-text flex-1 gap-1.5 text-xs"
          >
            <Download size={14} />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-ohm-border text-ohm-muted hover:text-ohm-text flex-1 gap-1.5 text-xs"
          >
            <Upload size={14} />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelected}
            className="hidden"
            aria-label="Import board file"
          />
        </div>

        {importPending && (
          <div className="border-ohm-spark/30 bg-ohm-spark/5 mt-3 rounded-md border p-3">
            <p className="font-body text-ohm-text mb-2 text-xs">
              Import {importPending.cards.length} card
              {importPending.cards.length !== 1 ? 's' : ''}.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleImportMerge}
                className="bg-ohm-spark/20 text-ohm-spark hover:bg-ohm-spark/30 flex-1 text-xs"
              >
                Merge
              </Button>
              <Button
                variant="outline"
                onClick={handleImportReplace}
                className="border-ohm-border text-ohm-muted hover:text-ohm-live flex-1 text-xs"
              >
                Overwrite
              </Button>
              <Button
                variant="outline"
                onClick={() => setImportPending(null)}
                className="border-ohm-border text-ohm-muted hover:text-ohm-text px-2 text-xs"
                aria-label="Cancel import"
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Storage level */}
      <section>
        <StorageLevelIndicator driveConnected={!!driveConnected} storageAdapter={storageAdapter} />
      </section>

      {/* Restore points */}
      <section>
        <div className="mb-1 flex items-center gap-2">
          <RotateCcw size={14} className="text-ohm-muted" />
          <span className="font-display text-ohm-muted text-xs tracking-widest uppercase">
            Restore Points
          </span>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-body text-ohm-muted/80 text-xs">Save and restore board snapshots.</p>
          <Button
            variant="outline"
            onClick={handleCreateRestorePoint}
            className="border-ohm-border text-ohm-muted hover:text-ohm-text h-6 gap-1 px-2 text-xs"
          >
            <Save size={10} />
            Save
          </Button>
        </div>
        {restorePoints.length === 0 ? (
          <p className="font-body text-ohm-muted/80 text-xs">No restore points yet.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {[...restorePoints].reverse().map((rp) => (
              <div
                key={rp.id}
                className="border-ohm-border bg-ohm-bg flex items-center justify-between rounded-md border px-2 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-body text-ohm-text block truncate text-xs">{rp.label}</span>
                  <span className="font-body text-ohm-muted/60 text-xs">
                    {formatDate(rp.createdAt)} — {rp.board.cards.length} card
                    {rp.board.cards.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="ml-2 flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => handleRestore(rp)}
                    className={`text-ohm-muted rounded-sm p-1 transition-colors ${
                      confirmRestoreId === rp.id
                        ? 'bg-ohm-spark/20 text-ohm-spark'
                        : 'hover:text-ohm-text'
                    }`}
                    aria-label={
                      confirmRestoreId === rp.id ? 'Confirm restore' : `Restore to ${rp.label}`
                    }
                    title={confirmRestoreId === rp.id ? 'Click again to confirm' : 'Restore'}
                  >
                    <RotateCcw size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRestorePoint(rp.id)}
                    className="text-ohm-muted hover:text-ohm-live rounded-sm p-1 transition-colors"
                    aria-label={`Delete restore point ${rp.label}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
