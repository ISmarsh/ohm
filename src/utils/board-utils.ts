import type { OhmCard, OhmBoard, ColumnStatus } from '../types/board';
import { STATUS, ENERGY, ENERGY_SEGMENTS } from '../types/board';

/** Generate a short unique ID */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Create a new card with minimal input (quick capture) */
export function createCard(
  title: string,
  overrides?: Partial<
    Pick<OhmCard, 'description' | 'energy' | 'category' | 'activityInstanceId' | 'scheduledDate'>
  >,
): OhmCard {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    description: overrides?.description ?? '',
    status: STATUS.CHARGING,
    tasks: [],
    energy: overrides?.energy ?? ENERGY.MED,
    category: overrides?.category ?? '',
    createdAt: now,
    updatedAt: now,
    sortOrder: Date.now(),
    activityInstanceId: overrides?.activityInstanceId,
    scheduledDate: overrides?.scheduledDate,
  };
}

/** Move a card to a new column */
export function moveCard(card: OhmCard, newStatus: ColumnStatus): OhmCard {
  return {
    ...card,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
}

/** Get cards for a specific column, sorted by sortOrder */
export function getColumnCards(board: OhmBoard, status: ColumnStatus): OhmCard[] {
  return board.cards.filter((c) => c.status === status).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Get column capacity usage in energy segments. Returns null for Powered (no limit). */
export function getColumnCapacity(
  board: OhmBoard,
  status: ColumnStatus,
): { used: number; total: number } | null {
  if (status === STATUS.POWERED) return null;

  if (status === STATUS.LIVE) {
    const used = board.cards
      .filter((c) => c.status === STATUS.LIVE)
      .reduce((sum, c) => sum + ENERGY_SEGMENTS[c.energy]!, 0);
    return { used, total: board.liveCapacity };
  }

  // Charging and Grounded share the energy budget
  const used = board.cards
    .filter((c) => c.status === STATUS.CHARGING || c.status === STATUS.GROUNDED)
    .reduce((sum, c) => sum + ENERGY_SEGMENTS[c.energy]!, 0);
  return { used, total: board.energyBudget };
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
