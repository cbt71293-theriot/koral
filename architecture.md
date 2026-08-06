# Architecture — Koral

Koral uses a **local-first, layered architecture** where every feature is designed to work without cloud connectivity. The optional OneDrive sync and Ollama AI layers are sidecars, not dependencies.

---

## 1. High-Level Layers

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" fill="none" stroke="currentColor" stroke-width="1.5">
  <defs>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="currentColor"/>
    </marker>
  </defs>

  <!-- Presentation Layer -->
  <rect x="20" y="20" width="760" height="90" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="50" fill="#f8fafc" font-size="14" font-weight="600">Presentation Layer — Svelte 5 Components</text>
  <text x="40" y="75" fill="#94a3b8" font-size="12">NoteList · Editor · GraphView · SearchPanel · TagChip · AttachmentPreview</text>

  <!-- State / Logic Layer -->
  <rect x="20" y="140" width="760" height="90" rx="8" fill="#1e3a5f" stroke="#334155"/>
  <text x="40" y="170" fill="#f8fafc" font-size="14" font-weight="600">State & Logic Layer — Runes + Stores</text>
  <text x="40" y="195" fill="#94a3b8" font-size="12">noteStore · graphStore · searchStore · tagEngine · aiAssistant · syncManager</text>

  <!-- Data Layer -->
  <rect x="20" y="260" width="760" height="90" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="290" fill="#f8fafc" font-size="14" font-weight="600">Data Layer — Dexie + OneDrive Files</text>
  <text x="40" y="315" fill="#94a3b8" font-size="12">notes · attachments · links · tags · objects · sync_deltas/</text>

  <!-- External Layer -->
  <rect x="20" y="380" width="760" height="90" rx="8" fill="#1e1e1e" stroke="#334155"/>
  <text x="40" y="410" fill="#f8fafc" font-size="14" font-weight="600">External Layer (Optional)</text>
  <text x="40" y="435" fill="#94a3b8" font-size="12">Ollama (local AI) · OneDrive Sync · Web Clipper · OCR worker</text>

  <!-- Arrows -->
  <line x1="400" y1="110" x2="400" y2="140" stroke="#64748b" stroke-width="2" marker-end="url(#arr)"/>
  <line x1="400" y1="230" x2="400" y2="260" stroke="#64748b" stroke-width="2" marker-end="url(#arr)"/>
  <line x1="400" y1="350" x2="400" y2="380" stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" marker-end="url(#arr)"/>

  <!-- Sidecar arrows -->
  <line x1="680" y1="350" x2="680" y2="380" stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" marker-end="url(#arr)"/>
  <text x="690" y="370" fill="#64748b" font-size="11">optional</text>
</svg>
```

### Layer responsibilities

| Layer | Responsibility | Sync behavior |
|---|---|---|
| **Presentation** | Render notes, editor, graph, search, attachments, tags, and settings. Handle input, shortcuts, and view transitions. | Stateless UI; reads from stores. |
| **State & Logic** | Reactive state via Svelte 5 runes (`$state`, `$derived`, `$effect`). Link interpreter, graph builder, AI assistant wrapper. | In-memory mirrors Dexie live queries. |
| **Data Layer** | Dexie schema, migrations, CRUD operations. OneDrive sync engine (JSON delta reads/writes). | Source of truth. Sync is eventual consistency. |
| **External (optional)** | Ollama HTTP client, camera/barcode plugins, OCR worker, OneDrive file watcher. | Degraded gracefully if unavailable. |

---

## 2. Reactive Data Flow

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 340" fill="none" stroke="currentColor" stroke-width="1.5">
  <defs>
    <marker id="a2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="currentColor"/>
    </marker>
  </defs>

  <!-- Nodes -->
  <rect x="10" y="10" width="160" height="60" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="90" y="40" fill="#f8fafc" font-size="12" text-anchor="middle" font-weight="600">Camera / Barcode</text>
  <text x="90" y="55" fill="#94a3b8" font-size="10" text-anchor="middle">Input</text>

  <rect x="220" y="10" width="160" height="60" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="300" y="40" fill="#f8fafc" font-size="12" text-anchor="middle" font-weight="600">Dexie products</text>
  <text x="300" y="55" fill="#94a3b8" font-size="10" text-anchor="middle">Local DB lookup</text>

  <rect x="430" y="10" width="160" height="60" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="510" y="40" fill="#f8fafc" font-size="12" text-anchor="middle" font-weight="600">OCR / Parse</text>
  <text x="510" y="55" fill="#94a3b8" font-size="10" text-anchor="middle">Tesseract + normalizer</text>

  <rect x="640" y="10" width="110" height="60" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="695" y="40" fill="#f8fafc" font-size="12" text-anchor="middle" font-weight="600">AI Assist</text>
  <text x="695" y="55" fill="#94a3b8" font-size="10" text-anchor="middle">Ollama (opt-in)</text>

  <rect x="300" y="140" width="160" height="60" rx="6" fill="#1e3a5f" stroke="#334155"/>
  <text x="380" y="170" fill="#f8fafc" font-size="12" text-anchor="middle" font-weight="600">Rule Engine</text>
  <text x="380" y="185" fill="#94a3b8" font-size="10" text-anchor="middle">Profiles + custom rules</text>

  <rect x="10" y="260" width="220" height="60" rx="6" fill="#064e3b" stroke="#334155"/>
  <text x="120" y="290" fill="#f8fafc" font-size="12" text-anchor="middle" font-weight="600">Score Badge</text>
  <text x="120" y="305" fill="#94a3b8" font-size="10" text-anchor="middle">A/B/C/D/F grade + additive hits</text>

  <rect x="270" y="260" width="220" height="60" rx="6" fill="#064e3b" stroke="#334155"/>
  <text x="380" y="290" fill="#f8fafc" font-size="12" text-anchor="middle" font-weight="600">Pantry / History</text>
  <text x="380" y="305" fill="#94a3b8" font-size="10" text-anchor="middle">Persistent local records</text>

  <rect x="530" y="260" width="220" height="60" rx="6" fill="#064e3b" stroke="#334155"/>
  <text x="640" y="290" fill="#f8fafc" font-size="12" text-anchor="middle" font-weight="600">OneDrive Sync</text>
  <text x="640" y="305" fill="#94a3b8" font-size="10" text-anchor="middle">JSON delta push / pull</text>

  <!-- Arrows -->
  <line x1="90" y1="70" x2="90" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="90" y1="110" x2="300" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="300" y1="110" x2="510" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="510" y1="110" x2="695" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="510" y1="70" x2="380" y2="140" stroke="#64748b" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="300" y1="70" x2="300" y2="200" stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" marker-end="url(#a2)"/>
  <line x1="380" y1="200" x2="120" y2="260" stroke="#64748b" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="380" y1="200" x2="380" y2="260" stroke="#64748b" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="380" y1="200" x2="640" y2="260" stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" marker-end="url(#a2)"/>
</svg>
```

### Flow description

1. **Input:** Camera captures frame → barcode decoder returns EAN/UPC → Dexie product lookup.
2. **Cache hit:** Product found → load cached additives + ingredients → jump to scoring.
3. **Cache miss:** Fall back to OCR (Tesseract WASM worker) → parse ingredients → normalize.
4. **AI assist (optional):** Send raw ingredient string to Ollama for synonym expansion and low-confidence guess resolution.
5. **Scoring:** Run additive reference match + dietary profile filter + custom rule interpreter.
6. **Persistence:** Save scan event and product to Dexie. If sync is enabled, append delta to OneDrive queue.
7. **Render:** Traffic-light badge, additive breakdown, rule violations, pantry status.

---

## 3. Component Architecture

```
src/
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Dexie table definitions + migrations
│   │   ├── products.ts        # Product CRUD + live query hooks
│   │   ├── additives.ts       # Additive reference CRUD
│   │   ├── pantry.ts          # Pantry + expiry logic
│   │   ├── scan-events.ts     # Scan audit log
│   │   └── rules.ts           # Custom rule CRUD
│   ├── engine/
│   │   ├── score.ts           # Traffic-light scoring algorithm
│   │   ├── parser.ts          # Ingredient string normalization
│   │   ├── rules.ts           # Rule interpreter
│   │   └── ai.ts              # Ollama client wrapper
│   ├── sync/
│   │   ├── onedrive.ts        # OneDrive file read/write + conflict merge
│   │   └── delta.ts           # JSON delta encoding/decoding
│   ├── scanner/
│   │   ├── barcode.ts         # html5-qrcode wrapper
│   │   ├── ocr.ts             # Tesseract worker wrapper
│   │   └── camera.ts          # Permission + stream management
│   └── stores/
│       ├── app.ts             # Global app state (online, ollama, sync)
│       ├── scanner.ts         # Scanner reactive state
│       └── settings.ts        # User preferences (profiles, defaults)
├── routes/
│   ├── +layout.svelte         # Shell, nav, online/offline banner
│   ├── +page.svelte           # Scanner home
│   ├── pantry/
│   ├── history/
│   ├── rules/
│   ├── settings/
│   └── api/
│       ├── cli/               # CLI command handlers
│       └── mcp/               # MCP tool handlers
└── mcp-server/
    └── index.ts               # MCP stdio server entry
```

---

## 4. Design Patterns

| Pattern | Usage | Example |
|---|---|---|
| **Repository** | `src/lib/db/*.ts` abstracts Dexie from UI. | `productRepo.getByBarcode(code)` |
| **Live Query Hook** | `useLiveQuery` from Dexie bound to Svelte runes. | `const products = useLiveQuery(() => db.products.toArray())` |
| **Strategy** | Scoring algorithm swappable by user profile. | `scoreEngine.strategy = 'additiveLoad'` |
| **Observer (sync)** | OneDrive file watcher + Dexie change observer produce deltas. | `syncManager.on('change', pushDelta)` |
| **Facade (CLI/MCP)** | Single entry point exposes multiple tool surfaces. | `cli.note.create()` → same as MCP `koral.note_create` |
| **Circuit Breaker** | Ollama client wraps calls with `TRY_AI` flag; falls back to heuristic parser on timeout/error. | `ai.normalize(text) ?? heuristic(text)` |

---

## 5. Security & Privacy Model

- **All PII stays local:** scan history, pantry, dietary profiles are never sent to cloud by default.
- **OneDrive sync is file-level:** only JSON deltas written to a user-chosen folder. No metadata leaks.
- **Ollama is local-only:** inference happens on `localhost:11434`. The app detects if Ollama is running and disables AI features otherwise.
- **MCP audit log:** every tool call is logged with timestamp, caller PID, and arguments (no secrets).
- **Dependencies audited in CI:** `pnpm audit` + `osv-scanner` on every PR.
