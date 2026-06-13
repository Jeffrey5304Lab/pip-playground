/* mascot.js — Pip, a round little chick, with a few expressions.
   expression ∈ "happy" | "cheer" | "think" | "sleep" (default "happy"). */

function eyes(expression) {
  switch (expression) {
    case "cheer": // joyful squint  ^  ^
      return `
        <path class="pip-eye" d="M70 100 q10 -12 20 0" fill="none" stroke="#4a3a26" stroke-width="6" stroke-linecap="round"/>
        <path class="pip-eye" d="M110 100 q10 -12 20 0" fill="none" stroke="#4a3a26" stroke-width="6" stroke-linecap="round"/>`;
    case "sleep": // closed, content
      return `
        <path d="M70 100 q10 9 20 0" fill="none" stroke="#4a3a26" stroke-width="5" stroke-linecap="round"/>
        <path d="M110 100 q10 9 20 0" fill="none" stroke="#4a3a26" stroke-width="5" stroke-linecap="round"/>`;
    case "think": // looking up, curious
      return `
        <g class="pip-eye"><circle cx="80" cy="96" r="11" fill="#4a3a26"/><circle cx="83" cy="91" r="3.4" fill="#fff"/></g>
        <g class="pip-eye"><circle cx="120" cy="96" r="11" fill="#4a3a26"/><circle cx="123" cy="91" r="3.4" fill="#fff"/></g>
        <path d="M68 84 q12 -6 22 -2" fill="none" stroke="#e0a64a" stroke-width="4" stroke-linecap="round"/>`;
    default: // happy, bright eyes
      return `
        <g class="pip-eye"><circle cx="80" cy="98" r="11" fill="#4a3a26"/><circle cx="84" cy="94" r="3.4" fill="#fff"/></g>
        <g class="pip-eye"><circle cx="120" cy="98" r="11" fill="#4a3a26"/><circle cx="124" cy="94" r="3.4" fill="#fff"/></g>`;
  }
}

function mouth(expression) {
  if (expression === "cheer")  // open happy beak
    return `<path d="M88 116 q12 16 24 0 q-2 -8 -12 -8 q-10 0 -12 8z" fill="#ff7a43"/>
            <path d="M90 120 q10 9 20 0z" fill="#e85f2a"/>`;
  if (expression === "sleep")  // tiny closed beak + zzz handled by caller
    return `<path d="M94 116 l12 0 l-6 8 z" fill="#ff9f43"/>`;
  return `<path d="M92 116 l16 0 l-8 11 z" fill="#ff9f43"/>`; // happy/think
}

function wings(expression) {
  if (expression === "cheer") // arms up, celebrating
    return `<path d="M34 104 q-18 -10 -26 -26 q14 -4 28 10 z" fill="#f5b73c"/>
            <path d="M166 104 q18 -10 26 -26 q-14 -4 -28 10 z" fill="#f5b73c"/>`;
  return `<path d="M34 110 q-16 8 -10 30 q14 6 24 -8 z" fill="#f5b73c"/>
          <path d="M166 110 q16 8 10 30 q-14 6 -24 -8 z" fill="#f5b73c"/>`;
}

export function pipSVG({ size = 160, blink = true, bounce = true, expression = "happy" } = {}) {
  const openEyes = expression === "happy" || expression === "think";
  const cls = ["pip-svg", blink && openEyes ? "is-blink" : "", bounce ? "pip-bounce" : ""]
    .filter(Boolean).join(" ");
  const zzz = expression === "sleep"
    ? `<text x="150" y="56" font-family="Baloo 2, sans-serif" font-size="20" font-weight="700" fill="#9bb7d8">z</text>
       <text x="166" y="40" font-family="Baloo 2, sans-serif" font-size="14" font-weight="700" fill="#bcd0e8">z</text>`
    : "";
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
    <path d="M78 168 q-2 14 -12 18 M78 168 q6 12 0 20 M78 168 q10 8 16 12" stroke="#f08c2a" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M122 168 q2 14 12 18 M122 168 q-6 12 0 20 M122 168 q-10 8 -16 12" stroke="#f08c2a" stroke-width="6" stroke-linecap="round" fill="none"/>
    <ellipse cx="100" cy="112" rx="74" ry="70" fill="url(#pipBody)"/>
    ${wings(expression)}
    <path d="M100 44 q-8 -22 6 -30 q-2 14 8 16 q-10 2 -14 14z" fill="#f5b73c"/>
    <circle cx="64" cy="120" r="16" fill="url(#pipCheek)"/>
    <circle cx="136" cy="120" r="16" fill="url(#pipCheek)"/>
    ${eyes(expression)}
    ${mouth(expression)}
    ${zzz}
  </svg>`;
}
