/* counting.js — "How many?" Counting 1–5 with tap-to-count critters. */
import { animal } from "../art.js";

const CRITTERS = ["duck", "dog", "cat", "frog", "pig", "cow", "lion", "sheep"];

export function countingGame(stage, prompt, api) {
  let answer = 0;

  function round() {
    answer = 1 + Math.floor(Math.random() * 5); // 1..5
    const critter = api.rand(CRITTERS);
    prompt.set(`How many?`, "How many? Tap them to count!");
    api.say("How many? Tap them to count!");

    stage.innerHTML = `
      <div class="count-field"></div>
      <div class="choices" style="--cols:3; margin-top:6px"></div>`;
    const field = stage.querySelector(".count-field");
    const opts = stage.querySelector(".choices");

    let counted = 0;
    for (let i = 0; i < answer; i++) {
      const c = document.createElement("span");
      c.className = "critter"; c.innerHTML = animal(critter); c.setAttribute("role", "button");
      c.style.animationDelay = `${i * 50}ms`;
      c.onclick = () => {
        if (c.dataset.done) return;
        c.dataset.done = "1"; counted++;
        c.classList.add("is-counted");
        api.sfxCount(counted);
        api.say(String(counted), { rate: 1 });
      };
      field.appendChild(c);
    }

    // number choices: the answer + two nearby distractors
    const nums = numberChoices(answer);
    for (const n of nums) {
      const b = document.createElement("button");
      b.className = "num-btn"; b.textContent = String(n); b.setAttribute("aria-label", `${n}`);
      b.onclick = () => pick(b, n);
      opts.appendChild(b);
    }
  }

  function pick(btn, n) {
    if (n === answer) {
      btn.classList.add("is-right");
      api.sfxCorrect();
      api.reward(`${answer}!`, round);
    } else {
      btn.classList.remove("is-wrong"); void btn.offsetWidth; btn.classList.add("is-wrong");
      api.sfxTryAgain();
      api.say("Try again! Count them.");
    }
  }

  round();
  return { destroy() {} };
}

function numberChoices(answer) {
  const set = new Set([answer]);
  while (set.size < 3) {
    let d = answer + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
    if (d >= 1 && d <= 9) set.add(d);
  }
  return shuffle([...set]);
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
