# StorageService Design Proposal

## 1. Current State — localStorage Usage Audit

### Storage Keys

| Key | Data Shape | Location | Read Frequency | Write Frequency |
|-----|-----------|----------|----------------|-----------------|
| `ohm-board` | Full `OhmBoard` JSON (~5-50 KB) | `storage.ts` via `.toolbox/lib/local-storage-sync` | Once on mount (`loadFromLocal`) | Debounced 500ms on every board mutation |
| `ohm-restore-points` | Array of up to 10 `RestorePoint` objects (each containing a full board snapshot) | `restore-points.ts` | On create/delete operations | Before each Drive merge; on user delete |
| `ohm-last-opened` | Unix timestamp string | `useWelcomeBack.ts` | Once on mount | Once on mount |
| `ohm-drive-synced` | `'1'` or absent | `useDriveSync.ts` | Once on mount (auto-reconnect check) | On connect/disconnect (user action) |
| `ohm-drive-*` | OAuth tokens (access, refresh, expiry) | `.toolbox/lib/google-drive-sync` (internal) | On every Drive API call | On token refresh/exchange |

### Current Access Patterns

- **`storage.ts`**: Wraps `createLocalStorage<OhmBoard>()` from `.toolbox/lib/local-storage-sync`. Exports `loadFromLocal`, `saveToLocal`, `clearLocal`. Applies `sanitizeBoard()` on load, `stripTransientCards()` on save.
- **`restore-points.ts`**: Direct `localStorage.getItem/setItem` with `JSON.parse/stringify`. try/catch on every call.
- **`useWelcomeBack.ts`**: Direct `localStorage.getItem/setItem` in a `useEffect`. try/catch wrapper.
- **`useDriveSync.ts`**: Direct `localStorage.getItem/setItem/removeItem` for the sync flag. No wrapper.
- **`.toolbox/lib/google-drive-sync`**: Internal token storage. Managed by the toolbox module, not directly by app code.

---

## 2. Google Drive Sync — How It Interacts with Storage

### Flow Summary

```
Board mutations → setBoard(fn) → React state
                                    ↓
                          useDebouncedSave (500ms) → saveToLocal → localStorage
                                    ↓
                          queueSync (2s debounce) → saveToDrive → Google Drive
```

### Key Touch Points

1. **`useBoard.ts` line 29**: `loadFromLocal()` hydrates initial state (synchronous, blocking render).
2. **`useBoard.ts` lines 15-26**: `useDebouncedSave` calls `saveToLocal` 500ms after each state change.
3. **`useBoard.ts` lines 329/343**: `replaceBoard()` calls `saveToLocal()` immediately (no debounce) when Drive sync delivers a merged board.
4. **`useDriveSync.ts`**: `mergeWithRemote()` loads from Drive, merges, then calls `onBoardLoaded(merged)` → `replaceBoard()` → `saveToLocal()`. Restore point created before merge.
5. **`useDriveSync.ts`**: `pushToRemote()` calls `saveToDrive(stripTransientCards(board))` — no localStorage interaction.

### What Drive Sync Does NOT Do

- It never reads from localStorage directly for board data — it gets the board from React state (`boardRef.current`).
- It writes to localStorage only **indirectly** through `replaceBoard()` → `saveToLocal()`.
- The `ohm-drive-synced` flag and token storage are the only direct localStorage access.

---

## 3. OPFS Migration Complications

### Synchronous Read on Mount (Critical)

`useBoard` initializes state with `useState(() => loadFromLocal())` — a **synchronous** call inside a state initializer. OPFS is async-only. This is the single biggest migration blocker.

**Mitigation**: Two-phase hydration:
1. Start with a default/empty board (synchronous).
2. Hydrate from OPFS in a `useEffect`, then `setBoard(loaded)`.
3. Optionally keep a lightweight localStorage "cache" for instant hydration (written alongside OPFS), so there's no visible flash on reload. This cache is purely an optimization — OPFS is the source of truth.

### High-Frequency Writes

Board saves are debounced at 500ms. OPFS writes are fast enough (file system, not network), but we should:
- Keep the debounce.
- Use a write queue/lock to prevent overlapping writes.
- Consider the OPFS `createSyncAccessHandle()` for the dedicated worker path (true synchronous access in a Web Worker).

### Restore Points — Large Payloads

Up to 10 full board snapshots stored under `ohm-restore-points`. This is potentially the largest localStorage value. OPFS handles this well (no 5MB limit). Could be split into individual files per restore point for better performance.

### Multi-Tab

OPFS has **no built-in cross-tab notification**. If the user opens multiple tabs:
- localStorage fires `storage` events across tabs (current code doesn't listen for them, but could).
- OPFS requires manual coordination (BroadcastChannel or locks API).
- **Current risk is low**: the app doesn't appear to handle multi-tab today. But StorageService should document this limitation and provide an extension point.

### Google Drive Token Storage

The `.toolbox/lib/google-drive-sync` module manages its own token keys (`ohm-drive-*`) in localStorage. **This is inside the toolbox and should NOT be migrated** — it's an external module with its own persistence strategy. StorageService should only govern app-owned keys.

---

## 4. Proposed Design

### File Location

```
src/services/storage-service.ts      ← Interface + factory
src/services/backends/opfs.ts        ← OPFS backend
src/services/backends/local-storage.ts ← localStorage fallback backend
src/services/storage.ts              ← Configured instance (replaces current utils/storage.ts role)
```

New `src/services/` directory — distinct from `src/utils/` (pure functions) and `src/hooks/` (React). Services are stateful singletons with async APIs. This also makes the eventual toolbox extraction cleaner.

### Interface

```typescript
/** StorageService — async key-value persistence with pluggable backends. */

export interface StorageBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export interface StorageService {
  /** Read and deserialize a typed value. Returns defaultValue if key is absent. */
  get<T>(key: string, options?: { deserialize?: (raw: string) => T; defaultValue?: T }): Promise<T | null>;

  /** Serialize and write a typed value. */
  set<T>(key: string, value: T, options?: { serialize?: (val: T) => string }): Promise<void>;

  /** Delete a single key. */
  delete(key: string): Promise<void>;

  /** Delete all app-owned keys. */
  clear(): Promise<void>;

  /** List all app-owned keys. */
  keys(): Promise<string[]>;

  /** Which backend is active. */
  readonly backend: 'opfs' | 'localStorage';

  /** True once the service has completed async initialization. */
  readonly ready: boolean;

  /** Resolves when initialization is complete. */
  whenReady(): Promise<void>;
}
```

**Design decisions:**
- `StorageBackend` is the low-level raw string interface (what OPFS/localStorage implement).
- `StorageService` is the high-level typed interface (what app code uses). Default serialization is `JSON.stringify`/`JSON.parse`.
- All methods are `async` — even the localStorage backend wraps synchronously to maintain a uniform API.
- `whenReady()` lets consumers await initialization (OPFS directory creation, feature detection).
- Keys are prefixed internally (e.g., `ohm:`) to namespace the OPFS directory and avoid collisions.

### Backend Selection

```typescript
export async function createStorageService(options?: {
  forceBackend?: 'opfs' | 'localStorage';
}): Promise<StorageService> {
  if (options?.forceBackend !== 'localStorage' && await supportsOPFS()) {
    return createOPFSService();
  }
  return createLocalStorageService();
}
```

OPFS detection: check `navigator.storage?.getDirectory` exists and a test write succeeds. Fall back to localStorage if OPFS is unavailable (older browsers, some Firefox private browsing).

### OPFS Backend Strategy

Store each key as a separate file under an `ohm/` OPFS directory:
```
ohm/
  board.json
  restore-points.json    (or individual files per point)
  last-opened.txt
  drive-synced.txt
```

Individual files per key avoids re-serializing the entire store on every write. The board file gets the most writes (~every 500ms during active editing).

---

## 5. GDrive Sync Integration

### Current: Drive Sync Sits Above localStorage

```
                    useDriveSync
                   /            \
           loadFromDrive    saveToDrive       (Google Drive)
                  \            /
                replaceBoard / queueSync
                      |
                   useBoard
                      |
               saveToLocal / loadFromLocal    (localStorage)
```

### Proposed: Drive Sync Sits Above StorageService

```
                    useDriveSync
                   /            \
           loadFromDrive    saveToDrive       (Google Drive — unchanged)
                  \            /
                replaceBoard / queueSync
                      |
                   useBoard
                      |
              storageService.get/set          (OPFS or localStorage)
```

**What changes for Drive sync**: Almost nothing. Drive sync interacts with board state through React (`boardRef.current`, `replaceBoard`), not through localStorage directly. The only direct localStorage touches in `useDriveSync.ts` are:

1. **`ohm-drive-synced` flag** → Migrate to `storageService.get/set('drive-synced')`. Since this is read once on mount, the async API is fine — it's already inside a `useEffect`.
2. **Token storage** (`ohm-drive-*`) → **Leave as-is**. Managed by `.toolbox/lib/google-drive-sync`, outside our control.

### Restore Points

`restore-points.ts` becomes async:
```typescript
// Before
export function getRestorePoints(): RestorePoint[] { ... }

// After
export async function getRestorePoints(): Promise<RestorePoint[]> { ... }
```

Since restore points are only accessed during Drive merge (before sync) and in Settings UI (on demand), making them async has zero UX impact.

---

## 6. Migration Path

### Phase 1: Introduce StorageService (non-breaking)

1. Create `src/services/storage-service.ts` with interface + factory.
2. Implement `LocalStorageBackend` (wraps current behavior, async shell over sync calls).
3. Implement `OPFSBackend`.
4. Create `src/services/storage.ts` — the configured singleton with the `ohm` key prefix.
5. **No existing code changes yet.** The service exists but nothing uses it.

### Phase 2: Migrate `storage.ts` (board persistence)

1. Replace `createLocalStorage` usage in `src/utils/storage.ts` with `storageService.get/set`.
2. Keep `sanitizeBoard()` and `stripTransientCards()` — they're domain logic, not storage logic.
3. Change `loadFromLocal` → `async loadBoard()`, `saveToLocal` → `async saveBoard()`.
4. **Two-phase hydration in `useBoard`**:
   - `useState(() => cachedLoadSync())` — reads from a lightweight localStorage cache for instant render.
   - `useEffect` calls `await loadBoard()` from OPFS and reconciles if different.
   - Cache is written alongside OPFS saves (fire-and-forget `localStorage.setItem` as pure optimization).

### Phase 3: Migrate secondary keys

1. `useWelcomeBack.ts`: `ohm-last-opened` → `storageService.get/set`. Already in a `useEffect`, trivially async.
2. `useDriveSync.ts`: `ohm-drive-synced` → `storageService.get/set`. Already in a `useEffect`.
3. `restore-points.ts`: `ohm-restore-points` → `storageService.get/set`. Make functions async.

### Phase 4: Remove direct localStorage imports

1. Grep for remaining `localStorage.` calls — should be zero outside of:
   - The localStorage cache optimization (Phase 2).
   - `.toolbox/lib/` internals (token storage — leave alone).
   - Test setup (`localStorage.clear()` in `beforeEach` — keep, or also clear StorageService).
2. Update test stubs: create `src/test/__stubs__/storage-service.ts` backed by an in-memory `Map<string, string>`.
3. Add vitest alias for the new service module.

### Phase 5 (future): Toolbox extraction

Move `StorageService` interface + backends into `.toolbox/lib/storage-service` for reuse by companion apps. The app-specific singleton stays in `src/services/storage.ts`.

---

## 7. Toolbox Extraction Extension Point

The design is already structured for extraction:

- **`StorageBackend` interface + both backends** → `.toolbox/lib/storage-service`
- **`createStorageService` factory** → `.toolbox/lib/storage-service`
- **App-level config** (key prefix, serialization defaults) → stays in `src/services/storage.ts`
- **Domain logic** (`sanitizeBoard`, `stripTransientCards`) → stays in `src/utils/storage.ts`

The boundary is clean: the toolbox module knows nothing about boards, cards, or OHM types. It's a generic async key-value store with backend detection.

The factory pattern (`createStorageService`) matches the existing toolbox convention (`createLocalStorage`, `createDriveSync`).

---

## 8. Testing Strategy

- **Unit tests**: `StorageService` with `LocalStorageBackend` (jsdom provides localStorage). OPFS backend tested with a mock/spy on `navigator.storage.getDirectory`.
- **Integration tests**: `useBoard` two-phase hydration tested with the in-memory stub.
- **Stub file**: `src/test/__stubs__/storage-service.ts` — `Map`-based, no filesystem or localStorage, instant.
- **Vitest alias**: Add `../../src/services/storage-service` → stub path in `vitest.config.ts`.

---

## 9. Summary of Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| New `src/services/` directory | Services are stateful singletons — distinct from pure utils and hooks |
| All-async API | OPFS is async-only; uniform interface regardless of backend |
| Sync localStorage cache for hydration | Avoids flash/loading state on mount; OPFS is source of truth |
| Don't touch token storage | `.toolbox/lib/google-drive-sync` owns its own keys |
| Individual OPFS files per key | Avoids full-store re-serialization on every write |
| `StorageBackend` / `StorageService` split | Clean extraction boundary for toolbox |
| Key prefix (`ohm:`) | Namespace isolation in OPFS directory |
