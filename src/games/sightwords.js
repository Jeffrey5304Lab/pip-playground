/* sightwords.js — "Find the word!" High-frequency Dolch sight words. */

const WORDS = [
  "the", "I", "see", "we", "can", "go", "is", "it",
  "a", "at", "in", "no", "up", "my", "to", "do",
  "he", "she", "me", "and", "for", "on", "run", "big",
  "red", "you", "one", "two", "play", "help",
];

const TILE_COLORS = ["#ff7a7a", "#5fb8ff", "#6fe39a", "#ffb34e", "#b06bff", "#ff8fc8"];

export function sightwordsGame(stage, prompt, api) {
  let target = null;

  function round() {
    const choices = api.sample(WORDS, 3);
    target = api.rand(choices);
    prompt.set(`Find the word <b>${target}</b>!`, `Find the word ${target}!`);
    api.say(`Find the word ${target}!`);

    stage.innerHTML = `<div class="choices" style="--cols:3"></div>`;
    const row = stage.firstElementChild;
    choices.forEach((word, i) => {
      const b = document.createElement("button");
      b.className = "word-tile";
      b.style.setProperty("--tile", TILE_COLORS[i % TILE_COLORS.length]);
      b.style.animationDelay = `${i * 70}ms`;
      b.setAttribute("aria-label", word);
      b.textContent = word;
      b.onclick = () => pick(b, word);
      row.appendChild(b);
    });
  }

  function pick(btn, word) {
    if (word === target) {
      btn.classList.add("is-right");
      api.sfxCorrect();
      api.reward(`${target}!`, round);
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
