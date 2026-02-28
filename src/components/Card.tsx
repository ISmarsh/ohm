import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { OhmCard } from '../types/board';
import { ENERGY_CONFIG } from '../types/board';

interface CardProps {
  card: OhmCard;
  onTap: (card: OhmCard) => void;
}

export function Card({ card, onTap }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const energyInfo = ENERGY_CONFIG[card.energy];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onTap(card)}
      className={`
        relative rounded-lg border border-ohm-border bg-ohm-surface p-3
        active:scale-[0.98] transition-all duration-150
        ${isDragging ? 'opacity-50 shadow-xl scale-105 z-50' : 'opacity-100'}
        touch-manipulation cursor-grab active:cursor-grabbing
      `}
    >
      {/* Title */}
      <p className="font-body text-sm font-medium text-ohm-text leading-snug pr-6">
        {card.title}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-2 mt-2">
        {/* Energy tag */}
        <span className="text-xs opacity-70" title={energyInfo.label}>
          {energyInfo.icon}
        </span>

        {/* Category pill */}
        {card.category && (
          <span className="text-[10px] font-body font-medium uppercase tracking-wider text-ohm-muted bg-ohm-bg px-1.5 py-0.5 rounded">
            {card.category}
          </span>
        )}

        {/* Next step indicator */}
        {card.nextStep && (
          <span className="text-[10px] text-ohm-muted ml-auto" title={card.nextStep}>
            → next
          </span>
        )}
      </div>

      {/* Where I left off indicator for grounded cards */}
      {card.status === 'grounded' && card.whereILeftOff && (
        <div className="mt-2 text-xs text-ohm-grounded/70 italic border-t border-ohm-border pt-1.5">
          📍 {card.whereILeftOff.length > 60
            ? card.whereILeftOff.slice(0, 60) + '…'
            : card.whereILeftOff}
        </div>
      )}
    </div>
  );
}
