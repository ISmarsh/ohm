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

export function CardDetail({
  card,
  categories,
  onUpdate,
  onDelete,
  onClose,
}: CardDetailProps) {
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Detail panel */}
      <div className="relative w-full sm:max-w-lg mx-0 sm:mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="bg-ohm-surface border border-ohm-border rounded-t-xl sm:rounded-xl p-5 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
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
              className="text-ohm-muted hover:text-ohm-text text-lg leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {/* Title */}
          <input
            value={editing.title}
            onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
            className="
              w-full bg-transparent text-ohm-text font-body text-base font-medium
              border-b border-transparent focus:border-ohm-border
              focus:outline-none pb-1 mb-4 transition-colors
            "
          />

          {/* Next Step */}
          <label className="block mb-3">
            <span className="font-display text-[10px] uppercase tracking-widest text-ohm-muted mb-1 block">
              → Next Step
            </span>
            <input
              value={editing.nextStep}
              onChange={(e) =>
                setEditing((prev) => ({ ...prev, nextStep: e.target.value }))
              }
              placeholder="What's the one concrete action?"
              className="
                w-full bg-ohm-bg border border-ohm-border rounded-lg
                px-3 py-2 text-sm text-ohm-text font-body
                placeholder:text-ohm-muted/40
                focus:outline-none focus:border-ohm-spark/30
                transition-colors
              "
            />
          </label>

          {/* Where I Left Off (visible for grounded or when editing) */}
          <label className="block mb-3">
            <span className="font-display text-[10px] uppercase tracking-widest text-ohm-muted mb-1 block">
              📍 Where I Left Off
            </span>
            <textarea
              value={editing.whereILeftOff}
              onChange={(e) =>
                setEditing((prev) => ({ ...prev, whereILeftOff: e.target.value }))
              }
              placeholder="Context for future you..."
              rows={2}
              className="
                w-full bg-ohm-bg border border-ohm-border rounded-lg
                px-3 py-2 text-sm text-ohm-text font-body resize-none
                placeholder:text-ohm-muted/40
                focus:outline-none focus:border-ohm-grounded/30
                transition-colors
              "
            />
          </label>

          {/* Energy tag */}
          <div className="mb-3">
            <span className="font-display text-[10px] uppercase tracking-widest text-ohm-muted mb-2 block">
              Energy Level
            </span>
            <div className="flex gap-2">
              {(Object.entries(ENERGY_CONFIG) as [EnergyTag, { label: string; icon: string }][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setEditing((prev) => ({ ...prev, energy: key }))}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body
                      border transition-colors
                      ${
                        editing.energy === key
                          ? 'border-ohm-spark/50 bg-ohm-spark/10 text-ohm-text'
                          : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                      }
                    `}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <span className="font-display text-[10px] uppercase tracking-widest text-ohm-muted mb-2 block">
              Category
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditing((prev) => ({ ...prev, category: '' }))}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-body border transition-colors
                  ${
                    !editing.category
                      ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                      : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                  }
                `}
              >
                None
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEditing((prev) => ({ ...prev, category: cat }))}
                  className={`
                    px-2.5 py-1 rounded-lg text-xs font-body border transition-colors
                    ${
                      editing.category === cat
                        ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                        : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Status (move between columns) */}
          <div className="mb-5">
            <span className="font-display text-[10px] uppercase tracking-widest text-ohm-muted mb-2 block">
              Status
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {COLUMNS.map((col) => (
                <button
                  key={col.status}
                  onClick={() => handleStatusChange(col.status)}
                  className={`
                    px-2.5 py-1.5 rounded-lg text-[11px] font-display uppercase tracking-wider
                    border whitespace-nowrap transition-colors
                    ${
                      editing.status === col.status
                        ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                        : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                    }
                  `}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-ohm-border">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-ohm-live font-body">Delete this card?</span>
                <button
                  onClick={() => {
                    onDelete(card.id);
                    onClose();
                  }}
                  className="text-xs font-display uppercase tracking-wider text-ohm-live hover:text-red-400 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs font-display uppercase tracking-wider text-ohm-muted hover:text-ohm-text transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-display uppercase tracking-wider text-ohm-muted hover:text-ohm-live transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              className="
                font-display text-xs uppercase tracking-wider
                px-5 py-2 rounded-lg
                bg-ohm-powered/20 text-ohm-powered
                hover:bg-ohm-powered/30 active:bg-ohm-powered/40
                transition-colors
              "
            >
              Save
            </button>
          </div>

          {/* Timestamps */}
          <div className="mt-3 text-[9px] text-ohm-muted/40 font-body">
            Created {new Date(card.createdAt).toLocaleDateString()} · Updated{' '}
            {new Date(card.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
