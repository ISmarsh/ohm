import { describe, it, expect } from 'vitest';
import { STATUS, ENERGY, createDefaultBoard } from '../types/board';
import type { OhmCard, OhmBoard } from '../types/board';
import {
  createCard,
  moveCard,
  getColumnCards,
  getColumnCapacity,
  addCardToBoard,
  updateCardInBoard,
  removeCardFromBoard,
} from './board-utils';

function makeCard(overrides: Partial<OhmCard> = {}): OhmCard {
  return {
    id: 'test-1',
    title: 'Test card',
    description: '',
    status: STATUS.CHARGING,
    tasks: [],
    energy: ENERGY.MED,
    category: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    sortOrder: 0,
    ...overrides,
  };
}

function makeBoard(overrides: Partial<OhmBoard> = {}): OhmBoard {
  return { ...createDefaultBoard(), ...overrides };
}

describe('createCard', () => {
  it('creates a card in Charging with Medium energy by default', () => {
    const card = createCard('New idea');
    expect(card.title).toBe('New idea');
    expect(card.status).toBe(STATUS.CHARGING);
    expect(card.energy).toBe(ENERGY.MED);
    expect(card.description).toBe('');
    expect(card.tasks).toEqual([]);
    expect(card.id).toBeTruthy();
  });

  it('applies overrides', () => {
    const card = createCard('Big task', { energy: ENERGY.HIGH, category: 'Work' });
    expect(card.energy).toBe(ENERGY.HIGH);
    expect(card.category).toBe('Work');
  });
});

describe('moveCard', () => {
  it('changes status and updates timestamp', () => {
    const card = makeCard();
    const moved = moveCard(card, STATUS.LIVE);
    expect(moved.status).toBe(STATUS.LIVE);
    expect(moved.updatedAt).not.toBe(card.updatedAt);
  });

  it('returns a new object (immutable)', () => {
    const card = makeCard();
    const moved = moveCard(card, STATUS.GROUNDED);
    expect(moved).not.toBe(card);
    expect(card.status).toBe(STATUS.CHARGING);
  });
});

describe('getColumnCards', () => {
  it('filters and sorts cards by column', () => {
    const board = makeBoard({
      cards: [
        makeCard({ id: 'a', status: STATUS.CHARGING, sortOrder: 2 }),
        makeCard({ id: 'b', status: STATUS.LIVE, sortOrder: 0 }),
        makeCard({ id: 'c', status: STATUS.CHARGING, sortOrder: 1 }),
      ],
    });
    const charging = getColumnCards(board, STATUS.CHARGING);
    expect(charging.map((c) => c.id)).toEqual(['c', 'a']);
  });

  it('returns empty array for empty column', () => {
    const board = makeBoard();
    expect(getColumnCards(board, STATUS.LIVE)).toEqual([]);
  });
});

describe('getColumnCapacity', () => {
  it('sums energy segments for a column', () => {
    const board = makeBoard({
      liveCapacity: 6,
      cards: [
        makeCard({ id: 'a', status: STATUS.LIVE, energy: ENERGY.LOW }), // 1
        makeCard({ id: 'b', status: STATUS.LIVE, energy: ENERGY.HIGH }), // 3
      ],
    });
    expect(getColumnCapacity(board, STATUS.LIVE)).toEqual({ used: 4, total: 6 });
  });

  it('returns null for Powered (no capacity limit)', () => {
    const board = makeBoard();
    expect(getColumnCapacity(board, STATUS.POWERED)).toBeNull();
  });

  it('returns zero used when column is empty', () => {
    const board = makeBoard({ energyBudget: 18 });
    expect(getColumnCapacity(board, STATUS.CHARGING)).toEqual({ used: 0, total: 18 });
  });

  it('counts Medium as 2 segments', () => {
    const board = makeBoard({
      energyBudget: 18,
      cards: [makeCard({ id: 'a', status: STATUS.GROUNDED, energy: ENERGY.MED })],
    });
    expect(getColumnCapacity(board, STATUS.GROUNDED)).toEqual({ used: 2, total: 18 });
  });

  it('shares energy budget between Charging and Grounded', () => {
    const board = makeBoard({
      energyBudget: 10,
      cards: [
        makeCard({ id: 'a', status: STATUS.CHARGING, energy: ENERGY.LOW }), // 1
        makeCard({ id: 'b', status: STATUS.GROUNDED, energy: ENERGY.HIGH }), // 3
      ],
    });
    expect(getColumnCapacity(board, STATUS.CHARGING)).toEqual({ used: 4, total: 10 });
    expect(getColumnCapacity(board, STATUS.GROUNDED)).toEqual({ used: 4, total: 10 });
  });
});

describe('addCardToBoard', () => {
  it('appends a card immutably', () => {
    const board = makeBoard();
    const card = makeCard();
    const updated = addCardToBoard(board, card);
    expect(updated.cards).toHaveLength(1);
    expect(updated.cards[0]).toBe(card);
    expect(updated).not.toBe(board);
  });

  it('does not mutate the original board', () => {
    const board = makeBoard();
    addCardToBoard(board, makeCard());
    expect(board.cards).toHaveLength(0);
  });
});

describe('updateCardInBoard', () => {
  it('replaces matching card by id', () => {
    const card = makeCard({ id: 'x', title: 'Old' });
    const board = makeBoard({ cards: [card] });
    const updated = updateCardInBoard(board, { ...card, title: 'New' });
    expect(updated.cards[0].title).toBe('New');
  });

  it('leaves non-matching cards untouched', () => {
    const a = makeCard({ id: 'a' });
    const b = makeCard({ id: 'b' });
    const board = makeBoard({ cards: [a, b] });
    const updated = updateCardInBoard(board, { ...a, title: 'Changed' });
    expect(updated.cards[1]).toBe(b);
  });
});

describe('removeCardFromBoard', () => {
  it('removes card by id', () => {
    const board = makeBoard({ cards: [makeCard({ id: 'a' }), makeCard({ id: 'b' })] });
    const updated = removeCardFromBoard(board, 'a');
    expect(updated.cards).toHaveLength(1);
    expect(updated.cards[0].id).toBe('b');
  });

  it('returns unchanged board if id not found', () => {
    const board = makeBoard({ cards: [makeCard({ id: 'a' })] });
    const updated = removeCardFromBoard(board, 'nonexistent');
    expect(updated.cards).toHaveLength(1);
  });
});
