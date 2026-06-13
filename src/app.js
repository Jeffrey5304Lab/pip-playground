/* ============================================================
   app.js — Pip's Playground shell: gate, router, hub, lessons.
   Duolingo-style progression: each room is a 5-question lesson
   with a progress bar, snappy per-answer feedback, and a big
   "lesson complete" payoff that awards crowns, stickers & streak.
   ============================================================ */
import { pipSVG } from "./mascot.js";
import { icon as artIcon, ui as artUi, star as artStar } from "./art.js";
import { initConfetti, burst } from "./confetti.js";
import {
  unlockAudio, loadMutePref, setMuted, isMuted,
  say, cheer, sfxTap, sfxCorrect, sfxTryAgain, sfxCelebrate, sfxCount,
} from "./audio.js";
import { crownsFor, totalCrowns, getState, completeLesson, addStars } from "./progress.js";
import { colorsGame } from "./games/colors.js";
import { shapesGame } from "./games/shapes.js";
import { countingGame } from "./games/counting.js";
import { animalsGame } from "./games/animals.js";
import { lettersGame } from "./games/letters.js";
import { wordsGame } from "./games/words.js";
import { patternsGame } from "./games/patterns.js";

const $ = (s, r = document) => r.querySelector(s);
const LESSON_LEN = 5;

const ROOMS = [
  { id: "colors",  label: "Colors",  icon: artIcon.colors,  cls: "room--colors",  game: colorsGame,   praise: ["Great job!", "Wonderful!", "You did it!"] },
  { id: "shapes",  label: "Shapes",  icon: artIcon.shapes,  cls: "room--shapes",  game: shapesGame,   praise: ["Awesome!", "Nice!", "Yay!"] },
  { id: "count",   label: "Numbers", icon: artIcon.numbers, cls: "room--count",   game: countingGame, praise: ["Perfect!", "Well done!", "Hooray!"] },
  { id: "animals", label: "Animals", icon: artIcon.animals, cls: "room--animals", game: animalsGame,  praise: ["Yay!", "So good!", "You got it!"] },
  { id: "letters", label: "ABC",     icon: artIcon.letters, cls: "room--letters", game: lettersGame,  praise: ["Brilliant!", "Super!", "Way to go!"] },
  { id: "words",   label: "Words",   icon: artIcon.words,   cls: "room--words",   game: wordsGame,    praise: ["Lovely!", "Great!", "You did it!"] },
  { id: "pattern", label: "Patterns",icon: artIcon.patterns,cls: "room--pattern", game: patternsGame, praise: ["Clever!", "Smart!", "Amazing!"] },
];

let app, soundBtn, current = null, lesson = null;

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
  $("#gate-mascot").innerHTML = pipSVG({ size: 170 });
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

function reflectMute() { soundBtn.classList.toggle("is-muted", isMuted()); }

function start() {
  unlockAudio();
  const gate = $("#gate");
  gate.classList.add("is-hidden");
  setTimeout(() => gate.remove(), 500);
  app.hidden = false;
  soundBtn.hidden = false;
  sfxCorrect();
  goHome();
}

/* ---------- views ---------- */
function clearGame() { if (current && current.destroy) current.destroy(); current = null; lesson = null; }

function goHome() {
  clearGame();
  say("Pick a game!");
  const s = getState();
  app.innerHTML = `
    <header class="topbar topbar--home">
      <span class="stat-chip stat-chip--streak">${artUi.flame()}<span>${s.streak}</span></span>
      <span class="stat-chip stat-chip--crown">${artUi.crown()}<span>${totalCrowns()}</span></span>
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
    const c = crownsFor(room.id);
    const b = document.createElement("button");
    b.className = `room-card ${room.cls}`;
    b.setAttribute("aria-label", room.label);
    b.innerHTML = `
      ${c ? `<span class="crown-badge">${artUi.crown()}<span>${c}</span></span>` : ""}
      <span class="room-card__icon" aria-hidden="true">${room.icon()}</span>
      <span class="room-card__label">${room.label}</span>`;
    b.onclick = () => { sfxTap(); openRoom(room); };
    grid.appendChild(b);
  }
}

function openRoom(room) {
  clearGame();
  lesson = { room, total: LESSON_LEN, done: 0 };
  app.innerHTML = `
    <header class="topbar topbar--lesson">
      <button class="icon-btn icon-btn--close" id="home-btn" aria-label="Close lesson">${artUi.close()}</button>
      <div class="lesson-bar"><div class="lesson-fill" id="lesson-fill"></div></div>
    </header>
    <section class="play">
      <div class="prompt"><span id="prompt-text"></span>
        <button class="prompt__say" id="say-btn" aria-label="Say it again">${artUi.replay()}</button>
      </div>
      <div class="stage" id="stage"></div>
    </section>`;
  $("#home-btn").onclick = () => { sfxTap(); goHome(); };

  const promptText = $("#prompt-text");
  let lastSpoken = "";
  const prompt = { set(html, spoken) { promptText.innerHTML = html; lastSpoken = spoken || html; } };
  $("#say-btn").onclick = () => { sfxTap(); say(lastSpoken); };

  const api = {
    say, sfxTap, sfxCorrect, sfxTryAgain, sfxCelebrate, sfxCount,
    rand, sample,
    reward: (label, next) => onCorrect(label, next),
  };
  current = room.game($("#stage"), prompt, api);
}

/* ---------- per-answer feedback + lesson flow ---------- */
function onCorrect(label, next) {
  if (!lesson) return;
  lesson.done++;
  addStars(1);

  const fill = $("#lesson-fill");
  if (fill) fill.style.width = `${(lesson.done / lesson.total) * 100}%`;

  // games already play sfxCorrect on the correct tap; we add voice + visual juice
  cheer(label);
  flashPraise(label);
  burst(28);

  const finished = lesson.done >= lesson.total;
  setTimeout(() => {
    if (finished) lessonComplete(lesson.room);
    else if (next) next();
  }, finished ? 650 : 700);
}

let praiseEl = null;
function flashPraise(label) {
  if (!praiseEl) {
    praiseEl = document.createElement("div");
    praiseEl.className = "pop-praise";
    document.body.appendChild(praiseEl);
  }
  praiseEl.innerHTML = `<span class="pop-praise__star">${artStar(true)}</span><span>${label}</span>`;
  praiseEl.classList.remove("is-show"); void praiseEl.offsetWidth; praiseEl.classList.add("is-show");
}

/* ---------- lesson complete ---------- */
let doneEl = null;
function ensureDone() {
  if (doneEl) return doneEl;
  doneEl = document.createElement("div");
  doneEl.className = "lesson-done";
  doneEl.innerHTML = `
    <div class="lesson-done__card">
      <div class="lesson-done__pip" id="done-pip"></div>
      <div class="lesson-done__title">Lesson Complete!</div>
      <div class="lesson-done__stats" id="done-stats"></div>
      <button class="big-btn" id="lesson-continue"><span class="big-btn__label">Continue</span></button>
    </div>`;
  document.body.appendChild(doneEl);
  return doneEl;
}

function statCard(icon, val, label, cls = "") {
  return `<div class="stat-card ${cls}"><div class="stat-card__icon">${icon}</div>
          <div class="stat-card__val">${val}</div><div class="stat-card__label">${label}</div></div>`;
}

function lessonComplete(room) {
  const earned = completeLesson(room.id);
  const el = ensureDone();
  $("#done-pip", el).innerHTML = pipSVG({ size: 132 });
  $("#done-stats", el).innerHTML =
    statCard(artUi.crown(), `${earned.crowns}`, "Crowns", "stat-card--crown") +
    statCard(artStar(true), `${lesson.total}/${lesson.total}`, "Correct", "stat-card--star") +
    statCard(artUi.flame(), `${earned.streak}`, "Day streak", "stat-card--streak");

  el.classList.add("is-show");
  burst(140);
  sfxCelebrate();
  cheer(`Lesson complete! ${rand(room.praise)}`);

  $("#lesson-continue", el).onclick = () => {
    sfxTap();
    el.classList.remove("is-show");
    goHome();
  };
}

/* ---------- service worker (prod) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

boot();
