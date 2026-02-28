import { useState, useEffect } from 'react';
import { Zap, Settings, Plus } from 'lucide-react';
import type { OhmCard } from '../types/board';
import { COLUMNS } from '../types/board';
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

  const { driveAvailable, driveConnected, syncStatus, connect, disconnect, manualSync, queueSync } =
    useDriveSync(board, replaceBoard);

  // Queue Drive sync whenever board changes
  useEffect(() => {
    queueSync(board);
  }, [board, queueSync]);

  const [captureOpen, setCaptureOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<OhmCard | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const wipWarning = isOverWipLimit(board);

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

      {/* Board */}
      <main className="flex-1 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden">
        <div className="flex flex-col gap-3 p-4 md:min-h-[calc(100vh-56px)] md:flex-row md:gap-4">
          {COLUMNS.map((col) => (
            <Column
              key={col.status}
              column={col}
              cards={getColumnCards(board, col.status)}
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
        onAdd={(title) => quickAdd(title)}
        onClose={() => setCaptureOpen(false)}
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
