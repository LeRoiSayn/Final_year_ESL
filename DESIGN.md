# Design System — ESL (École de Santé de Libreville)

## Product Context

- **What:** Multi-role university management system
- **Who:** Students, teachers, admin staff, registrars, finance officers at a health school
- **Space:** EdTech / institutional academic administration
- **Industry:** Higher education, healthcare, Francophone Central Africa
- **Type:** Data-dense web app — APP UI rules apply throughout
- **Language:** French primary, English secondary (all copy, UI labels, and data)

---

## Aesthetic Direction

- **Direction:** Refined Institutional
- **Decoration level:** Intentional (subtle depth on dark surfaces; no decorative blobs, no gradient fills on backgrounds)
- **Mood:** Authoritative but approachable. Clear hierarchy. Fast scanning. Trustworthy at a glance. The product serves real administrative work — it should feel competent, not playful, but never cold.
- **NOT:** Generic SaaS dashboard, cold enterprise software, purple-gradient startup template

---

## Typography

- **Display / Headings (h1–h3, page titles, login hero):** `Outfit` (weights 600, 700, 800)
  - Rationale: Geometric but warm. Feels institutional without being bureaucratic. The round forms pair well with ESL green.
- **Body / UI Labels (paragraphs, form labels, buttons, nav):** `Plus Jakarta Sans` (weights 400, 500, 600)
  - Rationale: More distinctive than Inter while equally legible. Strong bilingual support. Performs well at 14px in data tables.
- **Data / Tables (numbers, IDs, statistics):** `Plus Jakarta Sans` with `font-variant-numeric: tabular-nums`
- **Code / Monospace (quiz timers, code blocks, student IDs):** `Fira Code` (weights 400, 500)
- **CDN:** Google Fonts via `<link>` in `index.html` (preconnect already configured)
- **Scale:**

| Level | Size | Usage |
|-------|------|-------|
| xs    | 12px | Captions, timestamps, tertiary labels |
| sm    | 14px | Table cells, secondary UI, badges |
| base  | 16px | Body text, form inputs, descriptions |
| lg    | 18px | Subheadings, card titles |
| xl    | 20px | Section headings |
| 2xl   | 24px | Page headings (h2) |
| 3xl   | 30px | Major page titles (h1) |
| 4xl   | 36px | Dashboard hero numbers |
| 5xl   | 48px | Login page hero |

- **Line height:** 1.5× body text, 1.2× headings
- **Heading weight:** 700 for h1/h2, 600 for h3/h4
- **Min body size:** 16px (never below on any interactive surface)
- **Tabular numbers:** required on any column displaying numbers, dates, or IDs

---

## Color

- **Approach:** Restrained — ESL green carries all brand weight; color is rare and meaningful elsewhere

### Primary (ESL Green)

| Token       | Hex       | Usage |
|-------------|-----------|-------|
| primary-50  | `#eef9f4` | Tinted backgrounds, selected row highlight |
| primary-100 | `#d6f2e3` | Light badges, active sidebar state bg |
| primary-200 | `#aee5ca` | Progress bars, chart fills |
| primary-300 | `#79d1ab` | Secondary accents |
| primary-400 | `#46b889` | Button hover state |
| **primary-500** | **`#269c6d`** | **Brand anchor. Primary buttons, links, active nav.** |
| primary-600 | `#1a7d57` | Button active/pressed |
| primary-700 | `#166448` | Dark mode: text on green backgrounds |
| primary-800 | `#14503a` | Deep accents |
| primary-900 | `#124231` | Deep dark accents |
| primary-950 | `#0a281f` | Extreme dark |

### Dark Surfaces (UI Shell)

| Token    | Hex       | Usage |
|----------|-----------|-------|
| dark-100 | `#1e293b` | Cards, modals, elevated surfaces |
| dark-200 | `#1a2234` | Sidebar, secondary surfaces |
| dark-300 | `#151c2c` | Navigation shell, dropdowns |
| dark-400 | `#111827` | Base page background |

### Semantic Colors

| Purpose | Hex       | Tailwind |
|---------|-----------|---------|
| Success | `#22c55e` | green-500 |
| Warning | `#f59e0b` | amber-500 |
| Error   | `#ef4444` | red-500 |
| Info    | `#3b82f6` | blue-500 |

Semantic backgrounds in dark mode: use 20% opacity on dark-300 surface (e.g. `bg-green-900/20`).

### Text

| Context | Light mode | Dark mode |
|---------|-----------|-----------|
| Primary text | `gray-900` `#111827` | `gray-100` `#f3f4f6` |
| Secondary / muted | `gray-500` `#6b7280` | `gray-400` `#9ca3af` |
| Disabled | `gray-400` `#9ca3af` | `gray-600` `#4b5563` |
| On primary-500 bg | white `#ffffff` | white `#ffffff` |

### Dark Mode Rules

- Surfaces use `dark-100` → `dark-400` elevation hierarchy (higher elevation = lighter surface)
- Primary accent (`#269c6d`) used as-is in dark mode — saturation remains; it reads well on dark navy
- Never use pure white (`#ffffff`) for body text in dark mode — use `gray-100` (`#f3f4f6`)
- Semantic badge backgrounds: 20% opacity on dark-300 surface

---

## Spacing

- **Base unit:** 8px
- **Density:** Comfortable — not compact; data-heavy but readable
- **Scale (Tailwind):**

| Token | Value | Usage |
|-------|-------|-------|
| 0.5   | 2px   | Micro gaps (icon padding) |
| 1     | 4px   | Tight inline spacing |
| 2     | 8px   | Component internal padding |
| 3     | 12px  | Label-to-input gap |
| 4     | 16px  | Card inner padding (compact) |
| 5     | 20px  | Card inner padding (standard) |
| 6     | 24px  | Section internal rhythm |
| 8     | 32px  | Between card components |
| 10    | 40px  | Section separation |
| 12    | 48px  | Page section gap |
| 16    | 64px  | Major layout separation |

---

## Layout

- **Approach:** Grid-disciplined — strict columns, predictable alignment. No decorative asymmetry.
- **Sidebar:** 256px fixed, collapsible to icon-only (64px) on mobile
- **Content max-width:** `max-w-7xl` (1280px) — never full-bleed body text
- **Grid:** 12-column desktop, 4-column mobile
- **Breakpoints:** sm(640) md(768) lg(1024) xl(1280) 2xl(1536)

### Border-Radius Hierarchy

| Token | Value  | Usage |
|-------|--------|-------|
| sm    | 4px    | Badges, tags, small chips |
| md    | 8px    | Inputs, buttons, small cards |
| lg    | 12px   | Cards (`.card`), panels |
| xl    | 16px   | Modals, sheets, hero cards |
| 2xl   | 24px   | Large decorative elements |
| full  | 9999px | Avatars, pill badges, FAB button |

> Rule: inner radius = outer radius − gap. Nested elements follow this always.

---

## Motion

- **Approach:** Intentional — every animation communicates a state change or spatial relationship
- **Library:** Framer Motion (React) for page transitions and complex sequences; CSS keyframes for hover states and simple transitions
- **Easing:** `ease-out` for entering, `ease-in` for exiting, `ease-in-out` for moving
- **Duration scale:**

| Level  | Range     | Usage |
|--------|-----------|-------|
| micro  | 50–100ms  | Hover states, focus rings, badge updates |
| short  | 150–250ms | Button press, tooltip appear |
| medium | 250–400ms | Modal open, page enter, sidebar toggle |
| long   | 400–700ms | Page load stagger, skeleton fade-to-content |

- **Named animations (tailwind.config.js keyframes):** `fade-in` (300ms), `slide-up` (400ms), `slide-in` (300ms), `scale-in` (200ms), `pulse-slow` (3s)
- `prefers-reduced-motion`: respected system-wide. All animations disable or reduce to simple opacity fades.
- Only animate `transform` and `opacity` — never `width`, `height`, `top`, `left` (layout thrash)
- No `transition: all` — always list specific properties

---

## Component Guidelines

### Buttons

- **Primary:** `bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700`
- **Secondary:** `bg-white border-gray-300 text-gray-700 hover:bg-gray-50` / dark: `bg-dark-100 border-dark-100 text-gray-200`
- **Danger:** `bg-red-600 text-white hover:bg-red-700`
- **Ghost:** `bg-transparent text-gray-600 hover:bg-gray-100` / dark: `text-gray-400 hover:bg-dark-200`
- Minimum touch target: 44px height on all buttons
- `cursor: pointer` on all interactive elements

### Cards

- Light: `bg-white border-gray-200 shadow-sm rounded-xl`
- Dark: `bg-dark-200 border-dark-100 shadow-sm rounded-xl`
- Hover variant: `transition-shadow hover:shadow-md`

### Forms

- Input: `rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent`
- Focus ring: always `focus-visible:ring-2 focus-visible:ring-primary-500` — never `outline: none` without replacement
- Labels: `text-sm font-medium text-gray-700` (light) / `text-gray-300` (dark)

### Tables

- Header: `bg-gray-50 dark:bg-dark-300 text-xs font-semibold text-gray-500 uppercase tracking-wide`
- Row hover: `hover:bg-gray-50 dark:hover:bg-dark-300`
- Cells: `px-4 py-3 text-sm text-gray-700 dark:text-gray-300`

---

## AI Slop Hard Rules

Never introduce the following into this codebase:
1. Purple / violet / indigo gradient backgrounds
2. Three-column feature grid with icons in colored circles
3. Centered everything (`text-align: center` on all content)
4. Decorative blobs, wavy SVG dividers, floating background shapes
5. Emoji as design elements in UI (rockets, sparkles, etc.)
6. Colored left-border cards (`border-left: 3px solid <accent>`)
7. Generic hero copy ("Unlock the power of...", "Your all-in-one solution")
8. Uniform bubbly border-radius on all elements (use the hierarchy above)

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-07 | Initial design system created | Formalized from existing codebase via /design-consultation |
| 2026-04-07 | Body font: Plus Jakarta Sans (replaces Inter var) | More distinctive; same legibility; better bilingual support |
| 2026-04-07 | Semantic colors made explicit | Prevents ad-hoc color use across 5-role UI |
| 2026-04-07 | Border-radius hierarchy locked | Prevents uniform bubbly-radius slop |
| 2026-04-07 | `prefers-reduced-motion` declared as system-wide requirement | Accessibility + institutional credibility |
