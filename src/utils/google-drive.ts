/**
 * Google Drive persistence for Ohm
 *
 * Uses Google Identity Services (GIS) for OAuth and raw fetch
 * calls to the Drive REST API v3. Stores the board as a single
 * JSON file in appDataFolder (hidden, app-specific storage).
 */

import type { OhmBoard } from '../types/board';
import { DRIVE_CLIENT_ID, DRIVE_FILE_NAME, DRIVE_MIME_TYPE, DRIVE_SCOPE } from '../config/drive';

// --- Token state (module-level, not persisted) ---

let accessToken: string | null = null;
let tokenExpiry = 0;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

export function isAuthenticated(): boolean {
  return !!accessToken && Date.now() < tokenExpiry;
}

/** Expose debug helpers on window for console inspection. */
if (import.meta.env.DEV) {
  Object.assign(window, {
    ohmDrive: {
      getToken: () => accessToken,
      listFiles: async () => {
        const headers = await getHeaders();
        const res = await fetch(
          'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime,size)',
          { headers },
        );
        return res.json();
      },
      readFile: async (fileId: string) => {
        const headers = await getHeaders();
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers,
        });
        return res.json();
      },
    },
  });
}

/** Initialize the GIS token client. Returns false if GIS or client ID unavailable. */
export function initDriveAuth(): boolean {
  if (!DRIVE_CLIENT_ID) return false;
  if (typeof google === 'undefined' || !google.accounts?.oauth2) return false;

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: DRIVE_CLIENT_ID,
    scope: DRIVE_SCOPE,
    callback: () => {}, // overridden per requestAccessToken call
  });
  return true;
}

/** Request an access token (shows consent popup on first call, silent refresh after). */
export function requestAccessToken(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!tokenClient) {
      resolve(null);
      return;
    }

    tokenClient.callback = (response) => {
      if (response.error) {
        console.error('[Ohm] Drive auth error:', response.error_description);
        accessToken = null;
        resolve(null);
        return;
      }
      accessToken = response.access_token;
      tokenExpiry = Date.now() + response.expires_in * 1000;
      resolve(accessToken);
    };

    // First time: consent prompt. Subsequent: silent (empty string = no prompt).
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
  });
}

/** Revoke token and clear state. */
export function disconnectDrive(): void {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken);
  }
  accessToken = null;
  tokenExpiry = 0;
  cachedFileId = null;
}

// --- Internal helpers ---

/** Cached file ID to avoid repeated lookups and prevent duplicate creates. */
let cachedFileId: string | null = null;

async function getHeaders(): Promise<HeadersInit> {
  if (!isAuthenticated()) {
    const token = await requestAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');
  }
  return { Authorization: `Bearer ${accessToken}` };
}

/** Find the ohm-board.json file ID in appDataFolder. */
async function findBoardFileId(): Promise<string | null> {
  if (cachedFileId) return cachedFileId;

  const headers = await getHeaders();
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name='${DRIVE_FILE_NAME}'`,
    fields: 'files(id,modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: '1',
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    console.error('[Ohm] Drive list failed:', res.status, err);
    throw new Error(`Drive list failed: ${res.status}`);
  }

  const data = await res.json();
  cachedFileId = data.files?.[0]?.id ?? null;
  return cachedFileId;
}

// --- Public API ---

/** Load board from Drive. Returns null if no file exists or not authenticated. */
export async function loadFromDrive(): Promise<OhmBoard | null> {
  const fileId = await findBoardFileId();
  if (!fileId) return null;

  const headers = await getHeaders();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers,
  });
  if (!res.ok) return null;

  return res.json() as Promise<OhmBoard>;
}

/** Save board to Drive. Creates the file if it doesn't exist, updates if it does. */
export async function saveToDrive(board: OhmBoard): Promise<boolean> {
  const headers = await getHeaders();
  const fileId = await findBoardFileId();
  const body = JSON.stringify(board);

  if (fileId) {
    // Update existing file
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': DRIVE_MIME_TYPE },
        body,
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error('[Ohm] Drive save failed:', res.status, err);
    }
    return res.ok;
  }

  // Create new file in appDataFolder (multipart upload)
  const metadata = {
    name: DRIVE_FILE_NAME,
    parents: ['appDataFolder'],
    mimeType: DRIVE_MIME_TYPE,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([body], { type: DRIVE_MIME_TYPE }));

  // Note: do NOT set Content-Type header manually -- FormData sets the
  // multipart boundary automatically.
  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    { method: 'POST', headers, body: form },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    console.error('[Ohm] Drive create failed:', res.status, err);
  } else {
    const created = await res.json();
    cachedFileId = created.id;
  }
  return res.ok;
}
