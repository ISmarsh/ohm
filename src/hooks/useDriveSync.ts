import { useState, useEffect, useCallback, useRef } from 'react';
import type { OhmBoard } from '../types/board';
import {
  initDriveAuth,
  requestAccessToken,
  disconnectDrive,
  isAuthenticated,
  loadFromDrive,
  saveToDrive,
} from '../utils/google-drive';
import { DRIVE_CLIENT_ID } from '../config/drive';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

const SYNC_FLAG_KEY = 'ohm-drive-synced';

function wasPreviouslySynced(): boolean {
  return localStorage.getItem(SYNC_FLAG_KEY) === '1';
}

interface UseDriveSyncReturn {
  driveAvailable: boolean;
  driveConnected: boolean;
  syncStatus: SyncStatus;
  needsReconnect: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  manualSync: () => Promise<void>;
  queueSync: (board: OhmBoard) => void;
}

export function useDriveSync(
  currentBoard: OhmBoard,
  onBoardLoaded: (board: OhmBoard) => void,
): UseDriveSyncReturn {
  const [driveAvailable, setDriveAvailable] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const boardRef = useRef(currentBoard);

  // Keep boardRef current
  useEffect(() => {
    boardRef.current = currentBoard;
  }, [currentBoard]);

  // Initialize GIS on mount
  useEffect(() => {
    if (!DRIVE_CLIENT_ID) return;

    // GIS script loads async -- retry briefly if not ready yet
    const tryInit = () => {
      const ready = initDriveAuth();
      if (ready) {
        setDriveAvailable(true);
        return true;
      }
      return false;
    };

    if (tryInit()) {
      setNeedsReconnect(wasPreviouslySynced());
      return;
    }

    // Script may still be loading -- poll a few times
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryInit()) {
        setNeedsReconnect(wasPreviouslySynced());
        clearInterval(interval);
      } else if (attempts >= 10) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setSyncStatus((prev) => (prev === 'offline' ? 'idle' : prev));
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) setSyncStatus('offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const pushToRemote = useCallback(async (board: OhmBoard) => {
    if (!isAuthenticated() || !navigator.onLine) {
      setSyncStatus(navigator.onLine ? 'idle' : 'offline');
      return;
    }
    setSyncStatus('syncing');
    try {
      const ok = await saveToDrive(board);
      setSyncStatus(ok ? 'synced' : 'error');
    } catch {
      setSyncStatus('error');
    }
  }, []);

  const connect = useCallback(async () => {
    const token = await requestAccessToken();
    if (!token) return;

    setDriveConnected(true);
    setNeedsReconnect(false);
    localStorage.setItem(SYNC_FLAG_KEY, '1');
    setSyncStatus('syncing');

    try {
      const remote = await loadFromDrive();
      if (remote && remote.lastSaved > boardRef.current.lastSaved) {
        // Remote is newer -- use it
        onBoardLoaded(remote);
        setSyncStatus('synced');
      } else {
        // Local is newer or no remote -- push local
        const ok = await saveToDrive(boardRef.current);
        setSyncStatus(ok ? 'synced' : 'error');
      }
    } catch {
      setSyncStatus('error');
    }
  }, [onBoardLoaded]);

  const disconnect = useCallback(() => {
    disconnectDrive();
    setDriveConnected(false);
    setNeedsReconnect(false);
    localStorage.removeItem(SYNC_FLAG_KEY);
    setSyncStatus('idle');
  }, []);

  const queueSync = useCallback(
    (board: OhmBoard) => {
      if (!driveConnected) return;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => pushToRemote(board), 2000);
    },
    [driveConnected, pushToRemote],
  );

  const manualSync = useCallback(async () => {
    if (!driveConnected || !navigator.onLine) return;
    setSyncStatus('syncing');
    try {
      const remote = await loadFromDrive();
      if (remote && remote.lastSaved > boardRef.current.lastSaved) {
        onBoardLoaded(remote);
        setSyncStatus('synced');
      } else {
        const ok = await saveToDrive(boardRef.current);
        setSyncStatus(ok ? 'synced' : 'error');
      }
    } catch {
      setSyncStatus('error');
    }
  }, [driveConnected, onBoardLoaded]);

  // Cleanup pending sync on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  return {
    driveAvailable,
    driveConnected,
    syncStatus,
    needsReconnect,
    connect,
    disconnect,
    manualSync,
    queueSync,
  };
}
