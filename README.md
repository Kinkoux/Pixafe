# Pixafé

> warm pixels, good company

A web-based, pixel-art, lo-fi cozy cafe game. A **co-presence / body-doubling
hub** — friends join a shared room and see each other's avatars hanging out.
Anyone can study, read, or just *be* there; the app never assumes a specific
activity.

## Stack

- **Frontend**: Vite + vanilla HTML/CSS/JS (no React)
- **Render**: HTML5 Canvas, `imageSmoothingEnabled = false`, integer-scaled,
  ~288×180 logical resolution
- **Backend**: Supabase (Realtime Presence, Postgres + RLS, anonymous auth)
- **Audio**: Web Audio API — fully procedural, no copyrighted files
- **Hosting**: Vercel static deploy

## Run locally

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npm run dev            # http://localhost:5173
```

The app boots fine without Supabase env vars — it falls back to "offline
scaffold mode" (canvas + UI work, but no auth / persistence / presence).

## Scripts

| script          | what it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`     | Vite dev server with hot reload       |
| `npm run build`   | Production build to `dist/`           |
| `npm run preview` | Preview the production build locally  |

## Project structure

```
pixafe/
├── index.html                  # canvas + UI root
├── vite.config.js
├── .env.example
└── src/
    ├── main.js                 # bootstrap
    ├── styles/global.css       # warm palette, pixel-perfect fonts
    ├── lib/                    # supabase / auth / presence wrappers
    ├── render/                 # canvas + avatar + animations
    ├── locations/              # one file per location (data + drawBackground)
    ├── audio/                  # stationManager + one file per station
    ├── ui/                     # splash, customization, pomodoro, location switcher
    └── state/store.js          # tiny pub-sub store
```

## Build plan

See [the plan file](../../.claude/plans/pixaf-a-web-based-eager-snail.md) for
the full phased plan with locations, audio stations, and bonus features.

Quick checklist:

- [x] **Phase 0** — Scaffold (Vite, folders, stubs, Supabase client)
- [ ] **Phase 1** — Splash / login (rotating splash, anon auth, room enter/create)
- [ ] **Phase 2** — Canvas engine + Cafe scene (animated character)
- [ ] **Phase 3** — Customization + cozy-pet toggle
- [ ] **Phase 4** — Pomodoro + status line + growing plant
- [ ] **Phase 5** — Locations (Home, Library, Rooftop) + switcher
- [ ] **Phase 6** — Audio "radio stations" (8 launch stations)
- [ ] **Phase 7** — Presence (rooms, avatars, emote + status sync)
- [ ] **Phase 8** — Polish (stats, mobile, day/night + weather, reduced-motion, deploy)
- [ ] **Stretch** — Tier 2 locations + guestbook + achievements + knock-to-enter + sync mode
