# Repository Structure

```
koral/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── web/                 # SvelteKit web app
│   ├── desktop/             # Tauri desktop wrapper
│   └── mobile/              # Capacitor/Cordova mobile wrapper
├── packages/
│   ├── ui/                  # Shared component library
│   ├── db/                  # Dexie/SQLite schema + migrations
│   ├── sync/                # OneDrive sync engine
│   ├── ai/                  # Ollama/embedding/local AI utilities
│   └── cli/                 # CLI tooling for import/export/maintenance
├── docs/
│   ├── brand/
│   ├── spec/
│   ├── marketing/
│   └── developer/
├── scripts/
├── tests/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```
