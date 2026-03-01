import { useState, useEffect } from 'react';
import type { OhmBoard } from '../types/board';
import { STATUS } from '../types/board';

const LAST_OPENED_KEY = 'ohm-last-opened';
const THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface WelcomeBackSummary {
  charging: number;
  live: number;
  grounded: number;
  powered: number;
}

export function useWelcomeBack(board: OhmBoard): {
  summary: WelcomeBackSummary | null;
  dismiss: () => void;
} {
  const [summary, setSummary] = useState<WelcomeBackSummary | null>(null);

  useEffect(() => {
    try {
      const lastOpened = localStorage.getItem(LAST_OPENED_KEY);
      const now = Date.now();

      if (lastOpened && now - parseInt(lastOpened, 10) > THRESHOLD_MS) {
        setSummary({
          charging: board.cards.filter((c) => c.status === STATUS.CHARGING).length,
          live: board.cards.filter((c) => c.status === STATUS.LIVE).length,
          grounded: board.cards.filter((c) => c.status === STATUS.GROUNDED).length,
          powered: board.cards.filter((c) => c.status === STATUS.POWERED).length,
        });
      }

      localStorage.setItem(LAST_OPENED_KEY, String(now));
    } catch {
      // localStorage unavailable
    }
    // Intentionally capture board snapshot at mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => setSummary(null);

  return { summary, dismiss };
}
