# Portfolio Front

A modern personal-portfolio frontend built with **Vue 3**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

## Features

- ⚡️ **Vue 3** (`<script setup>`) + **TypeScript** + **Vite**
- 🎨 **Tailwind CSS v4** wired to custom design tokens
- 🌙 **Dark mode** — persisted & system-aware, driven by a `data-theme` attribute (no flash on load)
- 🌍 **Multi-language** — `vue-i18n` with English, French & Spanish and a ready-made switcher
- 🧭 **vue-router** for pages and **Pinia** for state management

## Getting started

```bash
pnpm install
pnpm dev        # start the dev server (http://localhost:5173)
pnpm build      # type-check + production build
pnpm preview    # preview the production build
```

## Theming

Color tokens live in [`src/assets/main.css`](src/assets/main.css) as CSS variables on
`:root` (light) and `[data-theme="dark"]` (dark). They are exposed to Tailwind via
`@theme inline`, so you can use utility classes that follow the active theme:

| Utility examples | Token |
| --- | --- |
| `bg-page`, `bg-surface`, `bg-card`, `bg-card-hover`, `bg-nav` | backgrounds |
| `text-primary`, `text-secondary`, `text-accent` | text |
| `bg-brand`, `bg-brand-hover`, `bg-blob`, `text-brand` | brand |
| `border-line`, `border-line-accent` | borders |

Toggle the theme with the `useTheme()` composable ([`src/composables/useTheme.ts`](src/composables/useTheme.ts)).

## Internationalization

Locales live in [`src/i18n/locales/`](src/i18n/locales/). English (`en.ts`) is the
source of truth for the message schema; other locales are type-checked against it.
Add a language by creating a new locale file and registering it in
[`src/i18n/index.ts`](src/i18n/index.ts) (`SUPPORTED_LOCALES` + `messages`).

## Project structure

```
src/
├── assets/main.css        # Tailwind import + design tokens + dark-mode variant
├── components/            # AppHeader, AppFooter, ThemeToggle, LanguageSwitcher
├── composables/useTheme.ts
├── i18n/                  # config + locale files
├── router/                # vue-router routes
├── views/                 # Home, About, Projects, Contact
├── App.vue
└── main.ts
```
