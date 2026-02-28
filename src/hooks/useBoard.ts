import { useState, useCallback, useEffect, useRef } from 'react';
import type { OhmBoard, OhmCard, ColumnStatus } from '../types/board';
import { loadFromLocal, saveToLocal } from '../utils/storage';
import {
  createCard,
  moveCard,
  addCardToBoard,
  updateCardInBoard,
  removeCardFromBoard,
} from '../utils/board-utils';

/** Debounce save to avoid excessive writes */
function useDebouncedSave(board: OhmBoard, delayMs = 500) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      saveToLocal(board);
    }, delayMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [board, delayMs]);
}

export function useBoard() {
  const [board, setBoard] = useState<OhmBoard>(() => loadFromLocal());

  // Auto-save on changes
  useDebouncedSave(board);

  /** Quick-add a card to Spark (minimal friction) */
  const quickAdd = useCallback((title: string) => {
    const card = createCard(title);
    setBoard((prev) => addCardToBoard(prev, card));
    return card;
  }, []);

  /** Move a card to a new status */
  const move = useCallback((cardId: string, newStatus: ColumnStatus, whereILeftOff?: string) => {
    setBoard((prev) => {
      const card = prev.cards.find((c) => c.id === cardId);
      if (!card) return prev;
      const updated = moveCard(card, newStatus, whereILeftOff);
      return updateCardInBoard(prev, updated);
    });
  }, []);

  /** Update any card fields */
  const updateCard = useCallback((updatedCard: OhmCard) => {
    setBoard((prev) => updateCardInBoard(prev, updatedCard));
  }, []);

  /** Delete a card */
  const deleteCard = useCallback((cardId: string) => {
    setBoard((prev) => removeCardFromBoard(prev, cardId));
  }, []);

  /** Reorder a card within a column */
  const reorder = useCallback((cardId: string, newSortOrder: number) => {
    setBoard((prev) => {
      const card = prev.cards.find((c) => c.id === cardId);
      if (!card) return prev;
      return updateCardInBoard(prev, {
        ...card,
        sortOrder: newSortOrder,
        updatedAt: new Date().toISOString(),
      });
    });
  }, []);

  /** Update WIP limit */
  const setWipLimit = useCallback((limit: number) => {
    setBoard((prev) => ({ ...prev, liveWipLimit: limit }));
  }, []);

  /** Add a category to the board */
  const addCategory = useCallback((category: string) => {
    setBoard((prev) => {
      if (prev.categories.includes(category)) return prev;
      return {
        ...prev,
        categories: [...prev.categories, category],
        lastSaved: new Date().toISOString(),
      };
    });
  }, []);

  /** Remove a category from the board and clear it from any cards using it */
  const removeCategory = useCallback((category: string) => {
    setBoard((prev) => {
      if (!prev.categories.includes(category)) return prev;
      return {
        ...prev,
        categories: prev.categories.filter((c) => c !== category),
        cards: prev.cards.map((card) =>
          card.category === category ? { ...card, category: '' } : card,
        ),
        lastSaved: new Date().toISOString(),
      };
    });
  }, []);

  return {
    board,
    quickAdd,
    move,
    updateCard,
    deleteCard,
    reorder,
    setWipLimit,
    addCategory,
    removeCategory,
  };
}
