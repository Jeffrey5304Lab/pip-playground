/* ============================================================
   app.js — Pip's Playground shell: gate, router, hub, lessons.
   Duolingo-style progression: each room is a 5-question lesson
   with a progress bar, snappy per-answer feedback, and a big
   "lesson complete" payoff that awards crowns, stickers & streak.
   ============================================================ */
import { pipSVG } from "./mascot.js";
import { icon as artIcon, ui as artUi, star as artStar, STICKERS, stickerArt, stickerName } from "./art.js";
import { initConfetti, burst } from "./confetti.js";
import {
  unlockAudio, loadMutePref, setMuted, isMuted,
  loadBilingualPref, isBilingual, setBilingual,
  say, cheer, sfxTap, sfxCorrect, sfxTryAgain, sfxCelebrate, sfxCount, sfxSticker,
  sfxLevelUp, sfxStreak, sfxCombo, haptic,
} from "./audio.js";
import {
  crownsFor, totalCrowns, getState, completeLesson, addStars,
  ownsSticker, stickerCount, awardSticker, resetProgress,
} from "./progress.js";
import { colorsGame } from "./games/colors.js";
import { shapesGame } from "./games/shapes.js";
import { countingGame } from "./games/counting.js";
import { animalsGame } from "./games/animals.js";
import { lettersGame } from "./games/letters.js";
import { wordsGame } from "./games/words.js";
import { patternsGame } from "./games/patterns.js";
import { casematchGame } from "./games/casematch.js";
import { sightwordsGame } from "./games/sightwords.js";
import { count10Game } from "./games/count10.js";
import { fruitsGame } from "./games/fruits.js";

const $ = (s, r = document) => r.querySelector(s);
const LESSON_LEN = 5;

const ROOMS = [
  { id: "colors",  label: "Colors",  icon: artIcon.colors,  cls: "room--colors",  color: "#ff5d5d", game: colorsGame,   praise: ["Great job!", "Wonderful!", "You did it!"] },
  { id: "shapes",  label: "Shapes",  icon: artIcon.shapes,  cls: "room--shapes",  color: "#3d8bff", game: shapesGame,   praise: ["Awesome!", "Nice!", "Yay!"] },
  { id: "count",   label: "Numbers", icon: artIcon.numbers, cls: "room--count",   color: "#34c46e", game: countingGame, praise: ["Perfect!", "Well done!", "Hooray!"] },
  { id: "animals", label: "Animals", icon: artIcon.animals, cls: "room--animals", color: "#a25dff", game: animalsGame,  praise: ["Yay!", "So good!", "You got it!"] },
  { id: "letters", label: "ABC",     icon: artIcon.letters, cls: "room--letters", color: "#ff9233", game: lettersGame,  praise: ["Brilliant!", "Super!", "Way to go!"] },
  { id: "words",   label: "Words",   icon: artIcon.words,   cls: "room--words",   color: "#ff6fae", game: wordsGame,    praise: ["Lovely!", "Great!", "You did it!"] },
  { id: "pattern",   label: "Patterns",   icon: artIcon.patterns,   cls: "room--pattern",   color: "#28b8b0", game: patternsGame,   praise: ["Clever!", "Smart!", "Amazing!"] },
  { id: "casematch", label: "ABC Match",  icon: artIcon.casematch,  cls: "room--casematch", color: "#c25be8", game: casematchGame,  praise: ["Perfect match!", "You got it!", "Brilliant!"] },
  { id: "sightwords",label: "Sight Words",icon: artIcon.sightwords, cls: "room--sightwords",color: "#1ab8a0", game: sightwordsGame, praise: ["Good reading!", "You can read!", "Amazing!"] },
  { id: "count10",   label: "Count to 10",icon: artIcon.count10,   cls: "room--count10",   color: "#2563eb", game: count10Game,   praise: ["You counted it!", "Perfect!", "So smart!"] },
  { id: "fruits",    label: "Fruits",     icon: artIcon.fruits,    cls: "room--fruits",    color: "#f7921c", game: fruitsGame,    praise: ["Yummy!", "That's right!", "Great job!"] },
];

const NODES_PER_WORLD = 3;

/* Subjects group the rooms into a few big, parent-recognisable shelves.
   The home screen shows these; tapping one reveals its games. No locks —
   every game is always free to play. */
const SUBJECTS = [
  { id: "english", label: "English",          color: "#ff9233", icon: artIcon.subjEnglish, rooms: ["letters", "words", "casematch", "sightwords"] },
  { id: "numbers", label: "Numbers",          color: "#34c46e", icon: artIcon.numbers,     rooms: ["count", "count10"] },
  { id: "colors",  label: "Colors & Shapes",  color: "#3d8bff", icon: artIcon.subjColors,  rooms: ["colors", "shapes", "pattern"] },
  { id: "nature",  label: "Animals & Fruits", color: "#a25dff", icon: artIcon.subjAnimals, rooms: ["animals", "fruits"] },
];
const subjRooms = (subj) => subj.rooms.map((id) => ROOMS.find((r) => r.id === id));

let app, soundBtn, current = null, lesson = null, currentSubject = null;

/* ---- toddler scaffolding: never-stuck hint + idle nudge ----
   Games register their correct choice via api.setCorrect(el). After two
   wrong taps we gently spotlight it (errorless learning); after a few idle
   seconds we re-speak the prompt and bob it back into attention. */
let roundCorrectEl = null, roundWrongN = 0, idleTimer = null, roundSpoken = "", coachEl = null;
const IDLE_MS = 6000;
function clearScaffold() {
  clearTimeout(idleTimer); idleTimer = null;
  if (roundCorrectEl) roundCorrectEl.classList.remove("is-hint", "is-nudge");
  roundCorrectEl = null; roundWrongN = 0;
  hideCoach();
}

/* First-ever lesson: a bobbing hand points at the correct choice so the
   child learns the tap gesture. Shown until their first tap, then never again. */
function hideCoach() { if (coachEl) { coachEl.remove(); coachEl = null; } }
function showCoach(el) {
  if (!el) return;
  hideCoach();
  const r = el.getBoundingClientRect();
  coachEl = document.createElement("div");
  coachEl.className = "tap-coach";
  coachEl.innerHTML = artUi.hand();
  coachEl.style.left = `${r.left + r.width / 2}px`;
  coachEl.style.top = `${r.top + r.height * 0.58}px`;
  document.body.appendChild(coachEl);
}
function dismissCoach() {
  if (coachEl || !localStorage.getItem("pip.coached")) {
    try { localStorage.setItem("pip.coached", "1"); } catch (_) {}
    hideCoach();
  }
}
function armIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!lesson || !roundCorrectEl) return;
    say(roundSpoken);
    roundCorrectEl.classList.remove("is-nudge"); void roundCorrectEl.offsetWidth;
    roundCorrectEl.classList.add("is-nudge");
    armIdle();                       // keep gently reminding
  }, IDLE_MS);
}

/* ---------- helpers passed to games ---------- */
const rand = (arr) => arr[(Math.random() * arr.length) | 0];
function sample(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

/** Require a deliberate hold (not a tap) before firing — a simple parent gate
   a toddler won't stumble into by accident. Shows a filling pie as feedback. */
const HOLD_MS = 1100;
function attachHoldToOpen(btn, onComplete) {
  let timer = null, raf = null, start = 0;
  function tick() {
    const t = Math.min(1, (performance.now() - start) / HOLD_MS);
    btn.style.setProperty("--p", t);
    if (t < 1) raf = requestAnimationFrame(tick);
  }
  function down(e) {
    e.preventDefault();
    start = performance.now();
    btn.classList.add("is-holding");
    raf = requestAnimationFrame(tick);
    timer = setTimeout(() => { cancel(); onComplete(); }, HOLD_MS);
  }
  function cancel() {
    clearTimeout(timer); timer = null;
    if (raf) cancelAnimationFrame(raf);
    btn.classList.remove("is-holding");
    btn.style.setProperty("--p", 0);
  }
  btn.addEventListener("pointerdown", down);
  btn.addEventListener("pointerup", cancel);
  btn.addEventListener("pointerleave", cancel);
  btn.addEventListener("pointercancel", cancel);
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
  loadBilingualPref();
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
function clearGame() { clearScaffold(); if (current && current.destroy) current.destroy(); current = null; lesson = null; }

/** Re-trigger the view-enter transition on the freshly painted screen. */
function flashView() { app.classList.remove("view-enter"); void app.offsetWidth; app.classList.add("view-enter"); }

/* ---------- home: the subject shelf ---------- */
function goHome() {
  clearGame();
  currentSubject = null;
  say("Pick a subject!");

  app.innerHTML = `
    <header class="topbar topbar--home">
      <div class="topbar__spacer"></div>
      <button class="icon-btn" id="book-btn" aria-label="Sticker book">${artUi.book()}</button>
      <button class="icon-btn icon-btn--hold" id="parent-btn" aria-label="Hold for parent area">${artUi.settings()}</button>
    </header>
    <div class="home-hero">
      <span class="home-hero__pip">${pipSVG({ size: 52 })}</span>
      <span class="home-hero__msg">Pick a game!</span>
    </div>
    <section class="subject-grid" id="subject-grid">
      ${SUBJECTS.map(subjectCardHTML).join("")}
    </section>`;

  $("#book-btn").onclick = () => { sfxTap(); openBook(); };
  attachHoldToOpen($("#parent-btn"), () => { haptic([0, 30, 40, 60]); sfxLevelUp(); openParentArea(); });
  app.querySelectorAll(".subject-card").forEach((card) => {
    const subj = SUBJECTS.find((s) => s.id === card.dataset.subject);
    card.onclick = () => { sfxTap(); openSubject(subj); };
  });

  flashView();
}

function subjectCardHTML(subj) {
  const rooms = subjRooms(subj);
  const total = rooms.length * NODES_PER_WORLD;
  const done  = rooms.reduce((a, r) => a + Math.min(crownsFor(r.id), NODES_PER_WORLD), 0);
  const isDone = done >= total;
  const badge = isDone ? `<span class="room-card__badge room-card__badge--done">${artUi.crown()}Done!</span>` : "";
  return `
    <button class="room-card subject-card${isDone ? " is-complete" : ""}" data-subject="${subj.id}"
            style="--world:${subj.color}" aria-label="${subj.label}, ${rooms.length} games">
      ${badge}
      <div class="room-card__icon room-card__icon--big">${subj.icon()}</div>
      <div class="room-card__name">${subj.label}</div>
      <div class="subject-card__sub">${rooms.length} games</div>
    </button>`;
}

/* ---------- inside a subject: pick a game ---------- */
function openSubject(subj) {
  clearGame();
  currentSubject = subj;
  say(`${subj.label}! Pick a game!`);
  const rooms = subjRooms(subj);

  app.innerHTML = `
    <header class="topbar topbar--lesson">
      <button class="icon-btn icon-btn--close" id="subj-back" aria-label="Back to subjects">${artUi.back()}</button>
      <div class="title-chip"><span class="title-chip__icon">${subj.icon()}</span>${subj.label}</div>
      <div class="topbar__spacer"></div>
    </header>
    <section class="room-grid" id="room-grid" style="--world:${subj.color}">
      ${rooms.map(roomCardHTML).join("")}
    </section>`;

  $("#subj-back").onclick = () => { sfxTap(); goHome(); };
  app.querySelectorAll(".room-card").forEach((card) => {
    const room = ROOMS.find((r) => r.id === card.dataset.room);
    card.onclick = () => { sfxTap(); openRoom(room); };
  });

  flashView();
}

/** Return from a finished/closed lesson to wherever the child was browsing. */
function backToBrowse() { if (currentSubject) openSubject(currentSubject); else goHome(); }

function roomCardHTML(room) {
  const done = Math.min(crownsFor(room.id), NODES_PER_WORLD);
  const isNew   = done === 0;
  const isDone  = done >= NODES_PER_WORLD;
  const stars   = Array.from({ length: NODES_PER_WORLD }, (_, i) => artStar(i < done)).join("");
  const badge   = isNew  ? `<span class="room-card__badge room-card__badge--new">NEW</span>`
                : isDone ? `<span class="room-card__badge room-card__badge--done">${artUi.crown()}Done!</span>`
                : "";
  return `
    <button class="room-card${isDone ? " is-complete" : ""}" data-room="${room.id}"
            style="--world:${room.color}" aria-label="${room.label}">
      ${badge}
      <div class="room-card__stars">${stars}</div>
      <div class="room-card__icon">${room.icon()}</div>
      <div class="room-card__name">${room.label}</div>
    </button>`;
}

/* ---------- sticker book ---------- */
function openBook() {
  clearGame();
  const total = STICKERS.length, got = stickerCount();
  say(got ? "Your sticker book!" : "Win lessons to collect stickers!");
  app.innerHTML = `
    <header class="topbar topbar--lesson">
      <button class="icon-btn icon-btn--close" id="book-back" aria-label="Back to map">${artUi.back()}</button>
      <div class="title-chip"><span class="title-chip__icon">${artUi.book()}</span>Stickers</div>
      <div class="topbar__spacer"></div>
      <span class="stat-chip"><span id="book-count">${got}</span>/${total}</span>
    </header>
    <section class="book" id="book"></section>`;
  $("#book-back").onclick = () => { sfxTap(); goHome(); };
  const book = $("#book");
  STICKERS.forEach((s, i) => {
    const owned = ownsSticker(s.id);
    const slot = document.createElement("button");
    slot.className = "sticker-slot" + (owned ? " is-owned" : " is-locked");
    slot.style.animationDelay = `${i * 35}ms`;
    slot.setAttribute("aria-label", owned ? s.name : "locked sticker");
    slot.innerHTML = `<span class="sticker-slot__art">${s.art()}</span>
                      <span class="sticker-slot__name">${owned ? s.name : "?"}</span>`;
    if (owned) slot.onclick = () => { sfxTap(); cheer(s.name); };
    else slot.onclick = () => { sfxTryAgain(); };
    book.appendChild(slot);
  });
  flashView();
}

/* ---------- parent area ---------- */
function openParentArea() {
  clearGame();
  const s = getState();
  app.innerHTML = `
    <header class="topbar topbar--lesson">
      <button class="icon-btn icon-btn--close" id="parent-back" aria-label="Back to map">${artUi.back()}</button>
      <div class="title-chip"><span class="title-chip__icon">${artUi.settings()}</span>Parent Area</div>
      <div class="topbar__spacer"></div>
    </header>
    <section class="parent" id="parent">
      <div class="parent-stats">
        ${statCard(artUi.crown(), totalCrowns(), "Crowns")}
        ${statCard(artUi.book(), `${stickerCount()}/${STICKERS.length}`, "Stickers")}
        ${statCard(artUi.flame(), s.streak, "Day streak")}
      </div>
      <div class="parent-card parent-card--setting">
        <div class="setting-row">
          <div class="setting-row__text">
            <div class="setting-row__title">中文引導 · Chinese guidance</div>
            <div class="setting-row__sub">先用中文說明，再念英文單字（適合學齡前）</div>
          </div>
          <button class="toggle" id="bilingual-toggle" role="switch"
                  aria-label="Chinese guidance" aria-checked="${isBilingual()}"></button>
        </div>
      </div>
      <div class="parent-card">
        <p class="parent-card__text">Progress is saved only on this device — no
          accounts, no internet connection, nothing collected.</p>
        <button class="big-btn big-btn--danger" id="reset-btn">
          <span class="big-btn__label">Reset All Progress</span></button>
        <a class="parent-card__link" href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>
      </div>
    </section>`;
  $("#parent-back").onclick = () => { sfxTap(); goHome(); };

  const biToggle = $("#bilingual-toggle");
  biToggle.classList.toggle("is-on", isBilingual());
  biToggle.onclick = () => {
    const next = !isBilingual();
    setBilingual(next);
    biToggle.classList.toggle("is-on", next);
    biToggle.setAttribute("aria-checked", String(next));
    sfxTap();
    if (next) say("Find the red one!");   // a quick taste of the bilingual voice
  };

  const resetBtn = $("#reset-btn");
  const label = resetBtn.querySelector(".big-btn__label");
  let confirming = false, revertTimer = null;
  resetBtn.onclick = () => {
    if (!confirming) {
      confirming = true;
      resetBtn.classList.add("is-confirm");
      label.textContent = "Tap again to confirm";
      sfxTryAgain();
      revertTimer = setTimeout(() => {
        confirming = false;
        resetBtn.classList.remove("is-confirm");
        label.textContent = "Reset All Progress";
      }, 4000);
      return;
    }
    clearTimeout(revertTimer);
    resetProgress();
    sfxTap();
    goHome();
  };
  flashView();
}

function openRoom(room) {
  clearGame();
  lesson = { room, total: LESSON_LEN, done: 0, combo: 0 };
  app.innerHTML = `
    <header class="topbar topbar--lesson">
      <button class="icon-btn icon-btn--close" id="home-btn" aria-label="Close lesson">${artUi.close()}</button>
      <div class="lesson-bar"><div class="lesson-fill" id="lesson-fill"></div></div>
      <span class="combo-badge" id="combo-badge" aria-hidden="true">${artUi.flame()}<span id="combo-n">2</span></span>
    </header>
    <section class="play" style="--world:${room.color}">
      <div class="prompt"><span id="prompt-text"></span>
        <button class="prompt__say" id="say-btn" aria-label="Say it again">${artUi.replay()}</button>
      </div>
      <div class="stage" id="stage"></div>
    </section>`;
  $("#home-btn").onclick = () => { sfxTap(); backToBrowse(); };
  flashView();

  const promptText = $("#prompt-text");
  const prompt = { set(html, spoken) { promptText.innerHTML = html; roundSpoken = spoken || html; } };
  $("#say-btn").onclick = () => { sfxTap(); say(roundSpoken); };

  const api = {
    say, sfxTap, sfxCorrect, sfxTryAgain, sfxCelebrate, sfxCount,
    rand, sample,
    // First two questions show 2 choices (easier for the youngest), then 3.
    choices: () => (lesson && lesson.done < 2 ? 2 : 3),
    // Register the round's correct element so the engine can spotlight it.
    setCorrect: (el) => {
      clearTimeout(idleTimer); roundCorrectEl = el; roundWrongN = 0; armIdle();
      // first-ever question: point a hand at the answer to teach "tap"
      if (el && lesson && lesson.done === 0 && !localStorage.getItem("pip.coached")) {
        setTimeout(() => { if (roundCorrectEl === el) { showCoach(el); el.classList.add("is-nudge"); } }, 600);
      }
    },
    reward: (label, next) => onCorrect(label, next),
    wrong: () => onWrong(),
  };
  current = room.game($("#stage"), prompt, api);
}

/* ---------- per-answer feedback + lesson flow ---------- */
function onCorrect(label, next) {
  if (!lesson) return;
  lesson.done++;
  lesson.combo++;
  addStars(1);
  haptic(14);

  const fill = $("#lesson-fill");
  if (fill) fill.style.width = `${(lesson.done / lesson.total) * 100}%`;

  dismissCoach();
  clearScaffold();
  const combo = lesson.combo;
  updateCombo(combo);
  flashPraise(label);
  burst(combo >= 3 ? 42 : 28);
  // a wrong tap resets the combo, so "N in a row" is genuinely earned
  if (combo >= 2) sfxCombo(combo);
  // standalone combo shout at a streak (its own natural clip), else the label
  cheer(combo >= 3 ? `${combo} in a row!` : label);

  // In bilingual mode the spoken reward is "中文！English!" (~1.7s); give it room
  // to finish before the next prompt cancels it, so the reinforcement is heard.
  const finished = lesson.done >= lesson.total;
  const gap = finished ? 650 : (isBilingual() ? 1150 : 700);
  setTimeout(() => {
    if (finished) lessonComplete(lesson.room);
    else if (next) next();
  }, gap);
}

function onWrong() {
  if (!lesson) return;
  dismissCoach();
  lesson.combo = 0;
  updateCombo(0);
  haptic(10);
  // errorless learning: after two misses, gently spotlight the right one
  roundWrongN++;
  if (roundWrongN >= 2 && roundCorrectEl) roundCorrectEl.classList.add("is-hint");
  armIdle();
}

function updateCombo(n) {
  const badge = $("#combo-badge");
  if (!badge) return;
  if (n >= 2) {
    $("#combo-n").textContent = n;
    badge.classList.add("is-on");
    badge.classList.remove("is-pop"); void badge.offsetWidth; badge.classList.add("is-pop");
  } else {
    badge.classList.remove("is-on", "is-pop");
  }
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
      <div class="sticker-reveal" id="done-sticker"></div>
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

  // award a sticker — prefer one the child doesn't have yet
  const unowned = STICKERS.filter((s) => !ownsSticker(s.id));
  const stk = rand(unowned.length ? unowned : STICKERS);
  const isNew = awardSticker(stk.id).isNew;

  const el = ensureDone();
  $("#done-pip", el).innerHTML = pipSVG({ size: 132, expression: "cheer" });
  $("#done-sticker", el).innerHTML = `
    <div class="sticker-reveal__badge"><span class="sticker-reveal__art">${stk.art()}</span></div>
    <div class="sticker-reveal__label">${isNew ? "New sticker!" : "Sticker!"} <b>${stk.name}</b></div>`;
  $("#done-stats", el).innerHTML =
    statCard(artUi.crown(), `${earned.crowns}`, "Crowns", "stat-card--crown") +
    statCard(artStar(true), `${lesson.total}/${lesson.total}`, "Correct", "stat-card--star") +
    statCard(artUi.flame(), `${earned.streak}`, "Day streak", "stat-card--streak");

  el.classList.add("is-show");
  burst(150);
  haptic([0, 40, 50, 90]);
  sfxCelebrate();
  setTimeout(sfxLevelUp, 260);                 // crown earned
  if (earned.streakUp) setTimeout(sfxStreak, 700);
  setTimeout(sfxSticker, 1000);                // sticker reveal shimmer
  cheer(`Lesson complete! ${isNew ? "You got a new sticker, the " + stk.name + "!" : rand(room.praise)}`);

  $("#lesson-continue", el).onclick = () => {
    sfxTap();
    el.classList.remove("is-show");
    backToBrowse();
  };
}

/* ---------- service worker (prod) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

boot();
