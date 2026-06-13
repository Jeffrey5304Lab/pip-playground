/* ============================================================
   progress.js — Duolingo-style persistence (localStorage).
   Tracks per-room crowns, sticker collection, and a daily streak.
   All parent-friendly: no accounts, no network, stays on device.
   ============================================================ */

const KEY = "pip.save.v1";
const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);

function defaults() {
  return { crowns: {}, owned: [], streak: 0, best: 0, lastDay: null, stars: 0, lessons: 0 };
}
function load() {
  try {
    const s = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {});
    if (!Array.isArray(s.owned)) s.owned = [];   // migrate old saves
    return s;
  } catch { return defaults(); }
}

let state = load();

function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }

export function getState() { return state; }
export function crownsFor(roomId) { return state.crowns[roomId] || 0; }
export function totalCrowns() { return Object.values(state.crowns).reduce((a, b) => a + b, 0); }

export function addStars(n = 1) { state.stars += n; persist(); }

/* ---- sticker collection ---- */
export function ownedStickers() { return state.owned; }
export function ownsSticker(id) { return state.owned.includes(id); }
export function stickerCount() { return state.owned.length; }
export function awardSticker(id) {
  const isNew = !state.owned.includes(id);
  if (isNew) { state.owned.push(id); persist(); }
  return { isNew };
}

/** Call when a full lesson is finished. Returns what was earned. */
export function completeLesson(roomId) {
  state.crowns[roomId] = (state.crowns[roomId] || 0) + 1;
  state.lessons += 1;

  const t = today();
  let streakUp = false;
  if (state.lastDay !== t) {
    state.streak = state.lastDay === yesterday() ? state.streak + 1 : 1;
    state.lastDay = t;
    state.best = Math.max(state.best, state.streak);
    streakUp = true;
  }
  persist();
  return {
    crowns: state.crowns[roomId],
    streak: state.streak,
    streakUp,
  };
}
