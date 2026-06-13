/* words.js — "Find the word!" First everyday words with bespoke pictures. */
import { object, OBJECT_NAMES } from "../art.js";

export function wordsGame(stage, prompt, api) {
  let target = null;

  function round() {
    const choices = api.sample(OBJECT_NAMES, 3);
    target = api.rand(choices);
    prompt.set(`Find the <b>${target}</b>!`, `Find the ${target}!`);
    api.say(`Find the ${target}!`);

    stage.innerHTML = `<div class="choices" style="--cols:3"></div>`;
    const row = stage.firstElementChild;
    choices.forEach((name, i) => {
      const b = document.createElement("button");
      b.className = "animal-card"; // same friendly picture-card style
      b.style.animationDelay = `${i * 60}ms`;
      b.setAttribute("aria-label", name);
      b.innerHTML = `<span class="animal-card__art">${object(name)}</span>
                     <span class="animal-card__name">${name}</span>`;
      b.onclick = () => pick(b, name);
      row.appendChild(b);
    });
  }

  function pick(btn, name) {
    if (name === target) {
      btn.classList.add("is-active");
      api.sfxCorrect();
      api.reward(`${cap(target)}!`, round);
    } else {
      btn.classList.remove("is-active"); void btn.offsetWidth; btn.classList.add("is-active");
      api.sfxTap();
      api.say(`That's a ${name}. Find the ${target}!`);
    }
  }

  round();
  return { destroy() {} };
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);
