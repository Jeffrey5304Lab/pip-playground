/* fruits.js — "Find the fruit!" Fruit vocabulary with bespoke SVG art. */
import { fruit, FRUIT_NAMES } from "../art.js";

export function fruitsGame(stage, prompt, api) {
  let target = null;

  function round() {
    const n = api.choices();
    const choices = api.sample(FRUIT_NAMES, n);
    target = api.rand(choices);
    prompt.set(`Find the <b>${target}</b>!`, `Find the ${target}!`);
    api.say(`Find the ${target}!`);

    stage.innerHTML = `<div class="choices" style="--cols:${n}"></div>`;
    const row = stage.firstElementChild;
    choices.forEach((name, i) => {
      const b = document.createElement("button");
      b.className = "animal-card";
      b.style.animationDelay = `${i * 60}ms`;
      b.setAttribute("aria-label", name);
      b.innerHTML = `<span class="animal-card__art">${fruit(name)}</span>
                     <span class="animal-card__name">${name}</span>`;
      b.onclick = () => pick(b, name);
      row.appendChild(b);
      if (name === target) api.setCorrect(b);
    });
  }

  function pick(btn, name) {
    if (name === target) {
      btn.classList.add("is-active");
      api.sfxCorrect();
      api.reward(`${cap(target)}!`, round);
    } else {
      btn.classList.remove("is-active"); void btn.offsetWidth; btn.classList.add("is-active");
      api.wrong?.();
      api.sfxTap();
      api.say("Try again!");
    }
  }

  round();
  return { destroy() {} };
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);
