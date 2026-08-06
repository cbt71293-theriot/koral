# Data Model

## Notes
- `id: uuid`
- `title: string`
- `body: string`
- `mimeType: string`
- `tags: string[]`
- `parentId: uuid | null`
- `createdAt: timestamp`
- `updatedAt: timestamp`
- `deletedAt: timestamp | null`
- `meta: json`

## Attachments
- `id: uuid`
- `noteId: uuid`
- `blobKey: string`
- `sizeBytes: int`
- `sha256: string`
- `mimeType: string`

## Links
- `id: uuid`
- `sourceNoteId: uuid`
- `targetNoteId: uuid`
- `type: backlink | embed | reference`

## Objects
- `id: uuid`
- `type: person | company | project | event | topic`
- `name: string`
- `properties: json`
