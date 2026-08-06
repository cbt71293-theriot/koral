# Product Specification — Koral

**Version:** 1.0.0
**Date:** 2026-08-05
**Owner:** Product Team
**Status:** Draft — Awaiting Review

---

## 1. Problem Statement

Modern note-taking apps force users to choose between power and simplicity, privacy and sync, or capture speed and long-term organization. Recurring gaps include fragmented workflows, sync/offline trade-offs, proprietary lock-in, AI overhead, cluttered UIs, and accessibility/localization gaps.

**Core problem:** There is no cross-platform, local-first, privacy-respecting note app that combines fast capture, structured linking, seamless sync, and inclusive design without forcing users into complex setups or expensive subscriptions.

---

## 2. Target Users

### Primary Segments

| Segment | Profile | Core Need |
|---|---|---|
| Knowledge Workers | Professionals, researchers, analysts | Fast capture + structured linking + reliable sync + search |
| Students & Academics | University students, PhD candidates | Lecture capture, citation linking, offline access, affordability |
| Developers / Technical Users | Engineers, devs, IT admins | Markdown-first, local files, API access, plain-text portability |
| Privacy-Conscious Individuals | Journalers, activists, enterprise users | End-to-end encrypted sync, local-first, zero-knowledge architecture |
| Accessibility-First Users | Users relying on screen readers, keyboard nav, high-contrast | WCAG 2.2 AA+, semantic UI, screen-reader testing, RTL/i18n support |

### Secondary Segments

- Small teams needing shared notes without full project-management bloat.
- Creators/writers who want minimal UI, Markdown, and export options.

---

## 3. Value Proposition

> Think clearly. Capture freely. Own your data forever.

### Key Differentiators

| Pillar | Promise |
|---|---|
| Local-first | Notes are stored locally first; sync is an optional, end-to-end encrypted layer. The app works offline by default. |
| Capture speed | Global shortcut / widget opens a note in <200ms, regardless of app state. No loaders, no blank canvases. |
| Structured linking | Bi-directional links, tags, and backlinks work out of the box—no plugins, no vault setup. |
| Portable data | Notes are plain Markdown + YAML frontmatter. One-folder export to any app or git repo. |
| Inclusive by default | WCAG 2.2 AA accessibility, full keyboard navigation, RTL layouts, and 20+ launch languages. |
| Fair pricing | Core features free forever. Sync and advanced AI assist are low-cost subscriptions with student/nonprofit discounts. |

---

## 4. Feature Matrix

| Capability | v1 | v2 | v3 | Rationale |
|---|---|---|---|---|
| Markdown notes | ✅ | ✅ | ✅ | Core portable format |
| Bi-directional links | ✅ | ✅ | ✅ | Table-stakes for PKM |
| Offline-first | ✅ | ✅ | ✅ | Privacy and reliability |
| OneDrive plain-file sync | ✅ | ✅ | ✅ | No cloud lock-in |
| Semantic local search | ✅ | ✅ | ✅ | Retrieval without cloud AI |
| Kanban / calendar / timeline views | — | ✅ | ✅ | Structured task + project views |
| Local AI assistant | — | ✅ | ✅ | Optional Ollama integration |
| Real-time collaboration | — | — | ✅ | Shared vaults with merge |
| MCP server integration | — | — | ✅ | Agent-ready workflows |

---

## 5. User Stories

- Capture: quick note, markdown toggle, templates, global shortcut
- Organize: folders, tags, smart filters, favorites
- Connect: backlinks, graph view, MOC suggestions
- Sync & Share: OneDrive sync, export, read-only share link
- Privacy & Portability: E2EE optional, plain-file export, git history
- Accessibility & Localization: screen-reader labels, keyboard nav, RTL, 20+ languages
- AI Assist: local Q&A, summarization, auto-tagging

---

## 6. Success Metrics

- Acquisition: 5k MAU within 6 months
- Engagement: >3 notes created per user per week
- Quality/trust: NPS ≥50, app rating ≥4.7
- Accessibility: 100% WCAG 2.2 AA coverage on core flows
- Business: conversion ≥4.5%, churn ≤6%

---

## 7. Roadmap

### v1 — Foundation
- Core editor with Markdown
- Links, tags, backlinks
- Offline-first storage
- OneDrive sync
- Theme system: system/light/dark

### v2 — Intelligence
- Semantic local search
- Kanban/calendar/timeline views
- Local AI assistant via Ollama
- Advanced import/export

### v3 — Collaboration
- Shared vaults
- Real-time co-editing
- MCP server for agents
- CLI for power users

---

## 8. Accessibility & Localization

- WCAG 2.2 AA on core flows
- Full keyboard navigation
- RTL layout support
- 20+ launch languages
- CJK IME support
- ICU formatting for dates/numbers
