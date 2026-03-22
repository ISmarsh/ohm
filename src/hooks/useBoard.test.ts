import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { STATUS, createDefaultBoard } from '../types/board';
import { createCard } from '../utils/board-utils';
import { useBoard } from './useBoard';

const { mockRecoverFromStorage } = vi.hoisted(() => ({
  mockRecoverFromStorage: vi
    .fn<() => Promise<import('../types/board').OhmBoard | null>>()
    .mockResolvedValue(null),
}));

vi.mock('../utils/storage', async () => {
  const actual = await vi.importActual<typeof import('../utils/storage')>('../utils/storage');
  return {
    ...actual,
    recoverFromStorage: mockRecoverFromStorage,
  };
});

beforeEach(() => {
  localStorage.clear();
});

describe('useBoard', () => {
  it('initializes with a default board', () => {
    const { result } = renderHook(() => useBoard());
    expect(result.current.board.cards).toEqual([]);
    expect(result.current.board.categories).toEqual(['Personal', 'Creative', 'Home']);
  });

  describe('quickAdd', () => {
    it('adds a card to Charging', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.quickAdd('New task');
      });
      expect(result.current.board.cards).toHaveLength(1);
      expect(result.current.board.cards[0].title).toBe('New task');
      expect(result.current.board.cards[0].status).toBe(STATUS.CHARGING);
    });

    it('applies energy override', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.quickAdd('Big task', { energy: 6 });
      });
      expect(result.current.board.cards[0].energy).toBe(6);
    });

    it('returns the created card', () => {
      const { result } = renderHook(() => useBoard());
      let card: ReturnType<typeof result.current.quickAdd>;
      act(() => {
        card = result.current.quickAdd('Test');
      });
      expect(card!.id).toBeTruthy();
      expect(card!.title).toBe('Test');
    });
  });

  describe('move', () => {
    it('moves a card to a new column', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.quickAdd('Task');
      });
      const id = result.current.board.cards[0].id;
      act(() => {
        result.current.move(id, STATUS.LIVE);
      });
      expect(result.current.board.cards[0].status).toBe(STATUS.LIVE);
    });

    it('no-ops for nonexistent card id', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.quickAdd('Task');
      });
      const before = result.current.board;
      act(() => {
        result.current.move('nonexistent', STATUS.LIVE);
      });
      expect(result.current.board).toBe(before);
    });
  });

  describe('updateCard', () => {
    it('updates card fields', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.quickAdd('Original');
      });
      const card = result.current.board.cards[0];
      act(() => {
        result.current.updateCard({ ...card, title: 'Updated' });
      });
      expect(result.current.board.cards[0].title).toBe('Updated');
    });
  });

  describe('deleteCard', () => {
    it('removes a card', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.quickAdd('To delete');
      });
      const id = result.current.board.cards[0].id;
      act(() => {
        result.current.deleteCard(id);
      });
      expect(result.current.board.cards).toHaveLength(0);
    });
  });

  describe('restoreCard', () => {
    it('re-adds a previously deleted card', () => {
      const { result } = renderHook(() => useBoard());
      let card: ReturnType<typeof result.current.quickAdd>;
      act(() => {
        card = result.current.quickAdd('Restore me');
      });
      act(() => {
        result.current.deleteCard(card!.id);
      });
      expect(result.current.board.cards).toHaveLength(0);
      act(() => {
        result.current.restoreCard(card!);
      });
      expect(result.current.board.cards).toHaveLength(1);
      expect(result.current.board.cards[0].title).toBe('Restore me');
    });

    it('no-ops if card already exists', () => {
      const { result } = renderHook(() => useBoard());
      let card: ReturnType<typeof result.current.quickAdd>;
      act(() => {
        card = result.current.quickAdd('Already here');
      });
      act(() => {
        result.current.restoreCard(card!);
      });
      expect(result.current.board.cards).toHaveLength(1);
    });
  });

  describe('categories', () => {
    it('adds a category', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.addCategory('Work');
      });
      expect(result.current.board.categories).toContain('Work');
    });

    it('does not add duplicate categories', () => {
      const { result } = renderHook(() => useBoard());
      const before = result.current.board.categories.length;
      act(() => {
        result.current.addCategory('Personal');
      });
      expect(result.current.board.categories.length).toBe(before);
    });

    it('removes a category and clears it from cards', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.quickAdd('Tagged', { category: 'Personal' });
      });
      act(() => {
        result.current.removeCategory('Personal');
      });
      expect(result.current.board.categories).not.toContain('Personal');
      expect(result.current.board.cards[0].category).toBe('');
    });

    it('removes a category and clears it from activities', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.setActivities(() => [
          { id: 'a1', sourceId: 'ohm', name: 'Test', category: 'Personal' },
        ]);
      });
      act(() => {
        result.current.removeCategory('Personal');
      });
      expect(result.current.board.activities![0].category).toBeUndefined();
    });

    it('renames a category across all cards', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.quickAdd('Tagged', { category: 'Personal' });
      });
      act(() => {
        result.current.renameCategory('Personal', 'Private');
      });
      expect(result.current.board.categories).toContain('Private');
      expect(result.current.board.categories).not.toContain('Personal');
      expect(result.current.board.cards[0].category).toBe('Private');
    });

    it('renames a category across activities', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.setActivities(() => [
          { id: 'a1', sourceId: 'ohm', name: 'Test', category: 'Personal' },
        ]);
      });
      act(() => {
        result.current.renameCategory('Personal', 'Private');
      });
      expect(result.current.board.activities![0].category).toBe('Private');
    });

    it('rejects rename to existing category name', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.addCategory('Work');
      });
      const before = result.current.board;
      act(() => {
        result.current.renameCategory('Personal', 'Work');
      });
      expect(result.current.board).toBe(before);
    });
  });

  describe('setEnergyBudget', () => {
    it('updates the energy budget', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.setEnergyBudget(24);
      });
      expect(result.current.board.energyBudget).toBe(24);
    });

    it('clamps to minimum of 1', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.setEnergyBudget(0);
      });
      expect(result.current.board.energyBudget).toBe(1);
    });
  });

  describe('setLiveCapacity', () => {
    it('updates the live capacity', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.setLiveCapacity(10);
      });
      expect(result.current.board.liveCapacity).toBe(10);
    });

    it('clamps to minimum of 1', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.setLiveCapacity(-5);
      });
      expect(result.current.board.liveCapacity).toBe(1);
    });
  });

  describe('replaceBoard', () => {
    it('removes Charging activity-linked cards when activities differ', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.setActivities(() => [{ id: 'a1', sourceId: 'ohm', name: 'Activity A' }]);
      });

      let linkedCard: ReturnType<typeof result.current.quickAdd>;
      act(() => {
        linkedCard = { ...result.current.quickAdd('Linked card'), activityInstanceId: 'inst-1' };
      });
      act(() => {
        result.current.replaceBoard({
          ...result.current.board,
          activities: [{ id: 'a2', sourceId: 'ohm', name: 'Activity B' }],
          cards: [linkedCard],
        });
      });

      expect(result.current.board.activities![0].id).toBe('a2');
      // Charging activity-linked cards are removed (they'll be re-materialized)
      expect(result.current.board.cards).toHaveLength(0);
    });

    it('keeps non-Charging activity-linked cards but strips activityInstanceId', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.setActivities(() => [{ id: 'a1', sourceId: 'ohm', name: 'Activity A' }]);
      });

      let liveCard: ReturnType<typeof result.current.quickAdd>;
      act(() => {
        liveCard = {
          ...result.current.quickAdd('Live card'),
          activityInstanceId: 'inst-1',
          status: STATUS.LIVE,
        };
      });
      act(() => {
        result.current.replaceBoard({
          ...result.current.board,
          activities: [{ id: 'a2', sourceId: 'ohm', name: 'Activity B' }],
          cards: [liveCard],
        });
      });

      // Live card is kept but activityInstanceId is stripped
      expect(result.current.board.cards).toHaveLength(1);
      expect(result.current.board.cards[0].activityInstanceId).toBeUndefined();
    });

    it('preserves activityInstanceId when activities are unchanged', () => {
      const { result } = renderHook(() => useBoard());
      const activities = [{ id: 'a1', sourceId: 'ohm', name: 'Activity A' }];
      let card: ReturnType<typeof result.current.quickAdd>;
      act(() => {
        result.current.setActivities(() => activities);
        card = { ...result.current.quickAdd('Linked'), activityInstanceId: 'inst-1' };
      });

      act(() => {
        result.current.replaceBoard({
          ...result.current.board,
          activities,
          cards: [card],
        });
      });

      expect(result.current.board.cards[0].activityInstanceId).toBe('inst-1');
    });

    it('detects activity property changes (not just ID changes)', () => {
      const { result } = renderHook(() => useBoard());
      let card: ReturnType<typeof result.current.quickAdd>;
      act(() => {
        result.current.setActivities(() => [
          { id: 'a1', sourceId: 'ohm', name: 'Original', energy: 3 },
        ]);
        card = { ...result.current.quickAdd('Linked'), activityInstanceId: 'inst-1' };
      });

      act(() => {
        result.current.replaceBoard({
          ...result.current.board,
          activities: [{ id: 'a1', sourceId: 'ohm', name: 'Original', energy: 5 }],
          cards: [card],
        });
      });

      // Energy changed → Charging activity-linked card is removed
      expect(result.current.board.cards).toHaveLength(0);
    });
  });

  describe('reorderBatch', () => {
    it('assigns sequential sort orders', () => {
      const { result } = renderHook(() => useBoard());
      act(() => {
        result.current.quickAdd('A');
        result.current.quickAdd('B');
        result.current.quickAdd('C');
      });
      const [a, b, c] = result.current.board.cards;
      act(() => {
        result.current.reorderBatch([c.id, a.id, b.id], c.id);
      });
      const cards = result.current.board.cards;
      const sorted = [...cards].sort((x, y) => x.sortOrder - y.sortOrder);
      expect(sorted.map((card) => card.id)).toEqual([c.id, a.id, b.id]);
    });
  });

  describe('OPFS recovery', () => {
    beforeEach(() => {
      mockRecoverFromStorage.mockReset().mockResolvedValue(null);
    });

    it('recovers board from OPFS when localStorage is empty', async () => {
      const recovered = {
        ...createDefaultBoard(),
        cards: [createCard('Recovered task')],
      };
      mockRecoverFromStorage.mockResolvedValueOnce(recovered);

      const { result } = renderHook(() => useBoard());

      await waitFor(() => {
        expect(result.current.board.cards).toHaveLength(1);
      });
      expect(result.current.board.cards[0].title).toBe('Recovered task');
    });

    it('skips recovery when board already has cards', async () => {
      const existing = {
        ...createDefaultBoard(),
        cards: [createCard('Existing')],
      };
      localStorage.setItem('ohm-board', JSON.stringify(existing));

      const staleData = {
        ...createDefaultBoard(),
        cards: [createCard('Old OPFS data')],
      };
      mockRecoverFromStorage.mockResolvedValueOnce(staleData);

      const { result } = renderHook(() => useBoard());
      expect(result.current.board.cards[0].title).toBe('Existing');

      // Let recovery effect settle — should be a no-op
      await act(async () => {});

      expect(result.current.board.cards).toHaveLength(1);
      expect(result.current.board.cards[0].title).toBe('Existing');
    });

    it('skips recovery when OPFS returns empty board', async () => {
      const emptyRecovery = { ...createDefaultBoard(), cards: [] };
      mockRecoverFromStorage.mockResolvedValueOnce(emptyRecovery);

      const { result } = renderHook(() => useBoard());

      await act(async () => {});

      expect(result.current.board.cards).toHaveLength(0);
    });
  });
});
