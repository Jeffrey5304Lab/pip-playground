/* ============================================================
   art.js — Pip's Playground bespoke vector art library.
   Hand-built SVG (no emoji, no external assets). One cohesive
   flat + soft-shade language: big friendly eyes, rosy cheeks,
   rounded forms. Flat fills only (no gradient <defs>) so the
   same character can be repeated on a page without id clashes.
   ============================================================ */

/* shared facial features for a consistent cast ---------------- */
function eyes(lx, rx, y, r = 7) {
  return `
    <circle cx="${lx}" cy="${y}" r="${r}" fill="#3d2f22"/>
    <circle cx="${lx + r * 0.34}" cy="${y - r * 0.36}" r="${r * 0.3}" fill="#fff"/>
    <circle cx="${rx}" cy="${y}" r="${r}" fill="#3d2f22"/>
    <circle cx="${rx + r * 0.34}" cy="${y - r * 0.36}" r="${r * 0.3}" fill="#fff"/>`;
}
function cheeks(lx, rx, y, r = 8) {
  return `
    <circle cx="${lx}" cy="${y}" r="${r}" fill="#ff8fa3" opacity="0.5"/>
    <circle cx="${rx}" cy="${y}" r="${r}" fill="#ff8fa3" opacity="0.5"/>`;
}
const wrap = (inner, label) =>
  `<svg viewBox="0 0 120 120" role="img" aria-label="${label}" class="art">${inner}</svg>`;

/* ---------------- ANIMALS ---------------- */
const animalArt = {
  cow: () => wrap(`
    <ellipse cx="26" cy="50" rx="13" ry="9" fill="#dfe7ee" transform="rotate(-28 26 50)"/>
    <ellipse cx="94" cy="50" rx="13" ry="9" fill="#dfe7ee" transform="rotate(28 94 50)"/>
    <path d="M42 32 q-7 -11 1 -15 q5 6 9 9z" fill="#f4dca6"/>
    <path d="M78 32 q7 -11 -1 -15 q-5 6 -9 9z" fill="#f4dca6"/>
    <ellipse cx="60" cy="62" rx="38" ry="35" fill="#fcfdff"/>
    <path d="M38 44 q13 -6 18 7 q-9 10 -20 3z" fill="#c9d3dd"/>
    <ellipse cx="84" cy="74" rx="11" ry="9" fill="#c9d3dd"/>
    <ellipse cx="60" cy="82" rx="24" ry="16" fill="#ffc3cf"/>
    <ellipse cx="51" cy="82" rx="3.4" ry="4.8" fill="#e9879e"/>
    <ellipse cx="69" cy="82" rx="3.4" ry="4.8" fill="#e9879e"/>
    ${eyes(49, 71, 60, 7)}${cheeks(40, 80, 73)}`, "cow"),

  dog: () => wrap(`
    <path d="M30 46 q-16 0 -16 26 q0 16 18 12 q4 -22 8 -32z" fill="#b07a4e"/>
    <path d="M90 46 q16 0 16 26 q0 16 -18 12 q-4 -22 -8 -32z" fill="#b07a4e"/>
    <ellipse cx="60" cy="60" rx="36" ry="33" fill="#e7b481"/>
    <path d="M60 30 q-24 6 -22 30 q22 8 44 0 q2 -24 -22 -30z" fill="#f3d3ad"/>
    <ellipse cx="60" cy="82" rx="18" ry="13" fill="#f7e4cd"/>
    <ellipse cx="60" cy="74" rx="7.5" ry="6" fill="#3d2f22"/>
    <path d="M60 80 q0 9 -8 11 M60 80 q0 9 8 11" stroke="#a9805a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M55 90 q5 6 10 0" fill="#ff7d8a"/>
    ${eyes(47, 73, 58, 7)}${cheeks(38, 82, 70)}`, "dog"),

  cat: () => wrap(`
    <path d="M30 50 L22 24 L48 40z" fill="#f6a64b"/>
    <path d="M90 50 L98 24 L72 40z" fill="#f6a64b"/>
    <path d="M32 48 L28 32 L44 42z" fill="#ffd0a0"/>
    <path d="M88 48 L92 32 L76 42z" fill="#ffd0a0"/>
    <ellipse cx="60" cy="64" rx="37" ry="33" fill="#fbb35a"/>
    <path d="M44 50 h32 M40 64 h40 M44 78 h32" stroke="#e98e2f" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    <path d="M55 76 l5 5 l5 -5z" fill="#ff7d8a"/>
    <path d="M60 81 v6 M60 84 q-9 2 -14 -2 M60 84 q9 2 14 -2" stroke="#7a5836" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${eyes(48, 72, 64, 7.5)}${cheeks(40, 80, 74)}`, "cat"),

  duck: () => wrap(`
    <ellipse cx="60" cy="60" rx="37" ry="35" fill="#ffd54a"/>
    <path d="M60 26 q-7 -16 6 -18 q-3 9 4 12z" fill="#f0b22e"/>
    <ellipse cx="60" cy="86" rx="22" ry="11" fill="#ff9f2e"/>
    <path d="M40 84 q20 8 40 0 q-2 7 -20 7 q-18 0 -20 -7z" fill="#f0892a"/>
    ${eyes(49, 71, 56, 7.5)}${cheeks(40, 80, 70)}`, "duck"),

  sheep: () => wrap(`
    <g fill="#f4f6fb">
      <circle cx="36" cy="48" r="16"/><circle cx="60" cy="38" r="18"/><circle cx="84" cy="48" r="16"/>
      <circle cx="28" cy="70" r="16"/><circle cx="92" cy="70" r="16"/><circle cx="44" cy="86" r="16"/>
      <circle cx="76" cy="86" r="16"/><circle cx="60" cy="92" r="16"/>
    </g>
    <ellipse cx="60" cy="66" rx="27" ry="26" fill="#fff"/>
    <path d="M24 58 q-10 4 -6 14 q8 2 12 -6z" fill="#cdb9a6"/>
    <path d="M96 58 q10 4 6 14 q-8 2 -12 -6z" fill="#cdb9a6"/>
    <ellipse cx="60" cy="66" rx="22" ry="22" fill="#efe1cd"/>
    ${eyes(52, 68, 63, 6)}
    <ellipse cx="60" cy="76" rx="4.5" ry="3.2" fill="#9b8160"/>
    ${cheeks(46, 74, 73, 6)}`, "sheep"),

  frog: () => wrap(`
    <circle cx="40" cy="40" r="18" fill="#7bd06a"/>
    <circle cx="80" cy="40" r="18" fill="#7bd06a"/>
    <circle cx="40" cy="40" r="11" fill="#fff"/>
    <circle cx="80" cy="40" r="11" fill="#fff"/>
    <circle cx="40" cy="42" r="6" fill="#3d2f22"/>
    <circle cx="80" cy="42" r="6" fill="#3d2f22"/>
    <ellipse cx="60" cy="72" rx="40" ry="32" fill="#86d873"/>
    <ellipse cx="60" cy="60" rx="40" ry="20" fill="#9ce089" opacity="0.6"/>
    <path d="M40 80 q20 16 40 0" stroke="#4e9a44" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${cheeks(38, 82, 80, 8)}`, "frog"),

  lion: () => wrap(`
    <g fill="#e8923a">
      <circle cx="60" cy="22" r="13"/><circle cx="30" cy="34" r="13"/><circle cx="90" cy="34" r="13"/>
      <circle cx="18" cy="60" r="13"/><circle cx="102" cy="60" r="13"/><circle cx="26" cy="88" r="13"/>
      <circle cx="94" cy="88" r="13"/><circle cx="60" cy="100" r="13"/>
    </g>
    <circle cx="60" cy="62" r="36" fill="#f6b056"/>
    <ellipse cx="60" cy="74" rx="18" ry="14" fill="#ffe0b0"/>
    <ellipse cx="60" cy="70" rx="6" ry="4.5" fill="#5d3a1c"/>
    <path d="M60 74 v8 M60 80 q-7 3 -12 -1 M60 80 q7 3 12 -1" stroke="#8a5a2c" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    ${eyes(48, 72, 58, 7)}${cheeks(40, 80, 70)}`, "lion"),

  pig: () => wrap(`
    <path d="M36 38 L30 22 L52 34z" fill="#ffb0c4"/>
    <path d="M84 38 L90 22 L68 34z" fill="#ffb0c4"/>
    <ellipse cx="60" cy="64" rx="38" ry="34" fill="#ffbcd0"/>
    <ellipse cx="60" cy="76" rx="17" ry="13" fill="#ff9bb6"/>
    <ellipse cx="53" cy="76" rx="3.4" ry="5" fill="#e06a8a"/>
    <ellipse cx="67" cy="76" rx="3.4" ry="5" fill="#e06a8a"/>
    ${eyes(48, 72, 58, 7)}${cheeks(40, 80, 70)}`, "pig"),
};

export function animal(name) { return (animalArt[name] || animalArt.cow)(); }
export const ANIMAL_NAMES = Object.keys(animalArt);

/* ---------------- EVERYDAY OBJECTS (first words) ---------------- */
const objectArt = {
  apple: () => wrap(`
    <path d="M60 36 q4 -14 18 -16 q-2 12 -12 16z" fill="#7cc36a"/>
    <path d="M60 34 q-2 -10 -4 -16" stroke="#8a5a2c" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M60 36 C40 28 20 40 22 64 c2 22 22 40 38 40 c16 0 36 -18 38 -40 C100 40 80 28 60 36z" fill="#ff5d5d"/>
    <ellipse cx="42" cy="56" rx="8" ry="12" fill="#fff" opacity="0.35"/>`, "apple"),
  ball: () => wrap(`
    <circle cx="60" cy="62" r="42" fill="#fff"/>
    <path d="M60 20 a42 42 0 0 1 0 84" fill="#ff6b6b"/>
    <path d="M60 20 a42 42 0 0 0 0 84" fill="#4aa8ff"/>
    <path d="M60 20 q22 42 0 84 q-22 -42 0 -84z" fill="#ffd34e"/>
    <circle cx="60" cy="62" r="42" fill="none" stroke="#e7d8c2" stroke-width="2"/>
    <ellipse cx="48" cy="44" rx="10" ry="6" fill="#fff" opacity="0.4"/>`, "ball"),
  car: () => wrap(`
    <rect x="14" y="58" width="92" height="30" rx="14" fill="#4aa8ff"/>
    <path d="M34 60 q6 -22 26 -22 q22 0 30 22z" fill="#74c0ff"/>
    <rect x="42" y="44" width="16" height="16" rx="4" fill="#dff1ff"/>
    <rect x="62" y="44" width="16" height="16" rx="4" fill="#dff1ff"/>
    <circle cx="38" cy="90" r="13" fill="#3d2f22"/><circle cx="38" cy="90" r="6" fill="#cfd8e0"/>
    <circle cx="82" cy="90" r="13" fill="#3d2f22"/><circle cx="82" cy="90" r="6" fill="#cfd8e0"/>
    <circle cx="100" cy="70" r="5" fill="#ffd34e"/>`, "car"),
  sun: () => wrap(`
    <g stroke="#ffb02e" stroke-width="7" stroke-linecap="round">
      <path d="M60 14 v12"/><path d="M60 94 v12"/><path d="M14 60 h12"/><path d="M94 60 h12"/>
      <path d="M28 28 l8 8"/><path d="M84 84 l8 8"/><path d="M92 28 l-8 8"/><path d="M36 84 l-8 8"/>
    </g>
    <circle cx="60" cy="60" r="28" fill="#ffd34e"/>
    <circle cx="52" cy="56" r="3.5" fill="#7a5a1c"/><circle cx="68" cy="56" r="3.5" fill="#7a5a1c"/>
    <path d="M52 66 q8 7 16 0" stroke="#7a5a1c" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${cheeks(46, 74, 64, 6)}`, "sun"),
  cup: () => wrap(`
    <path d="M30 40 H86 L82 92 q-1 8 -9 8 H43 q-8 0 -9 -8z" fill="#ff8fc8"/>
    <path d="M30 40 H86 V50 H30z" fill="#ff6fb6"/>
    <path d="M86 52 q18 0 18 16 q0 14 -18 14" fill="none" stroke="#ff8fc8" stroke-width="8"/>
    <rect x="55" y="20" width="10" height="22" rx="5" fill="#cfe7ff"/>
    <ellipse cx="50" cy="64" rx="7" ry="14" fill="#fff" opacity="0.35"/>`, "cup"),
  fish: () => wrap(`
    <path d="M82 60 L104 42 V78z" fill="#ff9f43"/>
    <ellipse cx="52" cy="60" rx="40" ry="28" fill="#ffb04a"/>
    <path d="M70 40 q8 6 0 14 M74 52 q8 4 0 12" fill="none" stroke="#f08c2a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="34" cy="54" r="7" fill="#fff"/><circle cx="34" cy="54" r="3.5" fill="#3d2f22"/>
    ${cheeks(28, 50, 66, 6)}`, "fish"),
  hat: () => wrap(`
    <path d="M60 16 L92 90 H28z" fill="#b06bff"/>
    <path d="M60 16 L76 53 L60 60 L46 53z" fill="#c79bff"/>
    <circle cx="60" cy="14" r="8" fill="#ffd34e"/>
    <path d="M24 90 q36 12 72 0 q-2 8 -36 8 q-34 0 -36 -8z" fill="#ff8fc8"/>
    <circle cx="48" cy="60" r="4" fill="#ffd34e"/><circle cx="70" cy="74" r="4" fill="#4cd17d"/>`, "hat"),
  flower: () => wrap(`
    <path d="M60 70 q-3 18 0 38" stroke="#4cb96a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M60 92 q-16 -6 -22 -16 q16 -2 22 8z" fill="#6fd08a"/>
    <g fill="#ff8fc8">
      <circle cx="60" cy="34" r="15"/><circle cx="36" cy="50" r="15"/><circle cx="84" cy="50" r="15"/>
      <circle cx="45" cy="74" r="15"/><circle cx="75" cy="74" r="15"/>
    </g>
    <circle cx="60" cy="56" r="15" fill="#ffd34e"/>`, "flower"),
  balloon: () => wrap(`
    <ellipse cx="60" cy="52" rx="34" ry="40" fill="#ff6fae"/>
    <path d="M52 90 L60 102 L68 90z" fill="#e85f95"/>
    <path d="M60 102 q4 8 -2 14 q-6 6 2 12" stroke="#c79bff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="48" cy="38" rx="9" ry="14" fill="#fff" opacity="0.35"/>`, "balloon"),
  kite: () => wrap(`
    <path d="M60 14 L60 62 L20 62z" fill="#4cd17d"/>
    <path d="M60 14 L60 62 L100 62z" fill="#ffd34e"/>
    <path d="M60 110 L60 62 L20 62z" fill="#ff6b6b"/>
    <path d="M60 110 L60 62 L100 62z" fill="#4aa8ff"/>
    <path d="M60 14 L60 110 M20 62 L100 62" stroke="#fff" stroke-width="2" opacity="0.6"/>
    <path d="M60 110 q4 6 -2 10 q-6 4 0 10" stroke="#8a5a2c" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M44 112 q3 1 3 5 M76 112 q-3 1 -3 5" stroke="#ff8fc8" stroke-width="3" fill="none" stroke-linecap="round"/>`, "kite"),
  moon: () => wrap(`
    <circle cx="64" cy="60" r="3" fill="#ffe9a8"/><circle cx="84" cy="40" r="2.2" fill="#ffe9a8"/><circle cx="40" cy="34" r="2.6" fill="#ffe9a8"/>
    <path d="M76 24 a40 40 0 1 0 0 76 a32 32 0 1 1 0 -76z" fill="#ffd56b"/>
    <ellipse cx="56" cy="48" rx="6" ry="9" fill="#fff" opacity="0.3"/>`, "moon"),
};
export function object(name) { return (objectArt[name] || objectArt.apple)(); }
export const OBJECT_NAMES = Object.keys(objectArt);

/* ---------------- COLLECTIBLE STICKERS ---------------- */
const cap = (s) => s[0].toUpperCase() + s.slice(1);
export const STICKERS = [
  ...ANIMAL_NAMES.map((n) => ({ id: n, name: cap(n), art: () => animal(n) })),
  ...OBJECT_NAMES.map((n) => ({ id: n, name: cap(n), art: () => object(n) })),
];
export function stickerArt(id) {
  const s = STICKERS.find((x) => x.id === id);
  return s ? s.art() : "";
}
export function stickerName(id) {
  const s = STICKERS.find((x) => x.id === id);
  return s ? s.name : "";
}

/* ---------------- ROOM ICONS ---------------- */
export const icon = {
  colors: () => wrap(`
    <path d="M60 18 C32 18 14 38 14 62 c0 18 14 26 28 24 c8 -1 8 -9 12 -13 c4 -4 14 -3 18 -9 c12 -2 22 -10 22 -26 C94 22 84 18 60 18z" fill="#fff3da" stroke="#e7cfa0" stroke-width="3"/>
    <circle cx="36" cy="46" r="7" fill="#ff6b6b"/>
    <circle cx="58" cy="36" r="7" fill="#ffd34e"/>
    <circle cx="78" cy="46" r="7" fill="#4cd17d"/>
    <circle cx="40" cy="70" r="7" fill="#4aa8ff"/>
    <circle cx="64" cy="66" r="7" fill="#b06bff"/>
    <ellipse cx="74" cy="86" rx="12" ry="9" fill="#fff" opacity="0.55"/>`, "colors"),

  shapes: () => wrap(`
    <circle cx="40" cy="44" r="22" fill="#ff7a7a"/>
    <rect x="60" y="26" width="38" height="38" rx="9" fill="#5fb8ff"/>
    <path d="M60 96 L40 60 Q38 56 44 56 L86 56 Q92 56 90 60z" fill="#6fe39a"/>`, "shapes"),

  numbers: () => wrap(`
    <rect x="14" y="40" width="30" height="40" rx="9" fill="#ff8f6b"/>
    <rect x="45" y="30" width="30" height="50" rx="9" fill="#ffd34e"/>
    <rect x="76" y="48" width="30" height="32" rx="9" fill="#6fd0ff"/>
    <text x="29" y="68" font-family="Baloo 2, Fredoka, sans-serif" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">1</text>
    <text x="60" y="66" font-family="Baloo 2, Fredoka, sans-serif" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">2</text>
    <text x="91" y="72" font-family="Baloo 2, Fredoka, sans-serif" font-size="24" font-weight="700" fill="#fff" text-anchor="middle">3</text>`, "numbers"),

  animals: () => wrap(`
    <ellipse cx="60" cy="74" rx="20" ry="17" fill="#ffd07a"/>
    <circle cx="33" cy="44" r="11" fill="#ffd07a"/>
    <circle cx="87" cy="44" r="11" fill="#ffd07a"/>
    <circle cx="44" cy="30" r="10" fill="#ffd07a"/>
    <circle cx="76" cy="30" r="10" fill="#ffd07a"/>`, "animals"),

  letters: () => wrap(`
    <rect x="16" y="40" width="42" height="44" rx="11" fill="#ff8f6b"/>
    <rect x="62" y="30" width="42" height="44" rx="11" fill="#6fd0ff" transform="rotate(8 83 52)"/>
    <text x="37" y="74" font-family="Baloo 2, Fredoka, sans-serif" font-size="34" font-weight="800" fill="#fff" text-anchor="middle">A</text>
    <text x="84" y="64" font-family="Baloo 2, Fredoka, sans-serif" font-size="30" font-weight="800" fill="#fff" text-anchor="middle" transform="rotate(8 84 56)">b</text>`, "letters"),

  words: () => wrap(`
    <rect x="20" y="26" width="80" height="68" rx="12" fill="#fff3da" stroke="#e7cfa0" stroke-width="3"/>
    <path d="M60 60 C50 52 38 58 39 70 c1 11 11 18 21 24 c10 -6 20 -13 21 -24 C82 58 70 52 60 60z" fill="#ff6b6b"/>
    <path d="M30 36 h26 M30 46 h18" stroke="#cdb89a" stroke-width="4" stroke-linecap="round"/>`, "words"),

  patterns: () => wrap(`
    <circle cx="28" cy="44" r="13" fill="#ff6b6b"/>
    <rect x="48" y="31" width="26" height="26" rx="7" fill="#4aa8ff"/>
    <circle cx="92" cy="44" r="13" fill="#ff6b6b"/>
    <circle cx="28" cy="86" r="13" fill="#4cd17d"/>
    <rect x="48" y="73" width="26" height="26" rx="7" fill="#ffd34e"/>
    <path d="M84 78 h16 M92 70 v16" stroke="#b06bff" stroke-width="6" stroke-linecap="round"/>`, "patterns"),
};

/* ---------------- UI GLYPHS (single stroke language) ---------------- */
const glyph = (inner, label) =>
  `<svg viewBox="0 0 48 48" role="img" aria-label="${label}" class="glyph">${inner}</svg>`;

export const ui = {
  home: () => glyph(`
    <path d="M24 8 L42 24 H37 V40 H29 V29 H19 V40 H11 V24 H6 Z" fill="#ff9f6b" stroke="#e07a45" stroke-width="2" stroke-linejoin="round"/>`, "home"),
  back: () => glyph(`
    <path d="M28 12 L16 24 L28 36" fill="none" stroke="#6b5a45" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`, "back"),
  speakerOn: () => glyph(`
    <path d="M8 20 H15 L24 12 V36 L15 28 H8 Z" fill="#6b5a45"/>
    <path d="M30 18 q5 6 0 12 M34 14 q9 10 0 20" fill="none" stroke="#6b5a45" stroke-width="3" stroke-linecap="round"/>`, "sound on"),
  speakerOff: () => glyph(`
    <path d="M8 20 H15 L24 12 V36 L15 28 H8 Z" fill="#b3a695"/>
    <path d="M31 18 L41 30 M41 18 L31 30" stroke="#b3a695" stroke-width="3.5" stroke-linecap="round"/>`, "sound off"),
  replay: () => glyph(`
    <path d="M10 22 H17 L26 14 V34 L17 26 H10 Z" fill="#fff"/>
    <path d="M31 19 q5 5 0 10 M35 15 q9 9 0 18" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`, "say it again"),
  close: () => glyph(`
    <path d="M14 14 L34 34 M34 14 L14 34" stroke="#8a7560" stroke-width="5" stroke-linecap="round"/>`, "close"),
  crown: () => glyph(`
    <path d="M8 34 L12 16 L20 26 L24 12 L28 26 L36 16 L40 34 Z" fill="#ffce4a" stroke="#f0ad1f" stroke-width="2" stroke-linejoin="round"/>
    <rect x="8" y="34" width="32" height="6" rx="2" fill="#f0ad1f"/>
    <circle cx="24" cy="12" r="3" fill="#ff8fb0"/>`, "crown"),
  flame: () => glyph(`
    <path d="M24 6 C16 16 12 20 12 28 a12 12 0 0 0 24 0 c0 -6 -4 -10 -6 -14 c-1 4 -4 5 -6 3 c2 -6 0 -12 0 -14z" fill="#ff8a3d"/>
    <path d="M24 24 c-4 4 -5 6 -5 9 a5 5 0 0 0 10 0 c0 -4 -3 -6 -5 -9z" fill="#ffd34e"/>`, "day streak"),
  lock: () => glyph(`
    <rect x="13" y="22" width="22" height="17" rx="4" fill="#fff"/>
    <path d="M18 22 v-4 a6 6 0 0 1 12 0 v4" fill="none" stroke="#fff" stroke-width="4"/>
    <circle cx="24" cy="30" r="2.6" fill="#b3a695"/>`, "locked"),
  play: () => glyph(`<path d="M18 14 L34 24 L18 34 Z" fill="#fff"/>`, "start"),
  book: () => glyph(`
    <path d="M10 12 q14 -5 14 4 v22 q0 -8 -14 -4z" fill="#ff8fc8"/>
    <path d="M38 12 q-14 -5 -14 4 v22 q0 -8 14 -4z" fill="#ffa8d4"/>
    <path d="M24 16 v20" stroke="#e36ba2" stroke-width="2"/>
    <circle cx="16" cy="9" r="3" fill="#ffd34e"/><circle cx="33" cy="8" r="2.4" fill="#6fe39a"/>`, "sticker book"),
  settings: () => glyph(`
    <line x1="8" y1="14" x2="40" y2="14" stroke="#8a7560" stroke-width="4" stroke-linecap="round"/>
    <circle cx="19" cy="14" r="5" fill="#fff" stroke="#8a7560" stroke-width="3"/>
    <line x1="8" y1="24" x2="40" y2="24" stroke="#8a7560" stroke-width="4" stroke-linecap="round"/>
    <circle cx="31" cy="24" r="5" fill="#fff" stroke="#8a7560" stroke-width="3"/>
    <line x1="8" y1="34" x2="40" y2="34" stroke="#8a7560" stroke-width="4" stroke-linecap="round"/>
    <circle cx="17" cy="34" r="5" fill="#fff" stroke="#8a7560" stroke-width="3"/>`, "parent area"),
};

export function star(filled = true) {
  return `<svg viewBox="0 0 24 24" class="star-glyph" aria-hidden="true">
    <path d="M12 2 L15 9 L22.5 9.3 L16.8 14 L18.8 21.3 L12 17 L5.2 21.3 L7.2 14 L1.5 9.3 L9 9 Z"
      fill="${filled ? "#ffce4a" : "#e7d6b0"}" stroke="${filled ? "#f0ad1f" : "#d8c49a"}" stroke-width="1" stroke-linejoin="round"/>
  </svg>`;
}

/* ---------------- REWARD TROPHIES ---------------- */
const reward = (inner) => `<svg viewBox="0 0 120 120" class="reward-art" aria-hidden="true">${inner}</svg>`;

export const rewardArt = [
  () => reward(`
    <path d="M60 14 L72 40 L100 43 L79 62 L86 92 L60 76 L34 92 L41 62 L20 43 L48 40 Z"
      fill="#ffd34e" stroke="#f0ad1f" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="52" cy="52" r="3.5" fill="#3d2f22"/><circle cx="68" cy="52" r="3.5" fill="#3d2f22"/>
    <path d="M52 62 q8 7 16 0" stroke="#3d2f22" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${cheeks(44, 76, 60, 6)}`),
  () => reward(`
    <rect x="50" y="86" width="20" height="12" rx="3" fill="#c98a3a"/>
    <rect x="40" y="96" width="40" height="10" rx="4" fill="#e0a44e"/>
    <path d="M38 30 H82 V46 q0 22 -22 26 q-22 -4 -22 -26 Z" fill="#ffd34e" stroke="#f0ad1f" stroke-width="3"/>
    <path d="M38 34 q-16 0 -16 14 q0 10 14 12" fill="none" stroke="#f0ad1f" stroke-width="5"/>
    <path d="M82 34 q16 0 16 14 q0 10 -14 12" fill="none" stroke="#f0ad1f" stroke-width="5"/>
    <path d="M50 52 l7 6 l13 -14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
  () => reward(`
    <path d="M60 92 q-2 -10 0 -16" stroke="#bda" stroke-width="2" fill="none"/>
    <path d="M60 76 q-3 8 0 16" stroke="#cbb58f" stroke-width="2" fill="none"/>
    <ellipse cx="60" cy="46" rx="30" ry="34" fill="#ff8fb0"/>
    <ellipse cx="50" cy="36" rx="9" ry="12" fill="#ffc2d6" opacity="0.8"/>
    <path d="M55 78 l5 -6 l5 6 z" fill="#ff8fb0"/>
    <circle cx="52" cy="44" r="3.2" fill="#fff" opacity="0.9"/>`),
  () => reward(`
    <path d="M20 84 a40 40 0 0 1 80 0" fill="none" stroke="#ff6b6b" stroke-width="9"/>
    <path d="M30 84 a30 30 0 0 1 60 0" fill="none" stroke="#ffd34e" stroke-width="9"/>
    <path d="M40 84 a20 20 0 0 1 40 0" fill="none" stroke="#4cd17d" stroke-width="9"/>
    <path d="M50 84 a10 10 0 0 1 20 0" fill="none" stroke="#4aa8ff" stroke-width="9"/>
    <circle cx="22" cy="86" r="7" fill="#fff"/><circle cx="98" cy="86" r="7" fill="#fff"/>`),
];

export function randomReward() {
  return rewardArt[(Math.random() * rewardArt.length) | 0]();
}
