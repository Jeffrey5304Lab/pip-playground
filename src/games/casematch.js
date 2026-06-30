/* casematch.js — "Match the letter!" Uppercase ↔ Lowercase recognition. */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TILE_COLORS = ["#ff7a7a", "#5fb8ff", "#6fe39a", "#ffb34e", "#b06bff", "#ff8fc8"];

export function casematchGame(stage, prompt, api) {
  let target = null;
  let showUpperTarget = true;

  function round() {
    const n = api.choices();
    const choices = api.sample(LETTERS, n);
    target = api.rand(choices);
    showUpperTarget = Math.random() < 0.5;

    if (showUpperTarget) {
      prompt.set(`Find the little <b>${target.toLowerCase()}</b>`, `Find the little ${target.toLowerCase()}.`);
      api.say(`Find the little ${target.toLowerCase()}.`);
    } else {
      prompt.set(`Find the big <b>${target}</b>`, `Find the big letter ${target}.`);
      api.say(`Find the big letter ${target}.`);
    }

    stage.innerHTML = `
      <div class="match-target" style="color:var(--world,#ff9233)">${showUpperTarget ? target : target.toLowerCase()}</div>
      <div class="choices" style="--cols:${n}"></div>`;

    const row = stage.querySelector(".choices");
    choices.forEach((L, i) => {
      const b = document.createElement("button");
      b.className = "letter-tile";
      b.style.setProperty("--tile", TILE_COLORS[i % TILE_COLORS.length]);
      b.style.animationDelay = `${i * 70}ms`;
      const shown = showUpperTarget ? L.toLowerCase() : L;
      b.setAttribute("aria-label", shown);
      b.innerHTML = `<span class="letter-tile__up">${shown}</span>`;
      b.onclick = () => pick(b, L);
      row.appendChild(b);
      if (L === target) api.setCorrect(b);
    });
  }

  function pick(btn, L) {
    if (L === target) {
      btn.classList.add("is-right");
      api.sfxCorrect();
      api.reward(`${target} and ${target.toLowerCase()}!`, round);
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
