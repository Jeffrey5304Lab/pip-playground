/* ============================================================
   app.js — Pip's Playground shell: gate, router, hub, rewards.
   ============================================================ */
import { pipSVG } from "./mascot.js";
import { icon as artIcon, ui as artUi, star as artStar, randomReward } from "./art.js";
import { initConfetti, burst } from "./confetti.js";
import {
  unlockAudio, loadMutePref, setMuted, isMuted,
  say, sfxTap, sfxCorrect, sfxTryAgain, sfxCelebrate, sfxCount,
} from "./audio.js";
import { colorsGame } from "./games/colors.js";
import { shapesGame } from "./games/shapes.js";
import { countingGame } from "./games/counting.js";
import { animalsGame } from "./games/animals.js";

const $ = (s, r = document) => r.querySelector(s);

const ROOMS = [
  { id: "colors",  label: "Colors",  icon: artIcon.colors,  cls: "room--colors",  game: colorsGame,   praise: ["Great job!", "Wonderful!", "You did it!"] },
  { id: "shapes",  label: "Shapes",  icon: artIcon.shapes,  cls: "room--shapes",  game: shapesGame,   praise: ["Awesome!", "Nice!", "Yay!"] },
  { id: "count",   label: "Numbers", icon: artIcon.numbers, cls: "room--count",   game: countingGame, praise: ["Perfect!", "Well done!", "Hooray!"] },
  { id: "animals", label: "Animals", icon: artIcon.animals, cls: "room--animals", game: animalsGame,  praise: ["Yay!", "So good!", "You got it!"] },
];

const starChip = (n) => `<span class="star-chip">${artStar(true)}<span id="star-count">${n}</span></span>`;

let app, soundBtn, rewardEl, current = null;
let stars = 0;

/* ---------- helpers passed to games ---------- */
const rand = (arr) => arr[(Math.random() * arr.length) | 0];
function sample(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

/* ---------- boot ---------- */
function boot() {
  app = $("#app");
  soundBtn = $("#sound-toggle");
  initConfetti($("#confetti"));

  // mascot on the start gate
  $("#gate-mascot").innerHTML = pipSVG({ size: 170 });

  // sound toggle icons (bespoke SVG, not emoji)
  soundBtn.innerHTML = `<span class="sound-toggle__on">${artUi.speakerOn()}</span>` +
                       `<span class="sound-toggle__off">${artUi.speakerOff()}</span>`;

  loadMutePref();
  reflectMute();

  $("#start-btn").addEventListener("click", start, { once: true });
  soundBtn.addEventListener("click", () => {
    setMuted(!isMuted());
    reflectMute();
    if (!isMuted()) { sfxTap(); say("Sound on!"); }
  });
}

function reflectMute() {
  soundBtn.classList.toggle("is-muted", isMuted());
}

function start() {
  unlockAudio();
  const gate = $("#gate");
  gate.classList.add("is-hidden");
  setTimeout(() => { gate.remove(); }, 500);
  app.hidden = false;
  soundBtn.hidden = false;
  sfxCorrect();
  goHome();
}

/* ---------- views ---------- */
function clearGame() { if (current && current.destroy) current.destroy(); current = null; }

function goHome() {
  clearGame();
  say("Pick a game!");
  app.innerHTML = `
    <header class="topbar">
      <div class="title-chip">${starChip(stars)}</div>
      <div class="topbar__spacer"></div>
    </header>
    <section class="hub">
      <div class="hub__mascot-row">
        <div class="hub__mascot">${pipSVG({ size: 132 })}</div>
        <div class="hub__bubble">Hi! Let's play!</div>
      </div>
      <div class="grid" id="grid"></div>
    </section>`;
  const grid = $("#grid");
  for (const room of ROOMS) {
    const b = document.createElement("button");
    b.className = `room-card ${room.cls}`;
    b.setAttribute("aria-label", room.label);
    b.innerHTML = `<span class="room-card__icon" aria-hidden="true">${room.icon()}</span>
                   <span class="room-card__label">${room.label}</span>`;
    b.onclick = () => { sfxTap(); openRoom(room); };
    grid.appendChild(b);
  }
}

function openRoom(room) {
  clearGame();
  app.innerHTML = `
    <header class="topbar">
      <button class="icon-btn" id="home-btn" aria-label="Back home">${artUi.home()}</button>
      <div class="title-chip"><span class="title-chip__icon">${room.icon()}</span>${room.label}</div>
      <div class="topbar__spacer"></div>
      <div class="title-chip">${starChip(stars)}</div>
    </header>
    <section class="play">
      <div class="prompt"><span id="prompt-text"></span>
        <button class="prompt__say" id="say-btn" aria-label="Say it again">${artUi.replay()}</button>
      </div>
      <div class="stage" id="stage"></div>
    </section>`;
  $("#home-btn").onclick = () => { sfxTap(); goHome(); };

  const promptText = $("#prompt-text");
  const sayBtn = $("#say-btn");
  let lastSpoken = "";
  const prompt = {
    set(html, spoken) { promptText.innerHTML = html; lastSpoken = spoken || html; },
  };
  sayBtn.onclick = () => { sfxTap(); say(lastSpoken); };

  const api = {
    say, sfxTap, sfxCorrect, sfxTryAgain, sfxCelebrate, sfxCount,
    rand, sample,
    reward: (msg, next) => reward(msg, rand(room.praise), next),
  };
  current = room.game($("#stage"), prompt, api);
}

/* ---------- reward ---------- */
function ensureReward() {
  if (rewardEl) return rewardEl;
  rewardEl = document.createElement("div");
  rewardEl.className = "reward";
  rewardEl.innerHTML = `
    <div class="reward__card">
      <div class="reward__art" id="reward-art"></div>
      <div class="reward__text" id="reward-text">Great job!</div>
      <div class="reward__stars" id="reward-stars"></div>
    </div>`;
  document.body.appendChild(rewardEl);
  return rewardEl;
}

function reward(label, praise, next) {
  stars++;
  document.querySelectorAll("#star-count").forEach((n) => (n.textContent = stars));

  const el = ensureReward();
  $("#reward-art", el).innerHTML = randomReward();
  $("#reward-text", el).textContent = praise;
  const lit = 1 + (stars % 3);
  $("#reward-stars", el).innerHTML = [0, 1, 2].map((i) => artStar(i < lit)).join("");
  el.classList.add("is-show");
  burst(90);
  sfxCelebrate();
  say(`${label} ${praise}`);

  setTimeout(() => {
    el.classList.remove("is-show");
    setTimeout(() => next && next(), 260);
  }, 1500);
}

/* ---------- service worker (prod) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

boot();
