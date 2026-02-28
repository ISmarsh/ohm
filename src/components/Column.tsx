import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { OhmCard, OhmColumn as OhmColumnType } from '../types/board';
import { Card } from './Card';

interface ColumnProps {
  column: OhmColumnType;
  cards: OhmCard[];
  onCardTap: (card: OhmCard) => void;
  wipWarning?: boolean;
  defaultExpanded?: boolean;
}

export function Column({
  column,
  cards,
  onCardTap,
  wipWarning,
  defaultExpanded = false,
}: ColumnProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-full min-w-0 flex-col rounded-xl transition-colors duration-200 md:w-auto md:flex-1 ${isOver ? 'bg-ohm-border/30' : ''}`}
    >
      {/* Column header — tappable on mobile to toggle */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls={`column-cards-${column.status}`}
        className="sticky top-0 z-10 flex w-full items-center gap-2 bg-ohm-bg/80 px-3 py-2 backdrop-blur-sm md:pointer-events-none"
      >
        <span className="text-ohm-muted md:hidden">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <div
          className={`h-2 w-2 rounded-full`}
          style={{ backgroundColor: `var(--color-${column.color}, currentColor)` }}
        />
        <h2 className="font-display text-xs font-bold uppercase tracking-widest text-ohm-text">
          {column.label}
        </h2>
        <span className="ml-1 font-body text-[10px] text-ohm-muted">{cards.length}</span>
        {wipWarning && (
          <span className="ml-auto animate-pulse font-display text-[10px] font-bold text-ohm-live">
            WIP LIMIT
          </span>
        )}
      </button>

      {/* Cards — hidden on mobile when collapsed, always visible on md+ */}
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div
          id={`column-cards-${column.status}`}
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
