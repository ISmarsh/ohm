# StorageService Abstraction — Design Proposal

## Current State

### localStorage Keys & Data Shapes

| Key | Data Shape | Read/Write | Frequency | File |
|-----|-----------|------------|-----------|------|
| `ohm-board` | `OhmBoard` (JSON, ~5-50KB) | R+W | Read: mount. Write: debounced 500ms on every board change | `storage.ts` via `createLocalStorage` |
| `ohm-restore-points` | `RestorePoint[]` (up to 10 full board snapshots, ~50-500KB) | R+W | Read/Write: on sync operations, user actions | `restore-points.ts` direct |
| `ohm-last-opened` | `string` (Unix timestamp) | R+W | Once per session (mount) | `useWelcomeBack.ts` direct |
| `ohm-drive-synced` | `'1'` or absent | R+W+D | Read: mount. Write: connect/disconnect | `useDriveSync.ts` direct |
| `ohm-drive-*` | OAuth tokens (managed by toolbox) | R+W | On auth flows, silent refresh | `.toolbox/lib/google-drive-sync` internal |

### GDrive Sync Architecture

The sync layer (`useDriveSync` → `google-drive.ts` → `.toolbox/lib/google-drive-sync`) currently:

1. **Reads localStorage** indirectly — `loadFromLocal()` provides the current board for merge comparison
2. **Writes localStorage** indirectly — `replaceBoard()` calls `saveToLocal()` after merge
3. **Reads localStorage directly** — `ohm-drive-synced` flag for auto-reconnect
4. **Manages its own tokens** — `ohm-drive-*` keys handled internally by `createDriveSync`

Data flow on sync:
```
loadFromDrive() → mergeBoards(local, remote) → replaceBoard(merged) → saveToLocal(merged)
                                                                     → queueSync() → saveToDrive(merged)
```

The Drive layer never calls `localStorage` for board data directly — it always goes through `storage.ts` exports. The `ohm-drive-synced` flag and token keys are the only direct localStorage touches.

### Existing Patterns

- **Factory functions** in `.toolbox/lib/` (`createLocalStorage`, `createDriveSync`) — this is THE pattern to follow
- **Utils** = stateless exports (`src/utils/`), **Hooks** = React state + side effects (`src/hooks/`)
- **No service layer exists** — no classes, no DI container
- **Test stubs** via vitest aliases mapping `.toolbox/lib/*` → `src/test/__stubs__/*`
- **Config** in `src/config/` for environment-driven constants

---

## Migration Complications

### Synchronous Read Requirements
`loadFromLocal()` is called synchronously in `useBoard`'s initial state:
```ts
const [board, setBoard] = useState<OhmBoard>(() => loadFromLocal());
```
OPFS is async-only. This is the **single hardest migration point**. Options:
1. **Two-phase init**: `useState(createDefaultBoard)` → `useEffect` loads from OPFS → replaces state (causes a flash/re-render)
2. **Suspense boundary**: wrap board in `<Suspense>` with a loader, use `use()` or a data-fetching pattern
3. **Sync localStorage read as bootstrap, async OPFS as source of truth**: keep a synchronous localStorage cache that mirrors OPFS, read sync on mount, then async-validate against OPFS

Option 3 is recommended — it's the least disruptive to the current architecture and provides instant mount with OPFS as the durable backend.

### High-Frequency Writes
Board saves fire every 500ms during active editing. OPFS writes are async but fast (no serialization overhead beyond structured clone). The existing debounce is sufficient — no change needed.

### Large Payloads
Restore points store up to 10 full board snapshots. This is the largest payload (~500KB worst case). Well within OPFS limits but worth noting for the migration order — migrate `ohm-board` first, restore points second.

### Multi-Tab Coordination
OPFS (via `createSyncAccessHandle`) locks files to one tab. The app isn't designed for multi-tab, but we can handle it cheaply at the storage level:

- Use the **async** OPFS API (`FileSystemFileHandle.getFile()` / `createWritable()`), NOT `createSyncAccessHandle` — async API allows concurrent reads from multiple tabs, and writes don't require exclusive locks
- Add a lightweight **`BroadcastChannel`** listener so that when one tab writes, other tabs can invalidate their in-memory state (or at minimum not clobber the write on their next save)
- The localStorage mirror already gives us `storage` events cross-tab for free — `window.addEventListener('storage', ...)` fires in non-originating tabs. This is a natural coordination signal

This isn't building multi-tab support — it's preventing multi-tab corruption. Low effort, high safety.

### Token Storage
`ohm-drive-*` keys are managed internally by `.toolbox/lib/google-drive-sync`. These are high-value for durability — losing the refresh token forces re-auth, which is the exact failure OPFS migration aims to prevent. Building StorageService in the toolbox means `createDriveSync` can accept it natively from day one.

---

## Proposal

### Approach: Toolbox-First

StorageService is built in `.toolbox/lib/` from the start — it's a generic utility with no app-specific types. Building it in the toolbox means:

- `createDriveSync` accepts a `storage` option natively — no interim hack, tokens get OPFS durability immediately
- `createLocalStorage` can accept the same adapter — one migration path for both modules
- OHM (and future companion apps) just consume it
- The interface is proven in OHM but never lives in app code that has to be extracted later

### Location

```
.toolbox/lib/
  storage-service/
    index.ts                  ← createStorageService factory + types
    opfs-adapter.ts           ← OPFS adapter
    localstorage-adapter.ts   ← localStorage adapter (fallback + sync cache)
  local-storage-sync.ts      ← existing, updated to accept optional StorageService
  google-drive-sync.ts        ← existing, updated to accept optional StorageService

src/test/__stubs__/
  storage-service.ts          ← Test stub (in-memory Map)

vitest.config.ts              ← New alias: .toolbox/lib/storage-service → stub
```

**Naming note:** "adapter" rather than "backend" — these are storage adapters that implement the StorageService interface. The app has one real backend (the user's browser); adapters are just the access strategy.

### Interface

```ts
/** Which storage adapter is active */
export type StorageAdapterType = 'opfs' | 'localstorage';

/** Async key-value storage with typed values */
export interface StorageService {
  /** Which adapter resolved at init */
  readonly adapter: StorageAdapterType;

  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

/** Factory options */
export interface StorageServiceOptions {
  /** Prefix for all keys (e.g. 'ohm') — prevents collisions */
  prefix?: string;
}

/** Create a StorageService — resolves OPFS when available, localStorage otherwise */
export function createStorageService(opts?: StorageServiceOptions): Promise<StorageService>;
```

**Design decisions:**
- **All async** — OPFS requires it, localStorage can trivially be wrapped in `Promise.resolve()`
- **Untyped keys with generic methods** — callers provide the type at call site, matching the flexibility of `localStorage.getItem`/`setItem`
- **Prefix option** — namespaces keys per-app (e.g. `'ohm'` → keys stored as `ohm/board`)
- **No per-key config** — sanitization/defaults belong in the calling layer (e.g., `storage.ts` keeps `sanitizeBoard`)
- **`adapter` property** — exposes which adapter resolved, so consuming apps can show a storage status segment
- **Async factory** — `createStorageService()` returns a Promise because OPFS availability detection (`navigator.storage.getDirectory()`) is itself async

### Toolbox Module Updates

**`createLocalStorage` gains an optional `storage` param:**
```ts
createLocalStorage<OhmBoard>({
  storageKey: 'ohm-board',
  sanitize: sanitizeBoard,
  createDefault: createDefaultBoard,
  storage: storageService,  // ← new, optional. Falls back to raw localStorage if omitted.
});
```

**`createDriveSync` gains an optional `storage` param:**
```ts
createDriveSync<OhmBoard>({
  clientId: DRIVE_CLIENT_ID,
  storageKeyPrefix: 'ohm-drive',
  storage: storageService,  // ← new, optional. Token persistence uses this instead of localStorage.
  // ...rest unchanged
});
```

Both modules remain backward-compatible — omitting `storage` preserves current localStorage behavior. Apps opt in by passing a StorageService instance.

### Storage Status Segment

The app already has a `SyncIndicator` for Drive sync status (icon-button in the header, config-driven via `statusConfig` record). A **StorageIndicator** follows the same pattern — a small conditional segment that shows which storage layer is active:

```ts
// Shown conditionally when OPFS is available (no segment for plain localStorage —
// that's the baseline, not worth calling out)
type StorageStatus = 'opfs' | 'localstorage';

// Example: a small icon or label in the header near SyncIndicator
// OPFS active: HardDrive icon, muted, tooltip "Using device storage (OPFS)"
// localStorage fallback: could show nothing, or a subtle indicator on Settings
```

**Where it lives:** Same header area as `SyncIndicator`, rendered conditionally when `adapter === 'opfs'`. The `adapter` value comes from StorageService and gets threaded through a hook (likely `useBoard` or a new `useStorageService` hook that initializes the singleton).

**Implementation approach:**
- `StorageService.adapter` is read once at init, exposed via context or hook
- No polling, no state changes — it's static for the session lifetime
- Settings page could show a more detailed storage info row (adapter type, estimated usage via `navigator.storage.estimate()`)

### Storage Strategy: OPFS Primary, localStorage Mirror

```
Write path:
  set(key, value)
    → serialize to JSON
    → write to OPFS (async, primary)
    → write to localStorage (sync mirror, fire-and-forget)

Read path (warm):
  get(key)
    → read from OPFS (async, authoritative)
    → return parsed value

Read path (bootstrap):
  getSync(key)  [optional, on StorageService]
    → read from localStorage mirror (sync, for initial render)
    → caller should async-validate with get() after mount
```

The sync mirror means `useBoard` can keep its synchronous `useState(() => loadFromLocal())` pattern unchanged during migration. OPFS becomes the source of truth; localStorage is a read-cache that's written in parallel.

### How GDrive Sync Interacts

The Drive sync layer's interaction barely changes:

```
Before:  useDriveSync → mergeBoards() → replaceBoard() → saveToLocal()
After:   useDriveSync → mergeBoards() → replaceBoard() → storageService.set('board', merged)
```

Specifically:
1. `storage.ts` exports (`saveToLocal`, `loadFromLocal`) become thin wrappers around `storageService.get('board')` / `storageService.set('board', board)`
2. `useDriveSync` continues calling `storage.ts` exports — it never touches StorageService directly
3. Token keys (`ohm-drive-*`) get OPFS durability automatically via `createDriveSync`'s new `storage` option

### What Stays on localStorage

| Key | Owner | Migrate? | Notes |
|-----|-------|----------|-------|
| `ohm-last-opened` | `useWelcomeBack` | No | Transient timestamp. Losing it just means no welcome-back prompt — harmless. |
| `ohm-drive-synced` | `useDriveSync` | No | Session flag. If lost, user just reconnects — the refresh token (which *is* migrated) is the real value. |

### Migration Path

**Phase 1: Build StorageService in toolbox**
- Create `.toolbox/lib/storage-service/` with interface, OPFS adapter, localStorage adapter
- Add `storage` option to `createLocalStorage` and `createDriveSync` (backward-compatible, optional)
- Write tests in toolbox

**Phase 2: Wire up in OHM (no behavior change)**
- Add vitest alias + test stub for `.toolbox/lib/storage-service`
- Initialize StorageService in app (async, at startup)
- Pass to `createLocalStorage` and `createDriveSync` via `storage` option
- Same localStorage adapter underneath — validates the wiring without changing storage behavior
- All existing tests pass unchanged

**Phase 3: Enable OPFS + status segment**
- `createStorageService()` resolves OPFS adapter when available, localStorage adapter as fallback
- Board and restore points now durable in OPFS with localStorage mirror
- Tokens now durable in OPFS via `createDriveSync`'s `storage` option
- Add `StorageIndicator` component — shows OPFS icon when active
- Thread `adapter` value to the header via hook/context

**Phase 4: Multi-tab safety**
- Add `BroadcastChannel` write notifications to the OPFS adapter
- Listen for `storage` events on the localStorage mirror as a cross-tab signal
- On incoming signal: mark in-memory state stale, reload on next read
- No leader election needed — just prevent silent data loss

**Phase 5: Migrate remaining direct localStorage calls**
- `restore-points.ts` — currently uses localStorage directly (not via `createLocalStorage`). Wire through StorageService.
- `useWelcomeBack.ts` / `useDriveSync.ts` flags — leave on localStorage (transient, low-value)
