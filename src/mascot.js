/* mascot.js — Pip, a round little chick. Returned as inline SVG markup. */

export function pipSVG({ size = 160, blink = true, bounce = true } = {}) {
  const cls = ["pip-svg", blink ? "is-blink" : "", bounce ? "pip-bounce" : ""]
    .filter(Boolean).join(" ");
  return `
  <svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="Pip the chick">
    <defs>
      <radialGradient id="pipBody" cx="42%" cy="36%" r="72%">
        <stop offset="0%" stop-color="#fff0b8"/>
        <stop offset="55%" stop-color="#ffd05b"/>
        <stop offset="100%" stop-color="#f5b73c"/>
      </radialGradient>
      <radialGradient id="pipCheek" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff9aa6"/>
        <stop offset="100%" stop-color="#ff9aa6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- feet -->
    <path d="M78 168 q-2 14 -12 18 M78 168 q6 12 0 20 M78 168 q10 8 16 12" stroke="#f08c2a" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M122 168 q2 14 12 18 M122 168 q-6 12 0 20 M122 168 q-10 8 -16 12" stroke="#f08c2a" stroke-width="6" stroke-linecap="round" fill="none"/>
    <!-- body -->
    <ellipse cx="100" cy="112" rx="74" ry="70" fill="url(#pipBody)"/>
    <!-- little wing -->
    <path d="M34 110 q-16 8 -10 30 q14 6 24 -8 z" fill="#f5b73c"/>
    <path d="M166 110 q16 8 10 30 q-14 6 -24 -8 z" fill="#f5b73c"/>
    <!-- tuft -->
    <path d="M100 44 q-8 -22 6 -30 q-2 14 8 16 q-10 2 -14 14z" fill="#f5b73c"/>
    <!-- cheeks -->
    <circle cx="64" cy="120" r="16" fill="url(#pipCheek)"/>
    <circle cx="136" cy="120" r="16" fill="url(#pipCheek)"/>
    <!-- eyes -->
    <g class="pip-eye"><circle cx="80" cy="98" r="11" fill="#4a3a26"/><circle cx="84" cy="94" r="3.4" fill="#fff"/></g>
    <g class="pip-eye"><circle cx="120" cy="98" r="11" fill="#4a3a26"/><circle cx="124" cy="94" r="3.4" fill="#fff"/></g>
    <!-- beak -->
    <path d="M92 116 l16 0 l-8 11 z" fill="#ff9f43"/>
  </svg>`;
}
