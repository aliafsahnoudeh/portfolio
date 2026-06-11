# Ali's portfolio

Portfolio of Ali Afsah-Noudeh as a playable homage to PlayStation's _Twisted Metal_:
drive a white Peykan 1374 around a PS1-style arena and destroy billboards to
discover real projects. Fully bilingual (English + Persian, RTL) and SEO-first —
every piece of content is server-rendered static HTML; the game is a client-side
layer on top.

## Stack

- **Next.js 16** (App Router, full SSG) + TypeScript + Tailwind 4
- **React Three Fiber 9** + postprocessing (240p buffer, Bayer/RGB555 dither, vertex snap)
- **next-intl 4** (`/en`, `/fa` routes, hreflang, RTL)
- **zustand** (game state) · **zod** (content validation) · WebAudio (all sound synthesized)
- **Bun** as package manager / dev runner; deploys zero-config on Vercel

## Architecture

`src/` follows a DDD-style modular layout: code is split by domain, and each
domain owns its `components/` (UI), `services/` (hooks + pure logic) and
`types/`:

```
src/
├─ app/                  # Next.js routes — composition root only
├─ domains/
│  ├─ game/              # the playable arena
│  │  ├─ index.ts        # public API (GameLoader)
│  │  ├─ components/     # GameRoot, screens/, arena/, vehicle/, weapons/, fx/
│  │  ├─ services/       # state/, input/, audio/, arena/, vehicle/, weapons/, fx/
│  │  └─ types/
│  ├─ projects/          # portfolio content
│  │  ├─ index.ts        # client-safe public API (components, schema, types)
│  │  ├─ server.ts       # server-only API (filesystem content loaders)
│  │  ├─ components/     # ProjectCard, ProjectIntel, StatBars
│  │  ├─ services/       # project-schema (zod), projects (loader), seo
│  │  └─ types/
│  └─ shared/            # domain-agnostic: site chrome components, seo/og/const services
├─ i18n/                 # next-intl infrastructure
├─ content/projects/     # owner-editable project data (JSON)
└─ messages/             # UI strings (en/fa)
```

Conventions: `app/` composes domains through their public APIs (`index.ts`,
`server.ts`); cross-domain imports never reach into internals; barrels stay
client-safe (anything `server-only` is exported from `server.ts`); the
`shared` domain never imports from the other domains.

## Commands

```sh
bun install
bun dev        # http://localhost:3000 (redirects to /en)
bun run build  # all routes must show ● (SSG)
bun run lint
```

## Controls

Arrows = drive · **A** = machine gun · **S** = missile · **D** = special
(Samovar Strike) · **Space** = turbo / handbrake · **Esc** = pause · **M** = mute.
"SKIP INTRO" (bottom center) reveals the plain HTML site.

## Adding a project

Drop a new JSON file in `src/content/projects/<slug>.json` — no code changes.
The schema is enforced at build time by
`src/domains/projects/services/project-schema.ts`:

```jsonc
{
  "slug": "my-project", // must match the filename
  "order": 6, // list position + billboard placement
  "period": "2026 — present",
  "status": "active", // active | archived | wip
  "tech": ["TypeScript", "..."],
  "links": { "github": "https://github.com/..." },
  "stats": { "firepower": 7, "armor": 8, "speed": 6, "special": 9 }, // 1-10
  // optional fixed arena spot: "billboard": { "x": 10, "z": -20 },
  "i18n": {
    "en": {
      "title": "...",
      "tagline": "...",
      "description": ["..."],
      "highlights": ["..."],
    },
    "fa": {
      "title": "...",
      "tagline": "...",
      "description": ["..."],
      "highlights": ["..."],
    },
  },
}
```

It automatically appears on the home page, `/projects`, its own
`/projects/<slug>` page (with OG image + JSON-LD), the sitemap — and as a
destructible billboard in the arena.

## UI copy

All interface strings live in `src/messages/en.json` and `src/messages/fa.json`.

## Replacing the driver portrait

`public/images/driver-portrait.svg` is a placeholder. Swap in a posterized/
dithered image (PS1 FMV style) — referenced from the vehicle-select screen.
