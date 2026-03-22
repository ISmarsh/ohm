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

### Multi-Tab Usage
OPFS (via `createSyncAccessHandle`) locks files to one tab. The app doesn't currently handle multi-tab — localStorage's lack of locking hasn't been a problem because the app is single-tab by nature (PWA). For OPFS:
- Use the **async** OPFS API (`FileSystemFileHandle.getFile()` / `createWritable()`), NOT `createSyncAccessHandle` (which requires a worker and locks)
- Or use a `BroadcastChannel` leader-election if sync handles are needed later

### Token Storage
`ohm-drive-*` keys are managed internally by `.toolbox/lib/google-drive-sync`. These should **NOT** be migrated to OPFS — they're small, infrequently written, and the toolbox module owns them. Leave as localStorage.

---

## Proposal

### Location

```
src/utils/storage-service.ts    ← Interface + factory
src/utils/opfs-adapter.ts       ← OPFS backend
src/utils/localstorage-adapter.ts ← localStorage backend (fallback + sync cache)
src/test/__stubs__/storage-service.ts ← Test stub
```

This follows the existing pattern: utils export factory functions, no classes needed for the public API.

### Interface

```ts
/** Async key-value storage with typed values */
export interface StorageService {
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
  /** Called on read to validate/migrate data */
  sanitize?: <T>(key: string, raw: unknown) => T;
}

/** Create a StorageService with OPFS primary, localStorage fallback */
export function createStorageService(opts?: StorageServiceOptions): StorageService;
```

**Design decisions:**
- **All async** — OPFS requires it, localStorage can trivially be wrapped in `Promise.resolve()`
- **Untyped keys with generic methods** — callers provide the type at call site, matching the flexibility of `localStorage.getItem`/`setItem`
- **Prefix option** — namespaces keys for multi-app toolbox extraction
- **No per-key config** — sanitization/defaults belong in the calling layer (e.g., `storage.ts` keeps `sanitizeBoard`)

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
3. The `ohm-drive-synced` flag moves to `storageService.get/set('drive-synced')` — tiny value, no urgency
4. Token keys (`ohm-drive-*`) stay in localStorage — owned by toolbox module, out of scope

### Migration Path

**Phase 1: Introduce StorageService (no behavior change)**
- Create `storage-service.ts` with the interface
- Create `localstorage-adapter.ts` that wraps current localStorage calls
- Create test stub
- Wire `storage.ts` to use StorageService internally — same localStorage backend, just indirected
- All existing tests pass unchanged

**Phase 2: Add OPFS adapter**
- Create `opfs-adapter.ts` implementing StorageService
- Feature-detect OPFS availability (`navigator.storage.getDirectory`)
- `createStorageService()` returns OPFS adapter when available, localStorage adapter as fallback
- Add `getSync()` for bootstrap reads (reads localStorage mirror)

**Phase 3: Migrate consumers one-by-one**
- `storage.ts` (ohm-board) — highest value, migrate first
- `restore-points.ts` — second, largest payload benefits most from OPFS
- `useWelcomeBack.ts` (ohm-last-opened) — trivial
- `useDriveSync.ts` (ohm-drive-synced) — trivial
- Each migration is a small, independently testable PR

**Phase 4: Toolbox extraction**
- Move `storage-service.ts` + adapters to `.toolbox/lib/storage-service`
- Update import paths in `src/utils/storage.ts` to `../../.toolbox/lib/storage-service`
- Add vitest alias → `src/test/__stubs__/storage-service.ts`
- Other toolbox consumers (companion apps) can import the same module

### Toolbox Extraction Extension Point

The interface is already designed for extraction:
- **No OHM-specific types** in the StorageService interface (generic `<T>`)
- **Prefix option** handles namespacing per-app
- **Sanitize callback** lets each app define its own validation
- **Adapter pattern** means the toolbox ships the interface + adapters; apps just call `createStorageService()`
- **Same stub pattern** as existing toolbox modules — vitest alias to a test stub that uses an in-memory Map

Future toolbox structure:
```
.toolbox/lib/
  local-storage-sync.ts      ← existing
  google-drive-sync.ts        ← existing
  storage-service/
    index.ts                  ← createStorageService factory
    opfs-adapter.ts
    localstorage-adapter.ts
    types.ts                  ← StorageService interface
```
