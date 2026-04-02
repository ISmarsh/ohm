import { Minus, Plus, Trash2, Zap, Tag, Gauge } from 'lucide-react';
import {
  ENERGY_MIN,
  ENERGY_MAX_DEFAULT,
  DAILY_LIMIT_MIN,
  DAILY_LIMIT_MAX,
} from '../../types/board';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface BoardTabProps {
  categories: string[];
  onRemoveCategory: (c: string) => void;
  onRenameCategory: (old: string, next: string) => void;
  newCategoryName: string;
  setNewCategoryName: (v: string) => void;
  handleAddCategory: () => void;
  energyMax?: number;
  onSetEnergyMax?: (v: number) => void;
  dailyLimit: number;
  onSetDailyLimit: (v: number) => void;
}

export function BoardTab({
  categories,
  onRemoveCategory,
  onRenameCategory,
  newCategoryName,
  setNewCategoryName,
  handleAddCategory,
  energyMax,
  onSetEnergyMax,
  dailyLimit,
  onSetDailyLimit,
}: BoardTabProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Energy Scale */}
      {onSetEnergyMax && (
        <section>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-ohm-muted" />
            <span className="font-display text-ohm-muted text-xs tracking-widest uppercase">
              Energy Scale
            </span>
          </div>
          <p className="font-body text-ohm-muted/80 mt-1.5 text-xs">
            Maximum energy per task. Cards above this will be clamped.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-display text-ohm-muted w-20 text-xs tracking-widest uppercase">
              Max
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                onSetEnergyMax(Math.max(ENERGY_MIN + 1, (energyMax ?? ENERGY_MAX_DEFAULT) - 1))
              }
              disabled={(energyMax ?? ENERGY_MAX_DEFAULT) <= ENERGY_MIN + 1}
              className="border-ohm-border text-ohm-muted hover:text-ohm-text h-8 w-8"
              aria-label="Decrease energy max"
            >
              <Minus size={14} />
            </Button>
            <span className="font-display text-ohm-text min-w-[2ch] text-center text-lg font-bold">
              {energyMax ?? ENERGY_MAX_DEFAULT}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSetEnergyMax((energyMax ?? ENERGY_MAX_DEFAULT) + 1)}
              disabled={(energyMax ?? ENERGY_MAX_DEFAULT) >= 20}
              className="border-ohm-border text-ohm-muted hover:text-ohm-text h-8 w-8"
              aria-label="Increase energy max"
            >
              <Plus size={14} />
            </Button>
          </div>
        </section>
      )}

      {/* Daily Limit */}
      <section>
        <div className="flex items-center gap-2">
          <Gauge size={14} className="text-ohm-muted" />
          <span className="font-display text-ohm-muted text-xs tracking-widest uppercase">
            Daily Limit
          </span>
        </div>
        <p className="font-body text-ohm-muted/80 mt-1.5 text-xs">
          Maximum cards in your active focus. Shown in the budget bar and day view.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="font-display text-ohm-muted w-20 text-xs tracking-widest uppercase">
            Max
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSetDailyLimit(Math.max(DAILY_LIMIT_MIN, dailyLimit - 1))}
            disabled={dailyLimit <= DAILY_LIMIT_MIN}
            className="border-ohm-border text-ohm-muted hover:text-ohm-text h-8 w-8"
            aria-label="Decrease daily limit"
          >
            <Minus size={14} />
          </Button>
          <span className="font-display text-ohm-text min-w-[2ch] text-center text-lg font-bold">
            {dailyLimit}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSetDailyLimit(Math.min(DAILY_LIMIT_MAX, dailyLimit + 1))}
            disabled={dailyLimit >= DAILY_LIMIT_MAX}
            className="border-ohm-border text-ohm-muted hover:text-ohm-text h-8 w-8"
            aria-label="Increase daily limit"
          >
            <Plus size={14} />
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-ohm-muted" />
          <span className="font-display text-ohm-muted text-xs tracking-widest uppercase">
            Categories
          </span>
        </div>
        <p className="font-body text-ohm-muted/80 mt-1.5 mb-3 text-xs">
          Organize cards by category for filtering.
        </p>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <Input
                defaultValue={cat}
                onBlur={(e) => {
                  const trimmed = e.target.value.trim();
                  if (trimmed && trimmed !== cat) {
                    onRenameCategory(cat, trimmed);
                  } else {
                    e.target.value = cat;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') {
                    (e.target as HTMLInputElement).value = cat;
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                aria-label={`Rename category ${cat}`}
                className="border-ohm-border bg-ohm-bg font-body text-ohm-text focus-visible:ring-ohm-spark/20 flex-1 px-3 py-1.5 text-sm focus-visible:ring-offset-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveCategory(cat)}
                className="text-ohm-live/60 hover:text-ohm-live h-9 w-9 shrink-0 hover:bg-transparent"
                aria-label={`Remove ${cat} category`}
              >
                <Trash2 size={14} />
              </Button>
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
            className="border-ohm-border bg-ohm-bg font-body text-ohm-text placeholder:text-ohm-muted/40 focus-visible:ring-ohm-spark/20 flex-1 px-3 py-1.5 text-sm focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            disabled={!newCategoryName.trim()}
            className="bg-ohm-spark/20 font-display text-ohm-spark hover:bg-ohm-spark/30 active:bg-ohm-spark/40 text-xs tracking-wider uppercase"
          >
            Add
          </Button>
        </form>
      </section>
    </div>
  );
}
