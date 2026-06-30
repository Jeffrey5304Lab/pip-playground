/* animals.js — "Find the animal!" Animal names + the sounds they make. */
import { animal } from "../art.js";

const ANIMALS = [
  { name: "cow",   sound: "Moo" },
  { name: "dog",   sound: "Woof" },
  { name: "cat",   sound: "Meow" },
  { name: "duck",  sound: "Quack" },
  { name: "sheep", sound: "Baa" },
  { name: "frog",  sound: "Ribbit" },
  { name: "lion",  sound: "Roar" },
  { name: "pig",   sound: "Oink" },
];

export function animalsGame(stage, prompt, api) {
  let target = null;

  function round() {
    const n = api.choices();
    const choices = api.sample(ANIMALS, n);
    target = api.rand(choices);
    prompt.set(`Who says <b>${target.sound}</b>?`, `Who says ${target.sound}? Find the ${target.name}!`);
    api.say(`Who says ${target.sound}? Find the ${target.name}!`);

    stage.innerHTML = `<div class="choices" style="--cols:${n}"></div>`;
    const row = stage.firstElementChild;
    choices.forEach((a, i) => {
      const b = document.createElement("button");
      b.className = "animal-card";
      b.style.animationDelay = `${i * 60}ms`;
      b.setAttribute("aria-label", a.name);
      b.innerHTML = `<span class="animal-card__art">${animal(a.name)}</span>
                     <span class="animal-card__name">${a.name}</span>`;
      b.onclick = () => pick(b, a);
      row.appendChild(b);
      if (a.name === target.name) api.setCorrect(b);
    });
  }

  function pick(btn, a) {
    if (a.name === target.name) {
      btn.classList.add("is-active");
      api.sfxCorrect();
      api.reward(`${a.sound}!`, round);
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
