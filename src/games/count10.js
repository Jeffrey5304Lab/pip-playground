/* count10.js — Count 6–10, plus simple subtraction (take-away). */
import { animal } from "../art.js";

const CRITTERS = ["duck", "dog", "cat", "frog", "pig", "cow", "lion", "sheep"];

export function count10Game(stage, prompt, api) {
  let answer = 0;

  function round() {
    const isSub = Math.random() < 0.45;
    const critter = api.rand(CRITTERS);

    if (isSub) {
      const total = 4 + Math.floor(Math.random() * 5); // 4–8
      const takeAway = 1 + Math.floor(Math.random() * Math.min(3, total - 2)); // 1–3, keep ≥2 left
      answer = total - takeAway;
      if (answer < 2) { round(); return; }

      prompt.set(`How many are left?`, `Take away ${takeAway}. How many are left?`);
      api.say(`Take away ${takeAway}. How many are left?`);
      stage.innerHTML = `<div class="count-field"></div><div class="choices" style="--cols:3;margin-top:6px"></div>`;
      addCritters(stage.querySelector(".count-field"), total, critter, takeAway);
    } else {
      answer = 6 + Math.floor(Math.random() * 5); // 6–10
      let counted = 0;
      prompt.set(`How many?`, `How many? Tap them to count!`);
      api.say(`How many? Tap them to count!`);
      stage.innerHTML = `<div class="count-field"></div><div class="choices" style="--cols:3;margin-top:6px"></div>`;
      const field = stage.querySelector(".count-field");
      for (let i = 0; i < answer; i++) {
        const c = document.createElement("span");
        c.className = "critter"; c.innerHTML = animal(critter); c.setAttribute("role", "button");
        c.style.animationDelay = `${i * 30}ms`;
        c.onclick = () => {
          if (c.dataset.done) return;
          c.dataset.done = "1"; counted++;
          c.classList.add("is-counted");
          api.sfxCount(counted);
          api.say(String(counted), { rate: 1 });
        };
        field.appendChild(c);
      }
    }

    const opts = stage.querySelector(".choices");
    const want = api.choices();
    opts.style.setProperty("--cols", want);
    for (const num of numberChoices(answer, want)) {
      const b = document.createElement("button");
      b.className = "num-btn"; b.textContent = String(num); b.setAttribute("aria-label", `${num}`);
      b.onclick = () => pick(b, num);
      opts.appendChild(b);
      if (num === answer) api.setCorrect(b);
    }
  }

  function addCritters(field, total, critter, crossed) {
    for (let i = 0; i < total; i++) {
      const c = document.createElement("span");
      c.className = "critter" + (i >= total - crossed ? " is-crossed" : "");
      c.innerHTML = animal(critter);
      c.setAttribute("role", "img");
      c.style.animationDelay = `${i * 30}ms`;
      field.appendChild(c);
    }
  }

  function pick(btn, n) {
    if (n === answer) {
      btn.classList.add("is-right");
      api.sfxCorrect();
      api.reward(`${answer}!`, round);
    } else {
      btn.classList.remove("is-wrong"); void btn.offsetWidth; btn.classList.add("is-wrong");
      api.wrong?.();
      api.sfxTryAgain();
      api.say("Try again! Count them.");
    }
  }

  round();
  return { destroy() {} };
}

function numberChoices(answer, count = 3) {
  const set = new Set([answer]);
  while (set.size < count) {
    const d = answer + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
    if (d >= 1 && d <= 10) set.add(d);
  }
  return shuffle([...set]);
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
