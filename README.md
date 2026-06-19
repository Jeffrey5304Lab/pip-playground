# 🐤 Pip's Playground

A cozy, English-language **learning game for 3-year-olds**. Pip the little chick
guides toddlers through seven bite-size learning rooms. Built as an installable
**web app (PWA)** — works offline and is ready to be wrapped for the App Store / Play Store.

## What it teaches

| Room | Skill | How it plays |
|------|-------|--------------|
| **Colors** | Color recognition | "Find the red one!" — tap the matching color bubble |
| **Shapes** | Shape recognition | "Find the heart!" — tap the matching shape |
| **Numbers** | Counting 1–5 | Tap each critter to count aloud, then pick the number |
| **Animals** | Animal names + sounds | "Who says Moo?" — find the animal that makes the sound |
| **ABC** | Letters + phonics | "Find A — A is for Apple" — tap the matching letter |
| **Words** | First everyday words | "Find the ball!" — tap the matching picture |
| **Patterns** | Logic & sequencing | "What comes next?" — complete the repeating pattern |

## Progression (Duolingo-style, toddler-tuned)

The home screen is a **winding journey map**: each room is a "world" with a short
path of lesson nodes that light up as they're earned (current node bobs a START
bubble with Pip; later nodes unlock in sequence). Each lesson is a **5-question**
run with a progress bar and **combo** encouragement ("2 in a row!") that a wrong
tap resets. Finishing a lesson celebrates with:

- a **crown** for that world (level-up feel), a **collectible sticker** (revealed
  on the complete screen, kept in a **sticker book** of 19), and a gentle **daily streak**
- distinct sound effects + **haptics** on every beat (silenced by the mute toggle)

Pip reacts in character (happy on the map, cheering on completion). Progress is
saved on-device (`localStorage`, `src/progress.js`) — no accounts, no network, no
data collection. Borrowed from Duolingo's habit loop, but with **no hearts/lives
and no fail state** — toddlers can only ever move forward.

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
- Sound effects synthesized with the **Web Audio API**. Spoken lines play
  pre-recorded **Gemini TTS** clips (`audio/`, voice *Leda*) for a warm, natural
  narrator, falling back to the browser's **SpeechSynthesis** voice for anything
  not yet recorded — both paths work fully offline once cached.
- **Service worker** caches everything for offline play (`sw.js`).

## Roadmap

**Now (game design & polish)**
- ✅ 7 learning rooms, 100% bespoke SVG art
- ✅ Duolingo-style **journey map**, 5-question lessons, **combos**, crowns
- ✅ **Sticker book** (19 collectibles), Pip **expressions**, richer SFX + **haptics**
- ✅ Natural **Gemini TTS** voice (183 recorded clips) with browser-speech fallback
- ✅ **Simple addition** rounds in the Numbers world (combine two groups, count all)
- ✅ **Parent area** — hold the settings icon on the map to open stats + a
  reset-progress control (double-tap confirm)
- ✅ **More stickers** — balloon, kite, moon added to the Words room + sticker book (19 total)
- Next: richer content (uppercase/lowercase matching, story moments)

**Later — shipping**
- ✅ **Public URL** — live at https://jeffrey5304lab.github.io/pip-playground/,
  auto-deployed by `.github/workflows/deploy-pages.yml` on every push to `main`
  (`netlify.toml` also ships, for a one-tap private deploy). Both serve the
  output of `npm run build:web` (`www/`).
- **App Store / Play Store** — parked. Capacitor is configured
  (`capacitor.config.json`, app id `com.pipplayground.app`). Generate the
  native shells when ready:
  ```bash
  npm install
  npm run cap:add:ios       # macOS + Xcode
  npm run cap:add:android   # Android Studio
  npm run cap:ios           # build www/, sync, open in Xcode
  ```

## Project layout

```
index.html            app shell + start gate
styles.css            visual system (claymorphism, animations)
src/app.js            boot, router, hub, lesson engine + celebration
src/progress.js       crowns / stickers / daily streak (localStorage)
src/audio.js          SFX + English voice
src/mascot.js         Pip the chick (inline SVG)
src/art.js            bespoke SVG art library (animals, icons, rewards, glyphs)
src/confetti.js       celebration burst
src/games/*.js        the seven learning rooms
manifest.webmanifest  PWA manifest
sw.js                 offline service worker
icons/                app icons
scripts/build-web.mjs assembles the clean www/ bundle
capacitor.config.json native shell config (iOS/Android)
.github/workflows/    GitHub Pages deploy
tests/smoke.mjs       Playwright walkthrough + icon generation
```
