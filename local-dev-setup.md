# Local Development Setup

## Prerequisites
- Node.js 18+
- pnpm 8+
- SQLite/Dexie-compatible browser or Node environment
- Ollama (optional, for local AI features)

## Setup
```bash
git clone git@github.com:cbt71293-theriot/koral.git
cd koral
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env
```

## Run
```bash
pnpm dev
```

## Tests
```bash
pnpm test
```

## Lint/Format
```bash
pnpm lint
pnpm format
```

## Ollama setup
```bash
ollama pull koral-embed:latest
ollama serve
```
