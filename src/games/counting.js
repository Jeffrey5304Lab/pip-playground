/* counting.js — "How many?" Counting 1–5, plus simple addition (count two
   groups of the same critter together) with tap-to-count critters. */
import { animal } from "../art.js";

const CRITTERS = ["duck", "dog", "cat", "frog", "pig", "cow", "lion", "sheep"];

export function countingGame(stage, prompt, api) {
  let answer = 0;
  let counted = 0;

  function addCritters(field, n, critter) {
    for (let i = 0; i < n; i++) {
      const c = document.createElement("span");
      c.className = "critter"; c.innerHTML = animal(critter); c.setAttribute("role", "button");
      c.style.animationDelay = `${i * 50}ms`;
      c.onclick = () => {
        if (c.dataset.done) return;
        c.dataset.done = "1"; counted++;
        c.classList.add("is-counted");
        c.insertAdjacentHTML("beforeend", `<span class="critter__n">${counted}</span>`);
        api.sfxCount(counted);
        api.say(String(counted), { rate: 1 });
      };
      field.appendChild(c);
    }
  }

  function round() {
    counted = 0;
    // mostly plain counting for the youngest; addition appears less often
    const isAdd = Math.random() < 0.3;
    const critter = api.rand(CRITTERS);
    prompt.set(`How many?`, "How many? Tap them to count!");
    api.say("How many? Tap them to count!");

    if (isAdd) {
      // two small groups of the same critter — combine and count them all
      let a, b;
      do { a = 1 + Math.floor(Math.random() * 3); b = 1 + Math.floor(Math.random() * 3); } while (a + b > 5);
      answer = a + b;
      stage.innerHTML = `
        <div class="count-field count-field--a"></div>
        <span class="count-plus" aria-hidden="true">+</span>
        <div class="count-field count-field--b"></div>
        <div class="choices" style="--cols:3; margin-top:6px"></div>`;
      addCritters(stage.querySelector(".count-field--a"), a, critter);
      addCritters(stage.querySelector(".count-field--b"), b, critter);
    } else {
      answer = 1 + Math.floor(Math.random() * 5); // 1..5
      stage.innerHTML = `
        <div class="count-field"></div>
        <div class="choices" style="--cols:3; margin-top:6px"></div>`;
      addCritters(stage.querySelector(".count-field"), answer, critter);
    }

    // number choices: the answer + nearby distractors (2 early, then 3)
    const opts = stage.querySelector(".choices");
    const want = api.choices();
    const nums = numberChoices(answer, want);
    opts.style.setProperty("--cols", want);
    for (const num of nums) {
      const b = document.createElement("button");
      b.className = "num-btn"; b.textContent = String(num); b.setAttribute("aria-label", `${num}`);
      b.onclick = () => pick(b, num);
      opts.appendChild(b);
      if (num === answer) api.setCorrect(b);
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
    let d = answer + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
    if (d >= 1 && d <= 9) set.add(d);
  }
  return shuffle([...set]);
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
