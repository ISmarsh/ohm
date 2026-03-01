import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { OhmCard, OhmColumn as OhmColumnType } from '../types/board';
import { Card } from './Card';

interface ColumnProps {
  column: OhmColumnType;
  cards: OhmCard[];
  onCardTap: (card: OhmCard) => void;
  capacity?: { used: number; total: number };
  defaultExpanded?: boolean;
  flash?: boolean;
}

/** Interpolate hue from green (120) through yellow (60) to red (0) */
function capacityColor(used: number, total: number): string {
  const ratio = Math.min(used / total, 1);
  const hue = 120 * (1 - ratio);
  return `hsl(${hue}, 80%, 50%)`;
}

export function Column({
  column,
  cards,
  onCardTap,
  capacity,
  defaultExpanded = false,
  flash,
}: ColumnProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="flex w-full min-w-0 flex-col rounded-xl md:w-auto md:flex-1">
      {/* Column header — mobile: button toggle, desktop: static */}
      <div
        className={`sticky top-0 z-10 mb-1 flex w-full items-center rounded-lg bg-ohm-bg/80 px-3 py-2 backdrop-blur-sm ${flash ? 'animate-completion-flash' : ''}`}
      >
        {/* Mobile toggle button — full width for easy tapping */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={`column-cards-${column.label}`}
          className="flex w-full items-center gap-2 md:hidden"
        >
          <span className="text-ohm-muted">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <div className={`h-2 w-2 rounded-full bg-${column.color}`} />
          <span className="font-display text-xs font-bold uppercase tracking-widest text-ohm-text">
            {column.label}
          </span>
          <span className="ml-1 font-body text-[10px] text-ohm-muted">{cards.length}</span>
          {capacity && (
            <span
              className={`ml-auto shrink-0 font-display text-[10px] font-bold ${capacity.used > capacity.total ? 'animate-pulse' : ''}`}
              style={{ color: capacityColor(capacity.used, capacity.total) }}
            >
              {capacity.used}/{capacity.total}
            </span>
          )}
        </button>
        {/* Desktop static header */}
        <div className="hidden items-center gap-2 md:flex md:w-full">
          <div className={`h-2 w-2 rounded-full bg-${column.color}`} />
          <span className="font-display text-xs font-bold uppercase tracking-widest text-ohm-text">
            {column.label}
          </span>
          <span className="ml-1 font-body text-[10px] text-ohm-muted">{cards.length}</span>
          {capacity && (
            <span
              className={`ml-auto shrink-0 font-display text-[10px] font-bold ${capacity.used > capacity.total ? 'animate-pulse' : ''}`}
              style={{ color: capacityColor(capacity.used, capacity.total) }}
            >
              {capacity.used}/{capacity.total}
            </span>
          )}
        </div>
      </div>

      {/* Cards — hidden on mobile when collapsed, always visible on md+ */}
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div
          id={`column-cards-${column.label}`}
          className={`flex-col gap-2 px-2 pb-4 ${expanded ? 'flex min-h-[60px]' : 'hidden'} md:flex md:min-h-[100px]`}
        >
          {cards.map((card) => (
            <Card key={card.id} card={card} onTap={onCardTap} />
          ))}
          {cards.length === 0 && (
            <div className="py-8 text-center font-body text-xs italic text-ohm-muted/40">
              {column.description}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
