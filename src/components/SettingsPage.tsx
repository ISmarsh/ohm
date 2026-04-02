import { useState, useEffect, useRef } from 'react';
import { Settings, CalendarDays, LayoutGrid, Database } from 'lucide-react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from './ui/responsive-dialog';
import type { OhmBoard } from '../types/board';
import {
  getRestorePoints,
  createRestorePoint,
  deleteRestorePoint,
  exportBoard,
  importBoard,
  mergeBoards,
  type RestorePoint,
} from '../utils/restore-points';
import { toastImportComplete, toastCategoryDeleted, toastActivityDeleted } from '../utils/toast';
import type { StorageAdapterType } from '../utils/storage-service';
import type { Activity } from '../types/activity';
import { BoardTab } from './settings/BoardTab';
import { ScheduleTab } from './settings/ScheduleTab';
import { DataTab } from './settings/DataTab';

type SettingsTab = 'board' | 'schedule' | 'data';

const TABS: { id: SettingsTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'board', label: 'Board', icon: LayoutGrid },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'data', label: 'Data', icon: Database },
];

export interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  energyMax?: number;
  onSetEnergyMax?: (max: number) => void;
  dailyLimit: number;
  onSetDailyLimit: (limit: number) => void;
  windowSize?: number;
  onSetWindowSize?: (size: number) => void;
  activities?: Activity[];
  onUpdateActivity?: (id: string, changes: Partial<Omit<Activity, 'id'>>) => void;
  onDeleteActivity?: (id: string) => void | Promise<void>;
  driveAvailable?: boolean;
  driveConnected?: boolean;
  onConnectDrive?: () => void;
  onDisconnectDrive?: () => void;
  board: OhmBoard;
  onReplaceBoard: (board: OhmBoard) => void;
  storageAdapter?: StorageAdapterType | null;
  initialTab?: SettingsTab;
  editActivityId?: string;
}

export function SettingsPage({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onRemoveCategory,
  onRenameCategory,
  energyMax,
  onSetEnergyMax,
  dailyLimit,
  onSetDailyLimit,
  windowSize,
  onSetWindowSize,
  activities,
  onUpdateActivity,
  onDeleteActivity,
  driveAvailable,
  driveConnected,
  onConnectDrive,
  onDisconnectDrive,
  board,
  onReplaceBoard,
  storageAdapter,
  initialTab,
  editActivityId,
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab ?? 'board');
  const [snapPoint, setSnapPoint] = useState<number | string | null>(0.95);

  /* eslint-disable react-hooks/set-state-in-effect -- intentional reset on open */
  useEffect(() => {
    if (isOpen) {
      setSnapPoint(0.95);
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  /* eslint-enable react-hooks/set-state-in-effect */
  const [newCategoryName, setNewCategoryName] = useState('');
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [pendingActivityDeletes, setPendingActivityDeletes] = useState<Set<string>>(new Set());
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [importPending, setImportPending] = useState<OhmBoard | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDeleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pendingActivityTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleRemoveCategory = (cat: string) => {
    if (pendingDeleteTimers.current.has(cat)) return;
    setPendingDeletes((prev) => new Set([...prev, cat]));
    const timer = setTimeout(() => {
      onRemoveCategory(cat);
      setPendingDeletes((prev) => {
        const next = new Set(prev);
        next.delete(cat);
        return next;
      });
      pendingDeleteTimers.current.delete(cat);
    }, 5000);
    pendingDeleteTimers.current.set(cat, timer);
    toastCategoryDeleted(cat, () => {
      clearTimeout(pendingDeleteTimers.current.get(cat));
      pendingDeleteTimers.current.delete(cat);
      setPendingDeletes((prev) => {
        const next = new Set(prev);
        next.delete(cat);
        return next;
      });
    });
  };

  const handleDeleteActivity = (id: string) => {
    if (!onDeleteActivity) return;
    if (pendingActivityTimers.current.has(id)) return;
    const activity = activities?.find((a) => a.id === id);
    if (!activity) return;
    setPendingActivityDeletes((prev) => new Set([...prev, id]));
    const timer = setTimeout(() => {
      void onDeleteActivity(id);
      setPendingActivityDeletes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      pendingActivityTimers.current.delete(id);
    }, 5000);
    pendingActivityTimers.current.set(id, timer);
    toastActivityDeleted(activity.name, () => {
      clearTimeout(pendingActivityTimers.current.get(id));
      pendingActivityTimers.current.delete(id);
      setPendingActivityDeletes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      onAddCategory(trimmed);
    }
    setNewCategoryName('');
  };

  const refreshRestorePoints = () => setRestorePoints(getRestorePoints());

  const handleExport = () => exportBoard(board);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const imported = await importBoard(file);
      setImportPending(imported);
    } catch {
      // Invalid file -- silently ignore
    }
  };

  const handleImportReplace = () => {
    if (!importPending) return;
    createRestorePoint(board, 'Before import');
    onReplaceBoard(importPending);
    toastImportComplete(importPending.cards.length);
    setImportPending(null);
    refreshRestorePoints();
  };

  const handleImportMerge = () => {
    if (!importPending) return;
    createRestorePoint(board, 'Before import');
    const merged = mergeBoards(board, importPending);
    onReplaceBoard(merged);
    toastImportComplete(merged.cards.length);
    setImportPending(null);
    refreshRestorePoints();
  };

  const handleCreateRestorePoint = () => {
    createRestorePoint(board, 'Manual');
    refreshRestorePoints();
  };

  const handleRestore = (rp: RestorePoint) => {
    if (confirmRestoreId === rp.id) {
      createRestorePoint(board, 'Before restore');
      onReplaceBoard(rp.board);
      setConfirmRestoreId(null);
      refreshRestorePoints();
    } else {
      setConfirmRestoreId(rp.id);
    }
  };

  const handleDeleteRestorePoint = (id: string) => {
    deleteRestorePoint(id);
    refreshRestorePoints();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (tab === 'data') refreshRestorePoints();
    // Ensure the newly active tab button receives focus (for keyboard nav)
    // Use setTimeout(0) to run after React's batched re-render
    setTimeout(() => document.getElementById(`tab-${tab}`)?.focus(), 0);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    let next: number | undefined;
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length;
    if (next !== undefined) {
      e.preventDefault();
      const tab = TABS[next]!;
      handleTabChange(tab.id);
      document.getElementById(`tab-${tab.id}`)?.focus();
    }
  };

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={[0.5, 0.95]}
      activeSnapPoint={snapPoint}
      onSnapPointChange={setSnapPoint}
      fadeFromIndex={1}
    >
      <ResponsiveDialogContent
        managed
        className="sm:h-[80dvh] sm:max-w-xl"
        style={{ height: 'calc(100dvh - var(--budget-bar-height, 0px))' }}
        aria-label="Settings"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document.getElementById(`tab-${activeTab}`)?.focus();
        }}
      >
        <ResponsiveDialogTitle className="sr-only">Settings</ResponsiveDialogTitle>
        <ResponsiveDialogDescription className="sr-only">
          Configure board, schedule, and data settings
        </ResponsiveDialogDescription>

        {/* Fixed header + tabs */}
        <div className="shrink-0 px-5 sm:pt-5">
          <header className="flex items-center justify-center pb-3">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-ohm-muted" aria-hidden="true" />
              <h2 className="font-display text-ohm-text text-sm font-bold tracking-widest uppercase">
                Settings
              </h2>
            </div>
          </header>
          <nav className="border-ohm-border border-b" aria-label="Settings tabs">
            <div className="flex gap-1" role="tablist">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabChange(id)}
                  onKeyDown={handleTabKeyDown}
                  className={`font-display flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs tracking-wider uppercase transition-colors ${
                    activeTab === id
                      ? 'border-ohm-spark text-ohm-spark'
                      : 'text-ohm-muted hover:text-ohm-text border-transparent'
                  }`}
                  aria-selected={activeTab === id}
                  aria-controls={`tabpanel-${id}`}
                  id={`tab-${id}`}
                  role="tab"
                  tabIndex={activeTab === id ? 0 : -1}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Scrollable tab content */}
        <div
          className="flex-1 overflow-y-auto p-5"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'board' && (
            <BoardTab
              categories={categories.filter((c) => !pendingDeletes.has(c))}
              onRemoveCategory={handleRemoveCategory}
              onRenameCategory={onRenameCategory}
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
              handleAddCategory={handleAddCategory}
              energyMax={energyMax}
              onSetEnergyMax={onSetEnergyMax}
              dailyLimit={dailyLimit}
              onSetDailyLimit={onSetDailyLimit}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTab
              windowSize={windowSize}
              onSetWindowSize={onSetWindowSize}
              activities={activities?.filter((a) => !pendingActivityDeletes.has(a.id))}
              categories={categories}
              onUpdateActivity={onUpdateActivity}
              onDeleteActivity={onDeleteActivity ? handleDeleteActivity : undefined}
              energyMax={energyMax}
              editActivityId={editActivityId}
            />
          )}

          {activeTab === 'data' && (
            <DataTab
              driveAvailable={driveAvailable}
              driveConnected={driveConnected}
              onConnectDrive={onConnectDrive}
              onDisconnectDrive={onDisconnectDrive}
              handleExport={handleExport}
              fileInputRef={fileInputRef}
              handleFileSelected={handleFileSelected}
              importPending={importPending}
              handleImportMerge={handleImportMerge}
              handleImportReplace={handleImportReplace}
              setImportPending={setImportPending}
              restorePoints={restorePoints}
              handleCreateRestorePoint={handleCreateRestorePoint}
              handleRestore={handleRestore}
              handleDeleteRestorePoint={handleDeleteRestorePoint}
              confirmRestoreId={confirmRestoreId}
              formatDate={formatDate}
              storageAdapter={storageAdapter}
            />
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
