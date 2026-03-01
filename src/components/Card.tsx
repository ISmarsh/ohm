import { ArrowRight, MapPin } from 'lucide-react';
import type { OhmCard } from '../types/board';
import { STATUS, ENERGY_CONFIG, ENERGY_CLASSES } from '../types/board';
import { Card as CardContainer } from './ui/card';
import { Badge } from './ui/badge';

interface CardProps {
  card: OhmCard;
  onTap: (card: OhmCard) => void;
}

export function Card({ card, onTap }: CardProps) {
  const energyInfo = ENERGY_CONFIG[card.energy]!;
  const EnergyIcon = energyInfo.icon;

  return (
    <CardContainer
      role="button"
      tabIndex={0}
      onClick={() => onTap(card)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onTap(card);
      }}
      className="border-ohm-border bg-ohm-surface p-3 shadow-none transition-all duration-150 active:scale-[0.98]"
    >
      {/* Title */}
      <p className="pr-6 font-body text-sm font-medium leading-snug text-ohm-text">{card.title}</p>

      {/* Meta row */}
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`flex items-center gap-1 ${ENERGY_CLASSES[card.energy]!.text}`}
          title={energyInfo.label}
        >
          <EnergyIcon size={10} />
          <span className="font-body text-[10px] uppercase tracking-wider">{energyInfo.label}</span>
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
  );
}
