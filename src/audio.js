/* ============================================================
   audio.js — sound effects + English voice
   No audio files: SFX are synthesized with Web Audio, and
   speech uses the built-in SpeechSynthesis voice. Works offline.
   ============================================================ */

let ctx = null;
let muted = false;
let unlocked = false;
let preferredVoice = null;

const MUTE_KEY = "pip.muted";

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

/** Must be called from a user gesture (the start button). */
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
  // Nudge speech engine awake on iOS/Safari.
  if ("speechSynthesis" in window) {
    try {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0; window.speechSynthesis.speak(u);
    } catch (_) {}
  }
  unlocked = true;
}

export function isMuted() { return muted; }

export function loadMutePref() {
  muted = localStorage.getItem(MUTE_KEY) === "1";
  return muted;
}

export function setMuted(value) {
  muted = value;
  localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  if (muted && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/* ---------- Voice selection ----------
   Score English voices so we land on the warmest, highest-quality voice the
   device actually ships (Apple "Enhanced/Premium" neural voices, Google voices),
   which is the closest thing to human-sounding without any audio downloads. */
function scoreVoice(v) {
  let s = 0;
  const n = v.name.toLowerCase();
  if (/premium|enhanced|neural|natural/.test(n)) s += 60;      // high-quality variants
  if (/(^|\b)(samantha|ava|allison|susan|zoe|nicky|joelle|jenny|aria)\b/.test(n)) s += 30; // pleasant US female voices
  if (/google (us|uk) english/.test(n)) s += 28;
  if (/karen|moira|tessa|fiona|serena/.test(n)) s += 18;       // pleasant en-* voices
  if (/en-us/i.test(v.lang)) s += 12; else if (/^en/i.test(v.lang)) s += 6;
  if (/female/.test(n)) s += 8;
  if (/male|fred|albert|zarvox|whisper|bells|trinoids|cellos|junior/.test(n)) s -= 25; // novelty/robotic
  return s;
}
function pickVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  return pool.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
}

if ("speechSynthesis" in window) {
  preferredVoice = pickVoice();
  window.speechSynthesis.onvoiceschanged = () => { preferredVoice = pickVoice(); };
}

/**
 * Speak an English phrase warmly and slowly for little ears.
 * @returns {Promise<void>} resolves when speech ends (or immediately if muted)
 */
export function say(text, { rate = 0.92, pitch = 1.15, onend } = {}) {
  return new Promise((resolve) => {
    if (muted || !("speechSynthesis" in window) || !text) { onend?.(); resolve(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (preferredVoice) { u.voice = preferredVoice; u.lang = preferredVoice.lang; }
    else u.lang = "en-US";
    u.rate = rate; u.pitch = pitch; u.volume = 1;
    const done = () => { onend?.(); resolve(); };
    u.onend = done; u.onerror = done;
    window.speechSynthesis.speak(u);
  });
}

/** Excited, sing-song delivery for praise/celebration. */
export function cheer(text) {
  return say(text, { rate: 1.0, pitch: 1.3 });
}

/** Calm, clear delivery for a single word/letter (e.g. phonics). */
export function sayWord(text) {
  return say(text, { rate: 0.84, pitch: 1.1 });
}

/* ---------- Synthesized sound effects ---------- */
function tone(freq, start, dur, { type = "sine", gain = 0.18, slideTo } = {}) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(c.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
}

function play(notes) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  notes.forEach((n) => tone(n.f, n.t, n.d, n));
}

/** Soft tap/pop for any touch. */
export function sfxTap() {
  play([{ f: 320, t: 0, d: 0.12, type: "triangle", gain: 0.16, slideTo: 540 }]);
}

/** Happy rising chime for a correct choice. */
export function sfxCorrect() {
  play([
    { f: 523, t: 0, d: 0.14, type: "triangle", gain: 0.2 },
    { f: 659, t: 0.1, d: 0.14, type: "triangle", gain: 0.2 },
    { f: 784, t: 0.2, d: 0.22, type: "triangle", gain: 0.22 },
  ]);
}

/** Gentle, non-scary "try again" — never a harsh buzzer. */
export function sfxTryAgain() {
  play([
    { f: 300, t: 0, d: 0.14, type: "sine", gain: 0.14 },
    { f: 250, t: 0.1, d: 0.16, type: "sine", gain: 0.14 },
  ]);
}

/** Big celebration arpeggio. */
export function sfxCelebrate() {
  play([
    { f: 523, t: 0, d: 0.16, type: "triangle", gain: 0.22 },
    { f: 659, t: 0.12, d: 0.16, type: "triangle", gain: 0.22 },
    { f: 784, t: 0.24, d: 0.16, type: "triangle", gain: 0.22 },
    { f: 1046, t: 0.36, d: 0.3, type: "triangle", gain: 0.24 },
  ]);
}

/** A tiny counting "blip" rising with the number. */
export function sfxCount(n) {
  const base = 440 + n * 70;
  play([{ f: base, t: 0, d: 0.13, type: "square", gain: 0.12 }]);
}

/** Sparkly "you got a sticker!" shimmer. */
export function sfxSticker() {
  play([
    { f: 880, t: 0, d: 0.1, type: "sine", gain: 0.16 },
    { f: 1175, t: 0.08, d: 0.1, type: "sine", gain: 0.16 },
    { f: 1568, t: 0.16, d: 0.12, type: "sine", gain: 0.18 },
    { f: 2093, t: 0.26, d: 0.18, type: "sine", gain: 0.16 },
  ]);
}

/** Triumphant level-up stab (major chord) for earning a crown. */
export function sfxLevelUp() {
  play([
    { f: 523, t: 0, d: 0.32, type: "triangle", gain: 0.18 },
    { f: 659, t: 0, d: 0.32, type: "triangle", gain: 0.16 },
    { f: 784, t: 0, d: 0.34, type: "triangle", gain: 0.16 },
    { f: 1046, t: 0.14, d: 0.3, type: "triangle", gain: 0.18 },
  ]);
}

/** Bright "ding-ding" for a growing daily streak. */
export function sfxStreak() {
  play([
    { f: 988, t: 0, d: 0.12, type: "sine", gain: 0.16 },
    { f: 1319, t: 0.12, d: 0.18, type: "sine", gain: 0.18 },
  ]);
}

/** Escalating "combo" blip — pitch rises with the streak length. */
export function sfxCombo(n) {
  const base = 660 + Math.min(n, 6) * 90;
  play([{ f: base, t: 0, d: 0.12, type: "triangle", gain: 0.15 },
        { f: base * 1.5, t: 0.08, d: 0.12, type: "triangle", gain: 0.13 }]);
}

/** Haptic buzz on supported devices. Silenced by mute, skipped if reduced-motion. */
export function haptic(pattern = 12) {
  if (muted || !("vibrate" in navigator)) return;
  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate(pattern);
  } catch (_) {}
}
