import type { LucideIcon } from 'lucide-react';
import { Zap, Battery, Flame } from 'lucide-react';

/** Energy level — match tasks to your current state */
export type EnergyTag = 'quick-win' | 'medium' | 'deep-focus';

/** Column statuses map to the electrical metaphor */
export type ColumnStatus = 'charging' | 'live' | 'grounded' | 'powered';

/** A single card on the board */
export interface OhmCard {
  id: string;
  title: string;
  /** Free-form notes or context about the card */
  description: string;
  status: ColumnStatus;
  /** The single next concrete action — may be empty at capture, expected before going live */
  nextStep: string;
  /** Context note captured when moving to grounded */
  whereILeftOff: string;
  /** Energy/effort tag for filtering */
  energy: EnergyTag;
  /** Optional project/category tag */
  category: string;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp — last time the card was touched */
  updatedAt: string;
  /** Sort order within its column */
  sortOrder: number;
}

/** Column definition */
export interface OhmColumn {
  status: ColumnStatus;
  label: string;
  description: string;
  color: string;
  wipLimit?: number;
}

/** Full board state — what gets persisted to Google Drive */
export interface OhmBoard {
  version: 1;
  cards: OhmCard[];
  /** User-defined categories */
  categories: string[];
  /** WIP limit for the Live column */
  liveWipLimit: number;
  /** ISO timestamp of last save */
  lastSaved: string;
}

/** Column config — static definition */
export const COLUMNS: OhmColumn[] = [
  {
    status: 'charging',
    label: 'Charging',
    description: 'Captured ideas — shape with a clear next step',
    color: 'ohm-charging',
  },
  {
    status: 'live',
    label: 'Live',
    description: 'Actively working on it',
    color: 'ohm-live',
  },
  {
    status: 'grounded',
    label: 'Grounded',
    description: 'Paused — with context to pick back up',
    color: 'ohm-grounded',
  },
  {
    status: 'powered',
    label: 'Powered',
    description: 'Done — circuit complete',
    color: 'ohm-powered',
  },
];

/** Energy tag display config */
export const ENERGY_CONFIG: Record<EnergyTag, { label: string; icon: LucideIcon }> = {
  'quick-win': { label: 'Quick Win', icon: Zap },
  medium: { label: 'Medium', icon: Battery },
  'deep-focus': { label: 'Deep Focus', icon: Flame },
};

/** Create a default empty board */
export function createDefaultBoard(): OhmBoard {
  return {
    version: 1,
    cards: [],
    categories: ['Personal', 'Creative', 'Home'],
    liveWipLimit: 2,
    lastSaved: new Date().toISOString(),
  };
}
