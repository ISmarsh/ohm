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
      className={`
        flex flex-col min-w-[280px] w-[280px] shrink-0
        md:min-w-0 md:w-auto md:flex-1
        rounded-xl transition-colors duration-200
        ${isOver ? 'bg-ohm-border/30' : ''}
      `}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2 sticky top-0 z-10 bg-ohm-bg/80 backdrop-blur-sm">
        <div
          className={`w-2 h-2 rounded-full bg-${column.color}`}
          style={{
            // Fallback for dynamic Tailwind classes
            backgroundColor: `var(--color-${column.color}, currentColor)`,
          }}
        />
        <h2 className="font-display text-xs font-bold uppercase tracking-widest text-ohm-text">
          {column.label}
        </h2>
        <span className="text-[10px] text-ohm-muted font-body ml-1">
          {cards.length}
        </span>
        {wipWarning && (
          <span className="text-[10px] text-ohm-live font-display font-bold ml-auto animate-pulse">
            WIP LIMIT
          </span>
        )}
      </div>

      {/* Cards */}
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 px-2 pb-4 min-h-[100px]">
          {cards.map((card) => (
            <Card key={card.id} card={card} onTap={onCardTap} />
          ))}
          {cards.length === 0 && (
            <div className="text-center text-xs text-ohm-muted/40 py-8 font-body italic">
              {column.description}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
