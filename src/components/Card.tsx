import { useState, useEffect } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { OhmCard } from '../types/board';
import { STATUS, ENERGY_CONFIG, ENERGY_CLASSES } from '../types/board';
import { Card as CardContainer } from './ui/card';
import { Badge } from './ui/badge';

interface CardProps {
  card: OhmCard;
  onTap: (card: OhmCard) => void;
}

const STALE_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function Card({ card, onTap }: CardProps) {
  const energyInfo = ENERGY_CONFIG[card.energy]!;
  const EnergyIcon = energyInfo.icon;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isStale, setIsStale] = useState(false);
  useEffect(() => {
    const stale =
      (card.status === STATUS.CHARGING || card.status === STATUS.GROUNDED) &&
      Date.now() - new Date(card.updatedAt).getTime() > STALE_THRESHOLD_MS;
    const id = setTimeout(() => setIsStale(stale), 0);
    return () => clearTimeout(id);
  }, [card.status, card.updatedAt]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      className="outline-none"
      onClick={() => onTap(card)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onTap(card);
      }}
    >
      <CardContainer
        className={`border-ohm-border bg-ohm-surface p-3 shadow-none transition-all duration-150 active:scale-[0.98] ${isDragging ? 'z-50 opacity-40' : isStale ? 'opacity-50' : ''}`}
      >
        {/* Title */}
        <p className="pr-6 font-body text-sm font-medium leading-snug text-ohm-text">
          {card.title}
        </p>

        {/* Meta row */}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`flex items-center gap-1 ${ENERGY_CLASSES[card.energy]!.text}`}
            title={energyInfo.label}
          >
            <EnergyIcon size={10} />
            <span className="font-body text-[10px] uppercase tracking-wider">
              {energyInfo.label}
            </span>
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
        </div>

        {/* Next step for active cards (not powered) */}
        {card.status !== STATUS.POWERED && card.nextStep && (
          <div className="mt-2 flex items-start gap-1 border-t border-ohm-border pt-1.5 text-xs text-ohm-muted">
            <ArrowRight size={12} className="mt-0.5 shrink-0" />
            <span>
              {card.nextStep.length > 60 ? card.nextStep.slice(0, 60) + '...' : card.nextStep}
            </span>
          </div>
        )}

        {/* Where I left off indicator for grounded cards */}
        {card.status === STATUS.GROUNDED && card.whereILeftOff && (
          <div className="mt-2 flex items-start gap-1 border-t border-ohm-border pt-1.5 text-xs italic text-ohm-grounded/70">
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span>
              {card.whereILeftOff.length > 60
                ? card.whereILeftOff.slice(0, 60) + '...'
                : card.whereILeftOff}
            </span>
          </div>
        )}
      </CardContainer>
    </div>
  );
}
