/* colors.js — "Find the color!" Color recognition. */

const PALETTE = [
  { name: "red",    css: "#ff5d5d" },
  { name: "orange", css: "#ff9f43" },
  { name: "yellow", css: "#ffd34e" },
  { name: "green",  css: "#4cd17d" },
  { name: "blue",   css: "#4aa8ff" },
  { name: "purple", css: "#b06bff" },
  { name: "pink",   css: "#ff8fc8" },
];

export function colorsGame(stage, prompt, api) {
  let target = null;

  function round() {
    const choices = api.sample(PALETTE, 3);
    target = api.rand(choices);
    prompt.set(`Find the <b style="color:${target.css}">${target.name}</b> one!`, `Find the ${target.name} one!`);
    api.say(`Find the ${target.name} one!`);

    stage.innerHTML = `<div class="choices" style="--cols:3"></div>`;
    const row = stage.firstElementChild;
    for (const c of choices) {
      const b = document.createElement("button");
      b.className = "token";
      b.style.background = `radial-gradient(circle at 38% 32%, ${tint(c.css)}, ${c.css})`;
      b.setAttribute("aria-label", c.name);
      b.onclick = () => pick(b, c);
      row.appendChild(b);
    }
  }

  function pick(btn, c) {
    if (c.name === target.name) {
      btn.classList.add("is-right");
      api.sfxCorrect();
      api.reward(`${cap(target.name)}!`, round);
    } else {
      btn.classList.remove("is-wrong"); void btn.offsetWidth; btn.classList.add("is-wrong");
      api.wrong?.();
      api.sfxTryAgain();
      api.say("Try again!");
    }
  }

  round();
  return { destroy() {} };
}

function tint(hex) {
  // lighten toward white for the glossy highlight
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (v) => Math.round(v + (255 - v) * 0.55);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}
const cap = (s) => s[0].toUpperCase() + s.slice(1);
