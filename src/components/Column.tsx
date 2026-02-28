import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { OhmCard, OhmColumn as OhmColumnType } from '../types/board';
import { Card } from './Card';

interface ColumnProps {
  column: OhmColumnType;
  cards: OhmCard[];
  onCardTap: (card: OhmCard) => void;
  wipWarning?: boolean;
}

export function Column({ column, cards, onCardTap, wipWarning }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[280px] min-w-[280px] shrink-0 flex-col rounded-xl transition-colors duration-200 md:w-auto md:min-w-0 md:flex-1 ${isOver ? 'bg-ohm-border/30' : ''} `}
    >
      {/* Column header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-ohm-bg/80 px-3 py-2 backdrop-blur-sm">
        <div
          className={`h-2 w-2 rounded-full bg-${column.color}`}
          style={{
            // Fallback for dynamic Tailwind classes
            backgroundColor: `var(--color-${column.color}, currentColor)`,
          }}
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
      </div>

      {/* Cards */}
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[100px] flex-col gap-2 px-2 pb-4">
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
