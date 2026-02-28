import { useState } from 'react';
import type { OhmCard, ColumnStatus, EnergyTag } from '../types/board';
import { COLUMNS, ENERGY_CONFIG } from '../types/board';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle as AlertTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './ui/alert-dialog';

interface CardDetailProps {
  card: OhmCard;
  categories: string[];
  onUpdate: (card: OhmCard) => void;
  onDelete: (cardId: string) => void;
  onClose: () => void;
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
}

export function CardDetail({
  card,
  categories,
  onUpdate,
  onDelete,
  onClose,
  onAddCategory,
  onRemoveCategory,
}: CardDetailProps) {
  const [editing, setEditing] = useState(card);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSave = () => {
    onUpdate({ ...editing, updatedAt: new Date().toISOString() });
    onClose();
  };

  const handleStatusChange = (newStatus: ColumnStatus) => {
    setEditing((prev) => ({ ...prev, status: newStatus }));
  };

  const currentColumn = COLUMNS.find((c) => c.status === editing.status);

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        {/* Header */}
        <DialogTitle className="sr-only">{editing.title || 'Card details'}</DialogTitle>
        <DialogDescription className="sr-only">Edit card details</DialogDescription>
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
          <DialogClose className="rounded-sm text-ohm-muted opacity-70 transition-opacity hover:opacity-100">
            <X size={16} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Title */}
        <Input
          value={editing.title}
          onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
          aria-label="Card title"
          className="mb-4 border-transparent bg-transparent pb-1 font-body text-base font-medium text-ohm-text shadow-none focus-visible:border-ohm-border focus-visible:ring-0"
        />

        {/* Next Step */}
        <div className="mb-3">
          <label
            htmlFor="card-next-step"
            className="mb-1 block font-display text-[10px] uppercase tracking-widest text-ohm-muted"
          >
            → Next Step
          </label>
          <Input
            id="card-next-step"
            value={editing.nextStep}
            onChange={(e) => setEditing((prev) => ({ ...prev, nextStep: e.target.value }))}
            placeholder="What's the one concrete action?"
            className="border-ohm-border bg-ohm-bg font-body text-sm text-ohm-text placeholder:text-ohm-muted/40 focus-visible:ring-ohm-spark/20 focus-visible:ring-offset-0"
          />
        </div>

        {/* Where I Left Off */}
        <div className="mb-3">
          <label
            htmlFor="card-where-left-off"
            className="mb-1 block font-display text-[10px] uppercase tracking-widest text-ohm-muted"
          >
            📍 Where I Left Off
          </label>
          <Textarea
            id="card-where-left-off"
            value={editing.whereILeftOff}
            onChange={(e) => setEditing((prev) => ({ ...prev, whereILeftOff: e.target.value }))}
            placeholder="Context for future you..."
            rows={2}
            className="resize-none border-ohm-border bg-ohm-bg font-body text-sm text-ohm-text placeholder:text-ohm-muted/40 focus-visible:ring-ohm-grounded/20 focus-visible:ring-offset-0"
          />
        </div>

        {/* Energy tag */}
        <div className="mb-3">
          <span className="mb-2 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
            Energy Level
          </span>
          <div className="flex gap-2">
            {(Object.entries(ENERGY_CONFIG) as [EnergyTag, { label: string; icon: string }][]).map(
              ([key, config]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing((prev) => ({ ...prev, energy: key }))}
                  className={`gap-1.5 font-body text-xs ${
                    editing.energy === key
                      ? 'border-ohm-spark/50 bg-ohm-spark/10 text-ohm-text'
                      : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                  }`}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </Button>
              ),
            )}
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <span className="mb-2 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
            Category
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing((prev) => ({ ...prev, category: '' }))}
              className={`font-body text-xs ${
                !editing.category
                  ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                  : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
              }`}
            >
              None
            </Button>
            {categories.map((cat) => (
              <div key={cat} className="group relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing((prev) => ({ ...prev, category: cat }))}
                  className={`font-body text-xs ${
                    editing.category === cat
                      ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                      : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                  }`}
                >
                  {cat}
                </Button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCategory(cat);
                    if (editing.category === cat) {
                      setEditing((prev) => ({ ...prev, category: '' }));
                    }
                  }}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-ohm-live/80 text-[8px] text-ohm-bg group-hover:flex"
                  aria-label={`Remove ${cat} category`}
                >
                  ×
                </button>
              </div>
            ))}
            {addingCategory ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = newCategoryName.trim();
                  if (trimmed && !categories.includes(trimmed)) {
                    onAddCategory(trimmed);
                    setEditing((prev) => ({ ...prev, category: trimmed }));
                  }
                  setNewCategoryName('');
                  setAddingCategory(false);
                }}
                className="flex items-center gap-1"
              >
                <Input
                  ref={(el) => el?.focus()}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Name..."
                  className="h-7 w-24 border-ohm-border bg-ohm-bg px-2 font-body text-xs text-ohm-text"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setNewCategoryName('');
                      setAddingCategory(false);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setNewCategoryName('');
                      setAddingCategory(false);
                    }, 150);
                  }}
                />
              </form>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingCategory(true)}
                className="border-dashed border-ohm-border font-body text-xs text-ohm-muted hover:text-ohm-text"
              >
                +
              </Button>
            )}
          </div>
        </div>

        {/* Status (move between columns) */}
        <div className="mb-5">
          <span className="mb-2 block font-display text-[10px] uppercase tracking-widest text-ohm-muted">
            Status
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {COLUMNS.map((col) => (
              <Button
                key={col.status}
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(col.status)}
                className={`whitespace-nowrap font-display text-[11px] uppercase tracking-wider ${
                  editing.status === col.status
                    ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                    : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                }`}
              >
                {col.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-ohm-border pt-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto p-0 font-display text-xs uppercase tracking-wider text-ohm-muted hover:bg-transparent hover:text-ohm-live"
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertTitle className="text-ohm-text">Delete this card?</AlertTitle>
                <AlertDialogDescription>
                  This will permanently remove &ldquo;{editing.title || card.title}&rdquo;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-ohm-border text-ohm-muted hover:bg-ohm-bg hover:text-ohm-text">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDelete(card.id);
                    onClose();
                  }}
                  className="bg-ohm-live/20 text-ohm-live hover:bg-ohm-live/30"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            onClick={handleSave}
            className="bg-ohm-powered/20 font-display text-xs uppercase tracking-wider text-ohm-powered hover:bg-ohm-powered/30 active:bg-ohm-powered/40"
          >
            Save
          </Button>
        </div>

        {/* Timestamps */}
        <div className="mt-3 font-body text-[9px] text-ohm-muted/40">
          Created {new Date(card.createdAt).toLocaleDateString()} · Updated{' '}
          {new Date(card.updatedAt).toLocaleDateString()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
