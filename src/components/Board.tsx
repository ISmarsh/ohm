import { useState, useEffect } from 'react';
import { Zap, Settings, Plus, CloudOff } from 'lucide-react';
import type { OhmCard, EnergyTag, ColumnStatus } from '../types/board';
import { COLUMNS, ENERGY_CONFIG } from '../types/board';
import { getColumnCards, isOverWipLimit } from '../utils/board-utils';
import { useBoard } from '../hooks/useBoard';
import { useDriveSync } from '../hooks/useDriveSync';
import { Button } from './ui/button';
import { Column } from './Column';
import { QuickCapture } from './QuickCapture';
import { CardDetail } from './CardDetail';
import { SettingsDialog } from './SettingsDialog';
import { SyncIndicator } from './SyncIndicator';

export function Board() {
  const {
    board,
    quickAdd,
    updateCard,
    deleteCard,
    addCategory,
    removeCategory,
    setWipLimit,
    replaceBoard,
  } = useBoard();

  const {
    driveAvailable,
    driveConnected,
    syncStatus,
    needsReconnect,
    connect,
    disconnect,
    manualSync,
    queueSync,
  } = useDriveSync(board, replaceBoard);

  // Queue Drive sync whenever board changes
  useEffect(() => {
    queueSync(board);
  }, [board, queueSync]);

  const [captureOpen, setCaptureOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<OhmCard | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [energyFilter, setEnergyFilter] = useState<EnergyTag | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const wipWarning = isOverWipLimit(board);

  const filteredCards = (status: ColumnStatus) => {
    let cards = getColumnCards(board, status);
    if (energyFilter) cards = cards.filter((c) => c.energy === energyFilter);
    if (categoryFilter) cards = cards.filter((c) => c.category === categoryFilter);
    return cards;
  };

  const hasActiveFilter = energyFilter !== null || categoryFilter !== null;

  return (
    <div className="flex min-h-screen flex-col bg-ohm-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-ohm-border bg-ohm-bg/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left — settings (desktop only) */}
          <div className="flex w-20 items-center">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="hidden rounded-md p-1.5 text-ohm-muted transition-colors hover:bg-ohm-surface hover:text-ohm-text md:block"
              aria-label="Settings"
            >
              <Settings size={16} />
            </button>
          </div>

          {/* Center — title */}
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-ohm-spark" />
            <span className="font-display text-sm font-bold uppercase tracking-widest text-ohm-text">
              Ohm
            </span>
          </div>

          {/* Right — quick spark (desktop) + sync indicator */}
          <div className="flex w-20 items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setCaptureOpen(true)}
              className="hidden rounded-md p-1.5 text-ohm-spark transition-colors hover:bg-ohm-spark/10 md:block"
              aria-label="Quick spark"
            >
              <Plus size={16} />
            </button>
            {driveAvailable && (
              <SyncIndicator connected={driveConnected} status={syncStatus} onSync={manualSync} />
            )}
          </div>
        </div>
      </header>

      {/* Reconnect banner */}
      {needsReconnect && !driveConnected && (
        <div className="flex items-center justify-center gap-3 border-b border-ohm-border bg-ohm-surface px-4 py-2">
          <CloudOff size={14} className="text-ohm-muted" />
          <span className="font-body text-xs text-ohm-muted">
            This board was previously synced with Google Drive.
          </span>
          <button
            type="button"
            onClick={connect}
            className="font-display text-xs uppercase tracking-wider text-ohm-spark transition-colors hover:text-ohm-spark/80"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Filter bar */}
      {(board.categories.length > 0 || true) && (
        <div className="flex items-center gap-2 overflow-x-auto border-b border-ohm-border px-4 py-2">
          <span className="shrink-0 font-display text-[10px] uppercase tracking-widest text-ohm-muted">
            Filter
          </span>
          {(
            Object.entries(ENERGY_CONFIG) as [EnergyTag, { label: string; icon: typeof Zap }][]
          ).map(([key, config]) => {
            const Icon = config.icon;
            const active = energyFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setEnergyFilter(active ? null : key)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-body text-[11px] transition-colors ${
                  active ? 'bg-ohm-text/10 text-ohm-text' : 'text-ohm-muted hover:text-ohm-text'
                }`}
              >
                <Icon size={12} />
                {config.label}
              </button>
            );
          })}
          {board.categories.length > 0 && <div className="mx-1 h-3 w-px shrink-0 bg-ohm-border" />}
          {board.categories.map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(active ? null : cat)}
                className={`shrink-0 rounded-full px-2.5 py-1 font-body text-[11px] transition-colors ${
                  active ? 'bg-ohm-text/10 text-ohm-text' : 'text-ohm-muted hover:text-ohm-text'
                }`}
              >
                {cat}
              </button>
            );
          })}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setEnergyFilter(null);
                setCategoryFilter(null);
              }}
              className="shrink-0 font-display text-[10px] uppercase tracking-wider text-ohm-muted hover:text-ohm-text"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Board */}
      <main className="flex-1 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden">
        <div className="flex flex-col gap-3 p-4 md:min-h-[calc(100vh-56px)] md:flex-row md:gap-4">
          {COLUMNS.map((col) => (
            <Column
              key={col.status}
              column={col}
              cards={filteredCards(col.status)}
              onCardTap={setSelectedCard}
              wipWarning={col.status === 'live' && wipWarning}
              defaultExpanded={col.status === 'live'}
            />
          ))}
        </div>
      </main>

      {/* Quick capture modal */}
      <QuickCapture
        isOpen={captureOpen}
        onAdd={(title, overrides) => quickAdd(title, overrides)}
        onClose={() => setCaptureOpen(false)}
        categories={board.categories}
      />

      {/* Card detail modal */}
      {selectedCard && (
        <CardDetail
          card={selectedCard}
          categories={board.categories}
          onUpdate={(updated) => {
            updateCard(updated);
            setSelectedCard(null);
          }}
          onDelete={(id) => {
            deleteCard(id);
            setSelectedCard(null);
          }}
          onClose={() => setSelectedCard(null)}
          onOpenSettings={() => {
            setSelectedCard(null);
            setSettingsOpen(true);
          }}
        />
      )}

      {/* Settings dialog */}
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        categories={board.categories}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
        wipLimit={board.liveWipLimit}
        onSetWipLimit={setWipLimit}
        driveAvailable={driveAvailable}
        driveConnected={driveConnected}
        onConnectDrive={connect}
        onDisconnectDrive={disconnect}
      />

      {/* Settings FAB — mobile only */}
      <Button
        size="icon"
        onClick={() => setSettingsOpen(true)}
        className="fixed bottom-6 left-6 z-40 h-14 w-14 rounded-full border border-ohm-border bg-ohm-muted/10 text-ohm-muted shadow-md transition-transform hover:text-ohm-text active:scale-95 md:hidden"
        aria-label="Settings"
      >
        <Settings size={20} />
      </Button>

      {/* Quick spark FAB — mobile only */}
      <Button
        size="icon"
        onClick={() => setCaptureOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-ohm-spark text-ohm-bg shadow-lg shadow-ohm-spark/30 transition-transform hover:bg-ohm-spark/90 active:scale-95 md:hidden"
        aria-label="Quick spark"
      >
        <Zap size={24} />
      </Button>
    </div>
  );
}
