# Portfolio — Theme Reference

> Single source of truth for the visual design. Extracted from
> `portfolio-data/assets/templates/dark.png` and `ligth.png`.
> **Stick to these tokens** — don't hard-code colors/fonts; use the Tailwind
> utilities below (which map to CSS variables in `src/assets/main.css`).

---

## 1. Aesthetic / strategy

A **developer / terminal** portfolio for *Oussema Jbeli — Full-Stack Developer*.

- **Monospace everywhere** (JetBrains Mono) — UI, body, headings. Reads like an editor.
- **Terminal cues**: `>_` prefix on section badges (e.g. `>_ FULL-STACK DEVELOPER`), a floating `</>` code badge, blinking caret on the tagline.
- **Two-tone headings**: primary ink + a gold word (e.g. "Oussema" + gold "Jbeli").
- **Gold brand with a glow** on primary CTAs / active states.
- **Organic orange blobs**, blurred, in background corners; subtle dotted grid + bottom wave.
- **Rounded**: pills (`rounded-full`) for nav items, buttons, chips; `rounded-2xl` cards.
- **Handwritten script accent** (Caveat) for playful notes ("Building the future").
- Light = warm off-white + navy ink; Dark = deep navy + white ink. Same gold brand.

---

## 2. Color tokens

Defined in `src/assets/main.css` as CSS variables, exposed to Tailwind via `@theme inline`.

### Light (`:root`)
| Token | Value | Tailwind utility |
|---|---|---|
| `--bg-page` | `#f7f6f1` | `bg-page` |
| `--bg-surface` | `#ffffff` | `bg-surface` |
| `--bg-card` | `#f8f7f3` | `bg-card` |
| `--bg-card-hover` | `#efece4` | `bg-card-hover` |
| `--bg-nav` | `#ffffff` | `bg-nav` |
| `--text-primary` | `#1a1f3c` | `text-primary` |
| `--text-secondary` | `#565d7a` | `text-secondary` |
| `--text-accent` | `#e6920c` | `text-accent` |
| `--color-brand` | `#f5a623` | `bg-brand` / `text-brand` |
| `--color-brand-hover` | `#e08c0c` | `bg-brand-hover` |
| `--color-blob` | `#ff9f1c` | `bg-blob` |
| `--border-default` | `#e6e3db` | `border-line` |
| `--border-accent` | `#f5a623` | `border-line-accent` |
| `--glow-brand` | `rgba(245,166,35,.30)` | `glow-brand` |

### Dark (`[data-theme="dark"]`)
| Token | Value | Tailwind utility |
|---|---|---|
| `--bg-page` | `#080e24` | `bg-page` |
| `--bg-surface` | `#0d1533` | `bg-surface` |
| `--bg-card` | `#111c40` | `bg-card` |
| `--bg-card-hover` | `#1a2a5e` | `bg-card-hover` |
| `--bg-nav` | `#0a1230` | `bg-nav` |
| `--text-primary` | `#ffffff` | `text-primary` |
| `--text-secondary` | `#aeb9dd` | `text-secondary` |
| `--text-accent` | `#f0c040` | `text-accent` |
| `--color-brand` | `#f5b81e` | `bg-brand` / `text-brand` |
| `--color-brand-hover` | `#e3a312` | `bg-brand-hover` |
| `--color-blob` | `#f7a01a` | `bg-blob` |
| `--border-default` | `#1e2d60` | `border-line` |
| `--border-accent` | `#f0c040` | `border-line-accent` |
| `--glow-brand` | `rgba(246,184,30,.45)` | `glow-brand` |

> Tip: tint with opacity, e.g. `bg-brand/15`, `bg-blob/30`.
> Dark text on a gold button uses the fixed navy `#1a1f3c` (`text-[#1a1f3c]`).

---

## 3. Typography

| Role | Family | Tailwind | Notes |
|---|---|---|---|
| Body / UI | JetBrains Mono | `font-mono` (default) | weights 400/500/600/700 |
| Display / headings / name | JetBrains Mono | `font-display` + `font-extrabold` | weight 800, tight tracking |
| Script accent | Caveat | `font-script` | decorative notes only |

Loaded via Google Fonts `<link>` in `index.html`. Body defaults to mono (`--font-sans = --font-mono`).

---

## 4. Effects & patterns

- **Glow** (CTAs, active nav, FAB): `glow-brand` utility → `box-shadow: 0 10px 30px -8px var(--glow-brand)`.
- **Blobs**: absolutely-positioned `rounded-full bg-blob` with `blur-3xl` + low opacity, in corners, `pointer-events-none aria-hidden`.
- **Primary button**: `rounded-full bg-brand text-[#1a1f3c] font-semibold hover:bg-brand-hover glow-brand`.
- **Secondary button**: `rounded-full border border-line-accent text-primary hover:bg-card-hover`.
- **Nav pill (active)**: `rounded-full bg-brand/15 text-brand border border-line-accent` (+ `glow-brand` on hero CTA).
- **Card**: `rounded-2xl border border-line bg-card` (+ `hover:bg-card-hover`).
- **Badge / chip**: `rounded-full border border-line bg-card px-3 py-1 font-mono text-sm`.
- **Section badge**: monospace, accent color, prefixed `>_ ` (e.g. `>_ ABOUT ME`).
- **Focus**: global `:focus-visible` → 2px brand outline.

Radii: pills `rounded-full`; cards `rounded-2xl` (16px); inputs `rounded-xl` (12px).

---

## 5. Iconography & sections

Nav items pair an icon with a label: Home, About, Projects, Skills, Contact (Blog → its page).
Stat counters use line icons (rocket/smile/award/code). Social: LinkedIn, GitHub, X, Behance.

---

## 7. Rules to stick to

1. Never hard-code a hex that exists as a token — use the utility.
2. New colors → add a token to **both** light & dark in `main.css`, then use it.
3. Monospace by default; reserve `font-script` for decorative accents.
4. Gold is the only brand accent — don't introduce other accent hues.
5. Primary actions get `glow-brand`; keep it sparing.
6. Test every change in **both** themes and in **RTL** (Arabic).
