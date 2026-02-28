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

interface UseDriveSyncReturn {
  driveAvailable: boolean;
  driveConnected: boolean;
  syncStatus: SyncStatus;
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

    if (tryInit()) return;

    // Script may still be loading -- poll a few times
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryInit() || attempts >= 10) clearInterval(interval);
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
      await saveToDrive(board);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }, []);

  const connect = useCallback(async () => {
    const token = await requestAccessToken();
    if (!token) return;

    setDriveConnected(true);
    setSyncStatus('syncing');

    try {
      const remote = await loadFromDrive();
      if (remote && remote.lastSaved > boardRef.current.lastSaved) {
        // Remote is newer -- use it
        onBoardLoaded(remote);
      } else {
        // Local is newer or no remote -- push local
        await saveToDrive(boardRef.current);
      }
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }, [onBoardLoaded]);

  const disconnect = useCallback(() => {
    disconnectDrive();
    setDriveConnected(false);
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
      } else {
        await saveToDrive(boardRef.current);
      }
      setSyncStatus('synced');
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
    connect,
    disconnect,
    manualSync,
    queueSync,
  };
}
