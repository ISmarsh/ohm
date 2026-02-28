import type { OhmBoard } from '../types/board';
import { createDefaultBoard } from '../types/board';

const STORAGE_KEY = 'ohm-board';

/** Save board to localStorage (fallback / offline mode) */
export function saveToLocal(board: OhmBoard): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch (e) {
    console.error('[Ohm] Failed to save to localStorage:', e);
  }
}

/** Load board from localStorage */
export function loadFromLocal(): OhmBoard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as OhmBoard;
      // Basic version check for future migrations
      if (parsed.version === 1) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('[Ohm] Failed to load from localStorage:', e);
  }
  return createDefaultBoard();
}

/** Clear local storage */
export function clearLocal(): void {
  localStorage.removeItem(STORAGE_KEY);
}
