# Changelog

All notable changes to **Pixafé** are documented here.
Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions track the build phases from the project plan.

---

## [Unreleased]

Planned next: **Phase 2 — Canvas engine + Cafe scene**
- Pixel cafe interior (counter, seats, specials chalkboard)
- Animated chibi character sitting at a desk (idle + working loops)
- Render hook for the future day/night lighting tint

---

## [0.1.1] — 2026-05-22 — Splash polish: cozy cafe interior

### Changed
- Splash background re-themed from outdoor dusk sky to a **warm dim cafe
  interior at night** — pendant lamps with amber halos, dark wood floor
  with plank lines, a booth silhouette on the left, a window with warm
  interior light on the right, and a small chalkboard easel in the corner.
- Sign no longer carries leaf decorations; instead it hangs from two short
  rope segments and gets a soft amber halo glow behind it.
- Static-scene caching: the cafe background is built once into an off-screen
  canvas and blitted each frame, so the splash is cheap even on slower
  hardware.

### Fixed
- Canvas now renders a synchronous frame whenever a draw callback is added,
  so static scenes paint immediately instead of waiting for the next
  requestAnimationFrame tick (helps with throttled environments).

---

## [0.1.0] — 2026-05-22 — Phase 1: Splash & Login

### Added
- Wooden **PIXAFÉ** sign logo at the top of the splash screen.
- Minecraft-style vertical button stack in the center: **Enter Room**,
  **Create Room**, **Create Account**.
- Rotating yellow splash line (random pick on load, rotated ~-18°, gentle
  pulse animation).
- **Create Account** modal — pick a display name; persisted with anonymous
  auth (or local fallback when running offline).
- **Enter Room** modal — type a 4-letter room code to join.
- **Create Room** flow — generates a fresh 4-letter code and shows a copy
  button so you can share it with friends.
- Ambient canvas background drawn at 288×180 logical resolution.
- Bottom-left version chip (`pixafé 0.1.0 · phase 1`).
- Reusable lightweight modal helper used by all three flows.
- Mobile-friendly splash layout (clamped sign width + stacked buttons).

### Changed
- `src/main.js` now boots into the splash screen instead of the Phase 0
  placeholder banner.
- `state/store.js` carries `displayName` alongside the existing user fields.

---

## [0.0.1] — 2026-05-22 — Phase 0: Scaffold

### Added
- Vite + vanilla JS project scaffold (no React, no build-time framework).
- Supabase client wrapper with an **offline scaffold mode** fallback so the
  app boots even before backend env vars are configured.
- Canvas engine: 288×180 logical framebuffer + integer-scaled blit, image
  smoothing disabled — every pixel stays crisp at any window size.
- Location module contract (`id`, `name`, `drawBackground`, `seats`,
  `defaultStation`, `lightingTint`) + 4 stubs: Cafe, Home, Library, Rooftop.
- Audio Station module contract (`id`, `name`, `start`, `stop`, `setVolume`)
  + 8 stubs: Rainy Day, Cafe Buzz, Vinyl Lounge, Fireside, Brown Noise,
  Forest Walk, Ocean Tide, Jazz Bar.
- Procedural Web Audio station manager (registry + lazy AudioContext).
- Tiny pub-sub state store (`src/state/store.js`).
- UI module stubs: splash, customization, pomodoro, location switcher.
- Animation helpers: `bob()`, `lightingForHour()`, `plantStage()`.
- Warm cozy palette + **Silkscreen** (UI) and **VT323** (body) Google Fonts.
- README with build plan checklist + run instructions.
