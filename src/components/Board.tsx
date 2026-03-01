import { useState, useEffect, useRef } from 'react';
import { Zap, Settings, Plus, CloudOff, SlidersHorizontal, Search, X, Tag } from 'lucide-react';
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

function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string | null;
  onChange: (cat: string | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const matches = query
    ? categories.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : categories;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (value) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-ohm-text/10 px-2 py-0.5 font-body text-[11px] text-ohm-text">
        <Tag size={10} />
        {value}
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-0.5 text-ohm-muted hover:text-ohm-text"
        >
          <X size={10} />
        </button>
      </span>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative flex items-center">
        <Tag size={10} className="absolute left-2 text-ohm-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Category..."
          className="w-28 rounded-full border border-ohm-border bg-transparent py-1 pl-6 pr-2 font-body text-[11px] text-ohm-text placeholder:text-ohm-muted/40 focus:outline-none focus:ring-1 focus:ring-ohm-text/10"
        />
      </div>
      {open && matches.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-40 w-36 overflow-y-auto rounded-lg border border-ohm-border bg-ohm-surface shadow-lg">
          {matches.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onChange(cat);
                setQuery('');
                setOpen(false);
              }}
              className="block w-full px-3 py-1.5 text-left font-body text-[11px] text-ohm-muted transition-colors hover:bg-ohm-text/5 hover:text-ohm-text"
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [searchFilter, setSearchFilter] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const wipWarning = isOverWipLimit(board);

  const filteredCards = (status: ColumnStatus) => {
    let cards = getColumnCards(board, status);
    if (energyFilter) cards = cards.filter((c) => c.energy === energyFilter);
    if (categoryFilter) cards = cards.filter((c) => c.category === categoryFilter);
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      cards = cards.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
      );
    }
    return cards;
  };

  const hasActiveFilter = energyFilter !== null || categoryFilter !== null || searchFilter !== '';
  const hasAdvancedFilter = categoryFilter !== null || searchFilter !== '';
  const activeFilterCount =
    (energyFilter ? 1 : 0) + (categoryFilter ? 1 : 0) + (searchFilter ? 1 : 0);

  const resetFilters = () => {
    setEnergyFilter(null);
    setCategoryFilter(null);
    setSearchFilter('');
  };

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
      <div className="border-b border-ohm-border px-4 py-2">
        {/* Row 1: Energy chips (always visible) + expand toggle (mobile) */}
        <div className="flex items-center gap-2">
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

          {/* Desktop: inline category + search (hidden on mobile) */}
          <div className="mx-1 hidden h-3 w-px shrink-0 bg-ohm-border md:block" />
          <div className="hidden items-center gap-2 md:flex">
            <CategoryFilter
              categories={board.categories}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            <div className="mx-1 h-3 w-px shrink-0 bg-ohm-border" />
            <div className="relative flex items-center">
              <Search size={12} className="absolute left-2 text-ohm-muted" />
              <input
                ref={searchRef}
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search..."
                className="w-32 rounded-full border border-ohm-border bg-transparent py-1 pl-7 pr-2 font-body text-[11px] text-ohm-text placeholder:text-ohm-muted/40 focus:outline-none focus:ring-1 focus:ring-ohm-text/10"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-1.5 text-ohm-muted hover:text-ohm-text"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Mobile: active advanced filter indicator (when collapsed) */}
          {!filtersExpanded && hasAdvancedFilter && (
            <span className="flex items-center gap-1 rounded-full bg-ohm-text/10 px-2 py-0.5 font-body text-[10px] text-ohm-text md:hidden">
              +{activeFilterCount - (energyFilter ? 1 : 0)} filter
              {activeFilterCount - (energyFilter ? 1 : 0) > 1 ? 's' : ''}
            </span>
          )}

          {/* Reset button */}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="shrink-0 font-display text-[10px] uppercase tracking-wider text-ohm-muted hover:text-ohm-text"
            >
              Reset
            </button>
          )}

          {/* Mobile: expand/collapse toggle */}
          <button
            type="button"
            onClick={() => setFiltersExpanded((prev) => !prev)}
            className="relative shrink-0 rounded-md p-1 text-ohm-muted transition-colors hover:text-ohm-text md:hidden"
            aria-label={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Mobile expanded: category + search rows */}
        {filtersExpanded && (
          <div className="mt-2 flex flex-col gap-2 md:hidden">
            <CategoryFilter
              categories={board.categories}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            <div className="relative flex items-center">
              <Search size={12} className="absolute left-2 text-ohm-muted" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search cards..."
                className="w-full rounded-full border border-ohm-border bg-transparent py-1.5 pl-7 pr-2 font-body text-xs text-ohm-text placeholder:text-ohm-muted/40 focus:outline-none focus:ring-1 focus:ring-ohm-text/10"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 text-ohm-muted hover:text-ohm-text"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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
