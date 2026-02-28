/**
 * Google Drive persistence for Ohm
 *
 * Strategy: Store the board as a single JSON file in a designated
 * Google Drive folder. Uses OAuth2 + Drive API v3.
 *
 * TODO: Implement these when ready to add Google Drive sync
 *
 * Setup steps:
 * 1. Create a Google Cloud project
 * 2. Enable Google Drive API
 * 3. Create OAuth 2.0 credentials (Web application)
 * 4. Add authorized redirect URI (your GitHub Pages URL)
 * 5. Set client ID in env/config
 *
 * Flow:
 * - On first load, check if user is authenticated
 * - If not, show "Connect Google Drive" button
 * - On auth, look for ohm-board.json in appDataFolder or a specific folder
 * - Load → merge with local? or replace local
 * - On save, debounce writes to Drive (e.g., 2s after last change)
 */

import type { OhmBoard } from '../types/board';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DRIVE_FILE_NAME = 'ohm-board.json';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DRIVE_MIME_TYPE = 'application/json';

export interface DriveConfig {
  clientId: string;
  /** Use 'appDataFolder' for hidden app storage, or a folder ID for visible */
  folderStrategy: 'appDataFolder' | 'namedFolder';
}

/** Placeholder — will implement OAuth flow */
export async function authenticateDrive(
  _config: DriveConfig
): Promise<boolean> {
  console.log('[Ohm] Google Drive auth not yet implemented');
  return false;
}

/** Placeholder — will implement file read */
export async function loadFromDrive(
  _config: DriveConfig
): Promise<OhmBoard | null> {
  console.log('[Ohm] Google Drive load not yet implemented');
  return null;
}

/** Placeholder — will implement file write */
export async function saveToDrive(
  _config: DriveConfig,
  _board: OhmBoard
): Promise<boolean> {
  console.log('[Ohm] Google Drive save not yet implemented');
  return false;
}
