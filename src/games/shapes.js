/* shapes.js — "Find the shape!" Shape recognition with friendly SVG shapes. */

const SHAPES = ["circle", "square", "triangle", "star", "heart"];
const FILLS = ["#ff7a7a", "#5fb8ff", "#6fe39a", "#ffd06b", "#c79bff"];

function shapeSVG(kind, fill) {
  const common = `fill="${fill}" stroke="rgba(0,0,0,.12)" stroke-width="3"`;
  switch (kind) {
    case "circle":  return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" ${common}/></svg>`;
    case "square":  return `<svg viewBox="0 0 100 100"><rect x="12" y="12" width="76" height="76" rx="14" ${common}/></svg>`;
    case "triangle":return `<svg viewBox="0 0 100 100"><path d="M50 12 L90 84 Q92 90 84 90 L16 90 Q8 90 10 84 Z" ${common}/></svg>`;
    case "star":    return `<svg viewBox="0 0 100 100"><path d="M50 8 L61 38 L94 39 L67 59 L77 91 L50 71 L23 91 L33 59 L6 39 L39 38 Z" ${common} stroke-linejoin="round"/></svg>`;
    case "heart":   return `<svg viewBox="0 0 100 100"><path d="M50 86 C18 62 10 40 24 26 C36 14 50 24 50 34 C50 24 64 14 76 26 C90 40 82 62 50 86 Z" ${common} stroke-linejoin="round"/></svg>`;
  }
}

export function shapesGame(stage, prompt, api) {
  let target = null;

  function round() {
    const kinds = api.sample(SHAPES, 3);
    target = api.rand(kinds);
    prompt.set(`Find the <b>${target}</b>!`, `Find the ${target}!`);
    api.say(`Find the ${target}!`);

    stage.innerHTML = `<div class="choices" style="--cols:3"></div>`;
    const row = stage.firstElementChild;
    kinds.forEach((k, i) => {
      const b = document.createElement("button");
      b.className = "shape";
      b.setAttribute("aria-label", k);
      b.innerHTML = shapeSVG(k, FILLS[i % FILLS.length]);
      b.onclick = () => pick(b, k);
      row.appendChild(b);
    });
  }

  function pick(btn, k) {
    if (k === target) {
      btn.classList.add("is-right");
      api.sfxCorrect();
      api.reward(`${cap(target)}!`, round);
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

const cap = (s) => s[0].toUpperCase() + s.slice(1);
