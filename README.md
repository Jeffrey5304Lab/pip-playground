# 🐤 Pip's Playground

A cozy, English-language **learning game for 3-year-olds**. Pip the little chick
guides toddlers through seven bite-size learning rooms. Built as an installable
**web app (PWA)** — works offline and is ready to be wrapped for the App Store / Play Store.

## What it teaches

The eleven rooms are grouped into four **subjects** on the home screen
(English · Numbers · Colors & Shapes · Animals & Fruits):

| Room | Subject | Skill | How it plays |
|------|---------|-------|--------------|
| **Colors** | Colors & Shapes | Color recognition | "Find the red one!" — tap the matching color bubble |
| **Shapes** | Colors & Shapes | Shape recognition | "Find the heart!" — tap the matching shape |
| **Patterns** | Colors & Shapes | Logic & sequencing | "What comes next?" — complete the repeating pattern |
| **Numbers** | Numbers | Counting 1–5 + adding | Tap each critter to count aloud, then pick the number |
| **Count to 10** | Numbers | Counting 6–10 + take-away | Count the critters (or how many are left) |
| **Animals** | Animals & Fruits | Animal names + sounds | "Who says Moo?" — find the animal that makes the sound |
| **Fruits** | Animals & Fruits | Fruit vocabulary | "Find the banana!" — tap the matching fruit |
| **ABC** | English | Letters + phonics | "Find A — A is for Apple" — tap the matching letter |
| **ABC Match** | English | Upper ↔ lowercase | "Find the little a" — match the letter case |
| **Words** | English | First everyday words | "Find the ball!" — tap the matching picture |
| **Sight Words** | English | First reading words | "Find the word *the*!" — tap the matching word |

## Progression (Duolingo-style, toddler-tuned)

The home screen is a **subject shelf** — four big cards (English · Numbers ·
Colors & Shapes · Animals & Fruits). Tapping one opens its 2–4 games, so a young
child only ever faces a handful of choices at a time. **Nothing is locked** — any
game is always free to play (a wrong tap is never a dead end). Each game is a
**5-question** lesson with a progress bar and **combo** encouragement ("2 in a
row!") that a wrong tap resets. Finishing a lesson celebrates with:

- a **crown** for that game (level-up feel), a **collectible sticker** (revealed
  on the complete screen, kept in a **sticker book** of 26), and a gentle **daily streak**
- distinct sound effects + **haptics** on every beat (silenced by the mute toggle)

Pip cheers on completion. Progress is saved on-device (`localStorage`,
`src/progress.js`) — no accounts, no network, no data collection (see
[`privacy.html`](privacy.html)). Crown/streak counts live in the **Parent Area**
(hold the settings icon), keeping the child's screens uncluttered. Borrowed from
Duolingo's habit loop, but with **no hearts/lives and no fail state** — toddlers
can only ever move forward.

## Bilingual voice (Chinese guidance, for ages 3–5)

A 3-year-old can't read either language, so only the **spoken** line is bilingual —
text and pictures stay English. With **Chinese guidance** on (Parent Area toggle,
default on), each prompt is spoken in Mandarin first ("找紅色的！") so the child
understands the task, then in English ("Find the red one!") — the word being
learned; a correct answer reinforces it in both. It covers the picture+audio rooms
a 3yo can do (Colors, Shapes, Numbers, Animals, Fruits); the reading rooms stay
English-only. Chinese narration uses the same **Gemini TTS** voice, with the
device's Mandarin voice as an offline fallback (`src/i18n.js`).

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
- ✅ **11 learning rooms** grouped into 4 subjects, 100% bespoke SVG art
- ✅ Two-level **subject shelf** home (no locks), 5-question lessons, **combos**, crowns
- ✅ **Sticker book** (26 collectibles), Pip **expressions**, richer SFX + **haptics**
- ✅ Natural **Gemini TTS** voice with browser-speech fallback
- ✅ **Numbers**: simple addition + a **Count to 10** room with take-away subtraction
- ✅ **English**: **ABC Match** (upper/lowercase) and **Sight Words** rooms
- ✅ **Fruits** room — 7 new bespoke fruit characters + sticker-book entries
- ✅ **Parent area** — hold the settings icon to open stats, a Chinese-guidance
  toggle, and a reset-progress control (double-tap confirm)
- ✅ **Bilingual voice** — Mandarin guidance + English word, for ages 3–5
- Next: richer content (story moments, more sight words)

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
privacy.html          privacy policy (linked from the in-app Parent Area)
styles.css            visual system (claymorphism, animations)
src/app.js            boot, router, hub, lesson engine + celebration
src/progress.js       crowns / stickers / daily streak (localStorage)
src/audio.js          SFX + bilingual (Chinese/English) voice
src/i18n.js           Chinese guidance lines for bilingual mode
src/mascot.js         Pip the chick (inline SVG)
src/art.js            bespoke SVG art library (animals, fruits, icons, rewards, glyphs)
src/confetti.js       celebration burst
src/games/*.js        the eleven learning rooms
manifest.webmanifest  PWA manifest
sw.js                 offline service worker
icons/                app icons (icon-maskable.svg has a safe-zone margin for Android)
fonts/                self-hosted Baloo 2 (no third-party font requests)
scripts/build-web.mjs assembles the clean www/ bundle
capacitor.config.json native shell config (iOS/Android)
.github/workflows/    GitHub Pages deploy
tests/smoke.mjs       Playwright walkthrough + icon generation
```
