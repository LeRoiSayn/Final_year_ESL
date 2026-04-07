# ESL — Claude Code Guidelines

## Design System

Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

Key rules at a glance:
- Body font: `Plus Jakarta Sans` (font-sans in Tailwind)
- Display font: `Outfit` (font-display in Tailwind)
- Primary brand color: `#269c6d` (primary-500)
- Dark surfaces: `dark-100` through `dark-400` (navy range)
- Border-radius: use the hierarchy (sm:4px md:8px lg:12px xl:16px full:9999px)
- Never use purple/violet gradients, decorative blobs, or icon-in-circle grids
