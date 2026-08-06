# Koral Design System

This document defines the visual language for Koral. It covers theme mechanics, color usage, typography, spacing, and component guidance so the UI stays consistent across mobile and desktop.

## 1. Theme model

Three themes are supported:

- **System** — follows `prefers-color-scheme: dark` when available. This is the default.
- **Light** — fixed light palette regardless of OS preference.
- **Dark** — fixed dark palette regardless of OS preference.

Persist the user’s explicit choice in `localStorage.theme`. When the value is `system`, do not set a data attribute and let CSS media queries drive colors.

## 2. Color system

Design tokens are defined as CSS custom properties and mapped to each theme. Use these semantic names in components instead of literal values.

### 2.1 Token map

| Token | Light default | Dark default | Usage |
|---|---|---|---|
| `--bg` | `#f7f7f9` | `#0b0d14` | Page background |
| `--panel` | `#ffffff` | `#14161c` | Card, modal, sheet surfaces |
| `--text` | `#14161c` | `#f3f4f6` | Primary body text |
| `--muted` | `#6b7280` | `#9ca3af` | Secondary text, captions |
| `--border` | `#e6e6ea` | `#1f2330` | Dividers and input borders |
| `--primary` | `#4f46e5` | `#818cf8` | Links, active states, key actions |
| `--primary-foreground` | `#ffffff` | `#0b0d14` | Text on primary fills |
| `--accent` | `#eef2ff` | `#1c1f2b` | Subtle fills and hover backgrounds |
| `--shadow` | `0 8px 24px rgba(15, 15, 25, 0.08)` | `0 8px 24px rgba(0, 0, 0, 0.4)` | Standard elevation |

### 2.2 Contrast rules

- Body text must meet or exceed **WCAG AA** against `--bg` and `--panel`.
- Interactive controls must have visible focus indicators: use a ring derived from `color-mix(in oklab, var(--primary) 25%, transparent)` with a 4px spread.
- Do not rely on color alone to convey meaning; pair with labels, shapes, or icons.

## 3. Typography

- Base size: `16px`.
- Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`.
- Weights:
  - Body: `400`
  - UI labels and nav items: `600`
  - Headings and brand mark: `800`
- Line height: `1.5` for body text; tighten to `1.25` for large headings.
- Tracking: use `-0.02em` for large headings only.

## 4. Spacing and layout

- Page padding: `24px` on desktop, `16px` on mobile.
- Component padding: `12px` compact, `16px` default, `20px` roomy.
- Card corner radius: `16px`.
- Button corner radius: `12px`.
- Pill elements: `999px` radius.
- Responsive breakpoint: `720px`. Below this width, multi-column grids collapse to one column.

## 5. Components

### 5.1 Cards

- Background: `--panel`
- Border: `1px solid var(--border)`
- Shadow: `--shadow`
- Padding: `20px` default

Use cards to group related information: metrics, article previews, settings groups, and profile rows.

### 5.2 Buttons

- **Primary**: filled `--primary` with `--primary-foreground` text. Use for the main action in a group.
- **Secondary**: transparent background, `--border` stroke, `--text` text. Use for secondary or destructive alternatives.
- Minimum touch target: `40px` height.

### 5.3 Inputs

- Border: `1px solid var(--border)`
- Padding: `12px 14px`
- Focus: `box-shadow` ring using the primary color with `25%` opacity and `border-color: var(--primary)`

### 5.4 Navigation

- Use a horizontal scroller for primary nav items on mobile.
- Active state: `background: var(--accent)` with `font-weight: 700`.
- Inactive state: `color: var(--muted)`.

### 5.5 Tabs

- Present tabs as a segmented control with a bottom border indicator.
- Active tab: `border-bottom: 2px solid var(--primary)` and `color: var(--text)`.
- Inactive tabs: `color: var(--muted)`.
- Set `role="tablist"` and `aria-selected` for accessibility.

## 6. Motion and elevation

- Keep motion subtle: fades, gentle translation, and background blur for sticky headers.
- Use `backdrop-filter: blur(12px) saturate(1.2)` on overlays and top bars.
- Elevate modals, drawers, and sheets with `--shadow`.

## 7. Assets and icons

- Prefer inline SVG icons for crisp rendering at any scale.
- Keep icons in a single SVG sprite sheet when possible; load it once and reference icons by `id`.
- Glyphs should be monoweight, 24x24 viewBox, with `stroke-linecap="round"` and `stroke-linejoin="round"`.
- Maintain a padding buffer inside each glyph so the stroke never touches the viewport edge.

## 8. Accessibility checklist

- All interactive elements are focusable and have visible focus styles.
- Color pairs meet contrast requirements.
- Inputs have associated labels or `aria-label`.
- Decorative images use `aria-hidden="true"`.
- Layout does not require horizontal scrolling except for the primary nav scroller.
