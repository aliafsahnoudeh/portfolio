# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Bun is the package manager and dev runner.

```sh
bun install
bun dev          # http://localhost:3000 — "/" redirects to /en
bun run build    # production build; see the SSG check below
bun run lint     # eslint
```

There is **no test suite** (`playwright-core` is a devDependency used only for
ad-hoc headless screenshots, not a configured runner). Verification is the
build plus manual/headless browser checks — see Verification below.

## What this is

A bilingual (English + Persian/RTL), SEO-first portfolio that doubles as a
playable PS1-style *Twisted Metal* homage: the visitor drives a low-poly Peykan
around a 3D arena and destroys billboards, each representing a real project.
Next.js 16 App Router, fully static (SSG), React Three Fiber for the game,
deployed on Vercel.

## Architecture (the load-bearing ideas)

**SEO-first, game-on-top.** Every piece of content exists as server-rendered
static HTML at a real route. The game is a *client-only layer* mounted over the
home page's server-rendered fallback. `src/domains/game/components/GameLoader.tsx`
is the single client boundary — `dynamic(() => import('./GameRoot'), { ssr:false })`
— so three.js never enters a server bundle and never ships to content routes.
Crawlers and no-JS visitors get the full site; "SKIP INTRO" reveals it for
everyone. Never import game code from a server component or a content page.

**DDD modular layout.** `src/app/` is the Next.js routing shell / composition
root *only*. All real code lives in `src/domains/<domain>/` split into
`components/` (UI), `services/` (hooks + pure logic), `types/`:

- `domains/game` — the arena. Public API: `index.ts` → `GameLoader`.
- `domains/projects` — portfolio content. **Two barrels:** `index.ts` is
  client-safe (components, zod schema, `localizeProject`, types); `server.ts`
  holds the `server-only` filesystem loaders (`getProjects`/`getProject`).
  Mixing them up breaks client imports.
- `domains/shared` — domain-agnostic site chrome + `const`/`seo`/`og` services.

Rules enforced by convention (keep them): `app/` composes domains only through
their public barrels; cross-domain imports never reach into another domain's
internals; `shared` never imports from another domain; inside a domain use
absolute `@/domains/...` paths.

**i18n / routing.** next-intl with `localePrefix: 'always'` → canonical `/en`
and `/fa`. Full SSG depends on calling `setRequestLocale(locale)` as the first
statement in every layout/page that translates — **forgetting it silently makes
the page dynamic.** Locale negotiation/redirect lives in `src/proxy.ts` (Next 16
renamed `middleware` → `proxy`). RTL is `dir` on `<html>` plus Tailwind logical
properties; the game canvas/HUD use physical positions so gameplay feels
identical in both locales.

**Content model.** One JSON file per project in `src/content/projects/<slug>.json`,
validated at build by the zod schema in
`src/domains/projects/services/project-schema.ts` (filename must equal `slug`;
both `en` and `fa` required). Dropping a file makes it appear automatically on
the home page, `/projects`, `/projects/<slug>` (with OG image + JSON-LD), the
sitemap, and as a destructible arena billboard — no code changes.

**Game loop conventions** (`domains/game/services`): a zustand store plus an
explicit phase state machine (`state/machine.ts` gates legal transitions). The
`useFrame` loop mutates refs and module-scoped temp vectors with zero per-frame
allocation, and bridges to the DOM HUD through a plain mutable `telemetry`
object (`state/telemetry.ts`) — values that change every frame are written there
and read in the HUD's own rAF, never via React state. Because of this
intentional in-loop mutation, **eslint disables `react-hooks/refs` and
`react-hooks/immutability` for `src/domains/game/**`** (see `eslint.config.mjs`);
don't "fix" loop code to satisfy those rules. The PS1 look is a fixed low-height
render buffer upscaled with CSS `image-rendering: pixelated`, a custom
postprocessing dither/posterize Effect, and a vertex-snap material — all in
`domains/game/{components,services}/fx`.

## Product constraints (don't regress these)

- **Language selector is text-only `EN | فارسی` — never an Iranian flag.**
- Presents **projects, not employers**; no company names in content.
- **No personal contact info** (email/phone) — public profile links only
  (GitHub, LinkedIn, Medium).
- All UI strings live in `src/messages/{en,fa}.json`; both locales must stay in
  parity. Keep mixed LTR technical terms inside `<bdi>` within RTL text.

## Verification (no test suite)

- `bun run build` must show **every** route as `●` (SSG) for both locales — a
  route silently becoming `ƒ` (dynamic) means a missing `setRequestLocale`.
- Confirm the three.js chunk is absent from `/en/projects` initial HTML
  (client/server boundary intact).
- For game changes, smoke-test the loop in a headless browser
  (`playwright-core`, Chrome channel): boot → menu → vehicle select → arena →
  destroy a billboard → intel overlay; check `/fa` renders RTL.
