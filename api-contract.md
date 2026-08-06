# API Contract

## REST Endpoints
- `GET /api/notes` — list notes
- `POST /api/notes` — create note
- `GET /api/notes/:id` — read note
- `PATCH /api/notes/:id` — update note
- `DELETE /api/notes/:id` — delete note
- `GET /api/search` — full-text + semantic search
- `POST /api/sync/status` — sync state
- `POST /api/ai/query` — local/cloud AI query

## Webhooks
- `POST /webhooks/ollama` — local model events

## Rate Limits
- Anonymous: 60 req/min
- Authenticated: 300 req/min

## Error Schema
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```
