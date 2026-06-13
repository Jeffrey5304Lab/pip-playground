# 🐤 Pip's Playground

A cozy, English-language **learning game for 3-year-olds**. Pip the little chick
guides toddlers through four bite-size learning rooms. Built as an installable
**web app (PWA)** — works offline and is ready to be wrapped for the App Store / Play Store later.

![hub](tests/shots/2-hub.png)

## What it teaches

| Room | Skill | How it plays |
|------|-------|--------------|
| 🎨 **Colors** | Color recognition | "Find the red one!" — tap the matching color bubble |
| 🔷 **Shapes** | Shape recognition | "Find the heart!" — tap the matching shape |
| 🔢 **Numbers** | Counting 1–5 | Tap each critter to count aloud, then pick the number |
| 🐮 **Animals** | Animal names + sounds | "Who says Moo?" — find the animal that makes the sound |

## Designed for tiny hands (research-backed)

- **Big touch targets**, single-tap only — no swipes, drags or double-taps.
- **Spoken English instructions** on every screen (built-in speech, no downloads) + a 🔈 "say it again" button.
- **No fail state** — a wrong tap gives a gentle wiggle and a friendly "try again", never a scary buzzer.
- **Instant reward** — stars, confetti and cheerful praise reinforce every success.
- **One task per screen**, minimal text, cozy claymorphism art for low cognitive load.
- Respects `prefers-reduced-motion` and has a global **mute** toggle.

## Run it

```bash
cd pips-playground
npm start            # → http://localhost:8123/index.html
```

Open the URL on a phone (same network) and **Add to Home Screen** to install it
as a full-screen app.

## Test it

Automated Playwright smoke test walks every room, makes a correct choice,
and asserts the reward + star counter fire. It also regenerates the PNG icons.

```bash
npm test
```

> Requires Google Chrome and a global `playwright` install. Start the server first
> (`npm start` in another terminal).

## Tech

- Vanilla **HTML / CSS / ES modules** — zero build step, instant load.
- **100% bespoke vector art, zero emoji.** Every character, icon and reward is
  hand-built SVG in one cohesive flat + soft-shade language (`src/art.js`) — Pip,
  the eight animals, room icons, trophies and UI glyphs. Crisp at any size,
  theme-able, and free of the generic "AI sticker" look.
- Design language: **Claymorphism** (soft 3D, double shadows) + **Baloo 2** type,
  per the `ui-ux-pro-max` design system.
- Sound effects synthesized with the **Web Audio API**; voice via **SpeechSynthesis**
  (so there are no audio asset files and it works fully offline).
- **Service worker** caches everything for offline play (`sw.js`).

## Roadmap to the app stores

1. Web PWA (this repo) ✅
2. More rooms: letters & phonics, first words, simple patterns.
3. Wrap with **Capacitor** (or PWABuilder) to produce native iOS/Android shells.
4. Parent area (gate behind a hold-to-enter), progress, and per-skill difficulty.

## Project layout

```
index.html            app shell + start gate
styles.css            visual system (claymorphism, animations)
src/app.js            boot, router, hub, reward overlay
src/audio.js          SFX + English voice
src/mascot.js         Pip the chick (inline SVG)
src/art.js            bespoke SVG art library (animals, icons, rewards, glyphs)
src/confetti.js       celebration burst
src/games/*.js        the four learning rooms
manifest.webmanifest  PWA manifest
sw.js                 offline service worker
icons/                app icons
tests/smoke.mjs       Playwright walkthrough + icon generation
```
