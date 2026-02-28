import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { OhmCard } from '../types/board';
import { ENERGY_CONFIG } from '../types/board';
import { Card as CardContainer } from './ui/card';
import { Badge } from './ui/badge';

interface CardProps {
  card: OhmCard;
  onTap: (card: OhmCard) => void;
}

export function Card({ card, onTap }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const energyInfo = ENERGY_CONFIG[card.energy];

  return (
    <CardContainer
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => onTap(card)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onTap(card);
      }}
      className={`border-ohm-border bg-ohm-surface p-3 shadow-none transition-all duration-150 active:scale-[0.98] ${isDragging ? 'z-50 scale-105 opacity-50 shadow-xl' : 'opacity-100'} cursor-grab touch-manipulation active:cursor-grabbing`}
    >
      {/* Title */}
      <p className="pr-6 font-body text-sm font-medium leading-snug text-ohm-text">{card.title}</p>

      {/* Meta row */}
      <div className="mt-2 flex items-center gap-2">
        {/* Energy tag */}
        <span className="text-xs opacity-70" title={energyInfo.label}>
          {energyInfo.icon}
        </span>

        {/* Category pill */}
        {card.category && (
          <Badge
            variant="secondary"
            className="rounded bg-ohm-bg px-1.5 py-0.5 font-body text-[10px] font-medium uppercase tracking-wider text-ohm-muted"
          >
            {card.category}
          </Badge>
        )}

        {/* Next step indicator */}
        {card.nextStep && (
          <span className="ml-auto text-[10px] text-ohm-muted" title={card.nextStep}>
            → next
          </span>
        )}
      </div>

      {/* Where I left off indicator for grounded cards */}
      {card.status === 'grounded' && card.whereILeftOff && (
        <div className="mt-2 border-t border-ohm-border pt-1.5 text-xs italic text-ohm-grounded/70">
          📍{' '}
          {card.whereILeftOff.length > 60
            ? card.whereILeftOff.slice(0, 60) + '…'
            : card.whereILeftOff}
        </div>
      )}
    </CardContainer>
  );
}
