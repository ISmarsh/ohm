import { useState } from 'react';
import type { OhmCard, ColumnStatus, EnergyTag } from '../types/board';
import { COLUMNS, ENERGY_CONFIG } from '../types/board';

interface CardDetailProps {
  card: OhmCard;
  categories: string[];
  onUpdate: (card: OhmCard) => void;
  onDelete: (cardId: string) => void;
  onClose: () => void;
}

export function CardDetail({ card, categories, onUpdate, onDelete, onClose }: CardDetailProps) {
  const [editing, setEditing] = useState(card);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    onUpdate({ ...editing, updatedAt: new Date().toISOString() });
    onClose();
  };

  const handleStatusChange = (newStatus: ColumnStatus) => {
    setEditing((prev) => ({ ...prev, status: newStatus }));
  };

  const currentColumn = COLUMNS.find((c) => c.status === editing.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Detail panel */}
      <div className="animate-slide-up relative mx-0 max-h-[90vh] w-full overflow-y-auto sm:mx-4 sm:max-w-lg">
        <div className="rounded-t-xl border border-ohm-border bg-ohm-surface p-5 shadow-2xl sm:rounded-xl">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: `var(--color-${currentColumn?.color ?? 'ohm-muted'})`,
                }}
              />
              <span className="font-display text-[10px] uppercase tracking-widest text-ohm-muted">
                {currentColumn?.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-lg leading-none text-ohm-muted transition-colors hover:text-ohm-text"
            >
              ×
            </button>
          </div>

          {/* Title */}
          <input
            value={editing.title}
            onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
            className="mb-4 w-full border-b border-transparent bg-transparent pb-1 font-body text-base font-medium text-ohm-text transition-colors focus:border-ohm-border focus:outline-none"
          />

          {/* Next Step */}
          <label className="mb-3 block">
            <span className="mb-1 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
              → Next Step
            </span>
            <input
              value={editing.nextStep}
              onChange={(e) => setEditing((prev) => ({ ...prev, nextStep: e.target.value }))}
              placeholder="What's the one concrete action?"
              className="w-full rounded-lg border border-ohm-border bg-ohm-bg px-3 py-2 font-body text-sm text-ohm-text transition-colors placeholder:text-ohm-muted/40 focus:border-ohm-spark/30 focus:outline-none"
            />
          </label>

          {/* Where I Left Off (visible for grounded or when editing) */}
          <label className="mb-3 block">
            <span className="mb-1 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
              📍 Where I Left Off
            </span>
            <textarea
              value={editing.whereILeftOff}
              onChange={(e) => setEditing((prev) => ({ ...prev, whereILeftOff: e.target.value }))}
              placeholder="Context for future you..."
              rows={2}
              className="w-full resize-none rounded-lg border border-ohm-border bg-ohm-bg px-3 py-2 font-body text-sm text-ohm-text transition-colors placeholder:text-ohm-muted/40 focus:border-ohm-grounded/30 focus:outline-none"
            />
          </label>

          {/* Energy tag */}
          <div className="mb-3">
            <span className="mb-2 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
              Energy Level
            </span>
            <div className="flex gap-2">
              {(
                Object.entries(ENERGY_CONFIG) as [EnergyTag, { label: string; icon: string }][]
              ).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setEditing((prev) => ({ ...prev, energy: key }))}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-body text-xs transition-colors ${
                    editing.energy === key
                      ? 'border-ohm-spark/50 bg-ohm-spark/10 text-ohm-text'
                      : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                  } `}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <span className="mb-2 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
              Category
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditing((prev) => ({ ...prev, category: '' }))}
                className={`rounded-lg border px-2.5 py-1 font-body text-xs transition-colors ${
                  !editing.category
                    ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                    : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                } `}
              >
                None
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEditing((prev) => ({ ...prev, category: cat }))}
                  className={`rounded-lg border px-2.5 py-1 font-body text-xs transition-colors ${
                    editing.category === cat
                      ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                      : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                  } `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Status (move between columns) */}
          <div className="mb-5">
            <span className="mb-2 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
              Status
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {COLUMNS.map((col) => (
                <button
                  key={col.status}
                  onClick={() => handleStatusChange(col.status)}
                  className={`whitespace-nowrap rounded-lg border px-2.5 py-1.5 font-display text-[11px] uppercase tracking-wider transition-colors ${
                    editing.status === col.status
                      ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                      : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                  } `}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-ohm-border pt-3">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-ohm-live">Delete this card?</span>
                <button
                  onClick={() => {
                    onDelete(card.id);
                    onClose();
                  }}
                  className="font-display text-xs uppercase tracking-wider text-ohm-live transition-colors hover:text-red-400"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="font-display text-xs uppercase tracking-wider text-ohm-muted transition-colors hover:text-ohm-text"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="font-display text-xs uppercase tracking-wider text-ohm-muted transition-colors hover:text-ohm-live"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              className="rounded-lg bg-ohm-powered/20 px-5 py-2 font-display text-xs uppercase tracking-wider text-ohm-powered transition-colors hover:bg-ohm-powered/30 active:bg-ohm-powered/40"
            >
              Save
            </button>
          </div>

          {/* Timestamps */}
          <div className="mt-3 font-body text-[9px] text-ohm-muted/40">
            Created {new Date(card.createdAt).toLocaleDateString()} · Updated{' '}
            {new Date(card.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
