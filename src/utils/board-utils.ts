import type { OhmCard, OhmBoard, ColumnStatus, EnergyTag } from '../types/board';

/** Generate a short unique ID */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Create a new card with minimal input (fast capture for Spark) */
export function createCard(
  title: string,
  overrides?: Partial<Pick<OhmCard, 'energy' | 'category' | 'nextStep'>>,
): OhmCard {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    status: 'spark',
    nextStep: overrides?.nextStep ?? '',
    whereILeftOff: '',
    energy: overrides?.energy ?? 'medium',
    category: overrides?.category ?? '',
    createdAt: now,
    updatedAt: now,
    sortOrder: Date.now(),
  };
}

/** Move a card to a new column */
export function moveCard(card: OhmCard, newStatus: ColumnStatus, whereILeftOff?: string): OhmCard {
  return {
    ...card,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    whereILeftOff:
      newStatus === 'grounded' && whereILeftOff !== undefined ? whereILeftOff : card.whereILeftOff,
  };
}

/** Get cards for a specific column, sorted by sortOrder */
export function getColumnCards(board: OhmBoard, status: ColumnStatus): OhmCard[] {
  return board.cards.filter((c) => c.status === status).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Check if Live column is at or over WIP limit */
export function isOverWipLimit(board: OhmBoard): boolean {
  const liveCount = board.cards.filter((c) => c.status === 'live').length;
  return liveCount >= board.liveWipLimit;
}

/** Filter cards by energy level */
export function filterByEnergy(cards: OhmCard[], energy: EnergyTag): OhmCard[] {
  return cards.filter((c) => c.energy === energy);
}

/** Update a card in the board immutably */
export function updateCardInBoard(board: OhmBoard, updatedCard: OhmCard): OhmBoard {
  return {
    ...board,
    cards: board.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    lastSaved: new Date().toISOString(),
  };
}

/** Add a card to the board */
export function addCardToBoard(board: OhmBoard, card: OhmCard): OhmBoard {
  return {
    ...board,
    cards: [...board.cards, card],
    lastSaved: new Date().toISOString(),
  };
}

/** Remove a card from the board */
export function removeCardFromBoard(board: OhmBoard, cardId: string): OhmBoard {
  return {
    ...board,
    cards: board.cards.filter((c) => c.id !== cardId),
    lastSaved: new Date().toISOString(),
  };
}
