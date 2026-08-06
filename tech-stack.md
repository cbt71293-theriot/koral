# Tech Stack — Koral

> **Stack direction (target):** Svelte 5 · TypeScript · Tailwind v4 · Dexie/SQLite · OneDrive plain-file sync · Ollama optional local AI

Koral is a local-first, privacy-first note-taking and knowledge organization app. Every tech choice prioritizes offline capability, small bundle size, and zero mandatory cloud dependencies.

---

## 1. Core Stack

| Layer | Choice | Version | Rationale |
|---|---|---|---|
| **UI Framework** | **Svelte 5** | 5.x | Runes-based reactivity eliminates boilerplate; compile-time optimizations yield the smallest runtime among major frameworks. Built-in `use` and `$derived` make OCR/scan state management trivial. |
| **Language** | **TypeScript** | 5.8+ (strict) | Ingredient parsing, additive matching, and rule evaluation need discriminated unions and branded types. Strict null checks prevent silent `undefined` in scan pipelines. |
| **Styling** | **Tailwind CSS v4** | 4.x | CSS-first config via `@theme`, native container queries, and zero runtime JS. Works seamlessly with Svelte's scoped styles. |
| **Local Database** | **Dexie.js** | 4.x | Promise-based, typed wrapper over IndexedDB. Live queries (`useLiveQuery`) keep scan history, pantry, and additive lists in sync without manual subscription management. |
| **Sync / Storage** | **OneDrive plain-file sync** | — | JSON delta files stored in the OneDrive folder. No database server, no auth tokens, no vendor lock-in. Works on Windows, macOS, and mobile via OneDrive app. |
| **Local AI (optional)** | **Ollama** | 0.6+ | Runs `llama3.2` or `phi3` locally for ingredient normalization and rule explanation. Fully opt-in; app works 100% offline without it. |
| **Bundler** | **Vite** | 6.x | Native Svelte 5 plugin, instant HMR, esbuild-powered production builds. |
| **CLI / Tooling** | **Node.js + TSX** | — | `tsx` powers the dev server and CLI commands (`pnpm cli ...`). |
| **Testing** | **Vitest + Playwright** | — | Vitest for unit/store tests; Playwright for camera/mock stream E2E. |
| **CI/CD** | **GitHub Actions** | — | Lint → typecheck → test → build → deploy. |
| **PWA** | **Vite PWA Plugin** | — | Service worker for offline shell caching; manifest for install prompt. |

---

## 2. Key Libraries

| Category | Library | Purpose |
|---|---|---|
| **UI Primitives** | `bits-ui` or `shadcn-svelte` | Accessible dialogs, bottom sheets, tabs, and form controls. |
| **Icons** | `lucide-svelte` | Tree-shakeable icons for scanner, pantry, alerts. |
| **Charts** | `recharts` (or Svelte-native alternative) | Nutrition breakdown, scan frequency, additive load trends. |
| **OCR** | `tesseract.js` v5 | WASM-based OCR fallback when barcode lookup misses. Runs in Web Worker. |
| **Barcode** | `html5-qrcode` | Camera stream + EAN/UPC/QR decoding. |
| **PDF / Export** | `pdf-lib` or `jspdf` | Generate pantry reports or additive disclosure PDFs. |
| **Date / Time** | `date-fns` | Lightweight date formatting for expiry alerts and scan history. |
| **Validation** | `zod` | Schema validation for API responses and OneDrive sync payloads. |
| **AI / Embeddings** | `ollama` (JS client) | Local inference for ingredient normalization and smart suggestions. |
| **CLI Framework** | `commander` or `cac` | Koral CLI (`koral dev`, `koral sync`, `koral db:seed`). |
| **MCP** | `@modelcontextprotocol/sdk` | MCP server for AI-assistant integration (scan history queries, additive lookups). |

---

## 3. Why These Choices

### Svelte 5 over React
- Current codebase is React, but Svelte 5's runes model maps directly to scan-to-score reactive graphs.
- Smaller production bundle (~15 KB gzipped vs ~40 KB for React + ReactDOM).
- Built-in `<svelte:boundary>` for graceful OCR/barcode error states.

### Dexie over SQLite (wa-sqlite)
- IndexedDB is available in every modern browser and Electron without native compilation.
- Dexie's `useLiveQuery` works inside Svelte components with zero extra wiring.
- `wa-sqlite` is heavier and requires WASM initialization on first load.

### OneDrive over Supabase / Custom Backend
- Zero backend cost.
- Plain JSON files are human-readable and git-friendly.
- OneDrive's conflict resolution (per-file CRDT-like merges) handles most sync edge cases.
- User already has OneDrive on Windows.

### Ollama over Cloud LLMs
- No API keys, no egress, no telemetry.
- Works on consumer hardware (Apple Silicon, modern Intel/AMD).
- App remains fully functional when Ollama is uninstalled or unreachable.

---

## 4. Constraints & Boundaries

| Constraint | Rule |
|---|---|
| **No mandatory network** | Core flows (scan, parse, score, pantry, history) must work 100% offline. |
| **No telemetry** | Zero analytics SDKs. Optional usage metrics must be local-only and opt-in. |
| **File size** | Initial JS bundle < 200 KB gzipped. |
| **Cold start** | App shell renders < 1.5 s on mid-range Android. |
| **Sync privacy** | OneDrive sync never transmits additive or health data to third parties. |

---

## 5. CLI & MCP Integration Notes

### CLI (`pnpm cli`)

The Koral CLI is built with `commander` and lives in `src/cli/`.

```bash
# Development
pnpm cli dev                # Start Vite dev server on :5173
pnpm cli dev --port 3000    # Custom port

# Database
pnpm cli db:seed            # Seed additive/additive reference tables
pnpm cli db:export          # Export local DB to JSON
pnpm cli db:import <file>   # Import JSON backup into Dexie
pnpm cli db:reset           # Wipe local DB (requires --force)

# Sync
pnpm cli sync:push          # Push local JSON deltas to OneDrive folder
pnpm cli sync:pull          # Pull OneDrive changes into local DB
pnpm cli sync:status        # Show sync state and pending changes

# AI
pnpm cli ai:model list      # List locally available Ollama models
pnpm cli ai:model pull <m>  # Pull an Ollama model
pnpm cli ai:test            # Run a local ingredient normalization test

# Misc
pnpm cli doctor             # Validate environment (OneDrive path, Ollama, IndexedDB)
```

CLI commands are implemented as SvelteKit server actions under `src/routes/api/cli/` and as standalone scripts in `src/cli/`.

### MCP (Model Context Protocol)

Koral exposes an MCP server so AI assistants can query local note data without cloud APIs.

**Transport:** stdio (local) + optional SSE for remote debug.

**Tools exposed:**

| Tool | Description | Input | Output |
|---|---|---|---|
| `koral.scan_history` | Get recent scan events | `limit?: number` | `ScanEvent[]` |
| `koral.product_lookup` | Look up product by barcode | `barcode: string` | `Product` |
| `koral.additive_info` | Get additive reference data | `code: string` | `AdditiveReference` |
| `koral.pantry_status` | Current pantry items and expiry alerts | — | `PantryItem[]` |
| `koral.rule_evaluate` | Evaluate custom rules against a product | `productId: string` | `RuleViolation[]` |
| `koral.ai_normalize` | Normalize an ingredient string (requires Ollama) | `text: string` | `string[]` |

**Configuration:**

```yaml
# .mcp.json (Hermes / Claude Desktop)
{
  "koral": {
    "command": "node",
    "args": ["dist/mcp-server.cjs"],
    "env": {
      "KORAL_DB_PATH": "C:/Users/cbt71/OneDrive/Documents/Hermes Projects/Koral/data",
      "KORAL_OLLAMA_URL": "http://localhost:11434"
    }
  }
}
```

**Security model:**
- MCP server only reads from local Dexie/JSON files.
- No mutation tools are exposed by default (write tools require `--allow-write` flag).
- All tool calls are logged to `logs/mcp-audit.log`.

---

## 6. Versioning Policy

- **Svelte major:** Track 5.x minor releases. Test against latest `@sveltejs/kit` canary in CI.
- **Tailwind major:** v4 is CSS-first; migration from v3 is one-time.
- **Dexie major:** 4.x stable. Watch for v5 breaking changes to live query API.
- **OneDrive sync format:** JSON schema is versioned in `data/sync-schema.json`. Never delete fields; deprecate with `deprecated: true`.
