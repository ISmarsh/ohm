import { MapPin } from 'lucide-react';
import type { OhmCard } from '../types/board';
import { ENERGY_CONFIG } from '../types/board';
import { Card as CardContainer } from './ui/card';
import { Badge } from './ui/badge';

interface CardProps {
  card: OhmCard;
  onTap: (card: OhmCard) => void;
}

export function Card({ card, onTap }: CardProps) {
  const energyInfo = ENERGY_CONFIG[card.energy];
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
        {/* Energy tag */}
        <span className="opacity-70" title={energyInfo.label}>
          <EnergyIcon size={12} />
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

      {/* Where I left off indicator for grounded cards */}
      {card.status === 'grounded' && card.whereILeftOff && (
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
