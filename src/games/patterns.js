/* patterns.js — "What comes next?" Simple repeating patterns (logic / sequencing). */

const PALETTE = [
  { name: "red",    css: "#ff5d5d" },
  { name: "yellow", css: "#ffd34e" },
  { name: "green",  css: "#4cd17d" },
  { name: "blue",   css: "#4aa8ff" },
  { name: "purple", css: "#b06bff" },
];

function tint(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (v) => Math.round(v + (255 - v) * 0.55);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}
const bead = (c, cls = "bead") =>
  `<span class="${cls}" style="background:radial-gradient(circle at 38% 32%, ${tint(c.css)}, ${c.css})"></span>`;

export function patternsGame(stage, prompt, api) {
  let answer = null;

  function round() {
    const unitLen = Math.random() < 0.5 ? 2 : 3;
    const unit = api.sample(PALETTE, unitLen);
    const reveal = unitLen * 2 + Math.floor(Math.random() * unitLen); // 4..(2u+u-1)
    answer = unit[reveal % unitLen];

    prompt.set(`What comes next?`, "What comes next?");
    api.say("What comes next?");

    const seq = [];
    for (let i = 0; i < reveal; i++) seq.push(bead(unit[i % unitLen]));

    // answer options: correct + distractors from the same unit / palette
    const opts = new Set([answer.name]);
    for (const c of unit) opts.add(c.name);
    while (opts.size < 3) opts.add(api.rand(PALETTE).name);
    const optList = api.sample([...opts].map((nm) => PALETTE.find((p) => p.name === nm)), Math.min(3, opts.size));
    while (optList.length < 3) { const c = api.rand(PALETTE); if (!optList.includes(c)) optList.push(c); }

    stage.innerHTML = `
      <div class="pattern-row">${seq.join("")}<span class="bead bead--slot">?</span></div>
      <div class="choices" style="--cols:3; margin-top:8px"></div>`;
    const row = stage.querySelector(".choices");
    api.sample(optList, optList.length).forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "token";
      b.style.background = `radial-gradient(circle at 38% 32%, ${tint(c.css)}, ${c.css})`;
      b.style.animationDelay = `${i * 70}ms`;
      b.setAttribute("aria-label", c.name);
      b.onclick = () => pick(b, c);
      row.appendChild(b);
    });
  }

  function pick(btn, c) {
    if (c.name === answer.name) {
      btn.classList.add("is-right");
      // fill the slot for a satisfying "click into place"
      const slot = stage.querySelector(".bead--slot");
      if (slot) { slot.textContent = ""; slot.style.background = btn.style.background; slot.classList.add("bead--filled"); }
      api.sfxCorrect();
      api.reward("Yes!", round);
    } else {
      btn.classList.remove("is-wrong"); void btn.offsetWidth; btn.classList.add("is-wrong");
      api.sfxTryAgain();
      api.say("Try again! Look at the pattern.");
    }
  }

  round();
  return { destroy() {} };
}
