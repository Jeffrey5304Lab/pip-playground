/* letters.js — "Find the letter!" ABC + phonics via familiar example words. */

const WORD_FOR = {
  A: "Apple", B: "Ball", C: "Cat", D: "Dog", E: "Egg", F: "Fish",
  G: "Goat", H: "Hat", I: "Igloo", J: "Jam", K: "Kite", L: "Lion",
  M: "Moon", N: "Nest", O: "Orange", P: "Pig", Q: "Queen", R: "Rabbit",
  S: "Sun", T: "Tree", U: "Umbrella", V: "Van", W: "Whale", X: "Fox",
  Y: "Yo-yo", Z: "Zebra",
};
const LETTERS = Object.keys(WORD_FOR);
const TILE_COLORS = ["#ff7a7a", "#5fb8ff", "#6fe39a", "#ffb34e", "#b06bff", "#ff8fc8"];

export function lettersGame(stage, prompt, api) {
  let target = null;

  function round() {
    const n = api.choices();
    const choices = api.sample(LETTERS, n);
    target = api.rand(choices);
    const word = WORD_FOR[target];
    prompt.set(`Find the <b>${target}</b>`, `Find the letter ${target}. ${target} is for ${word}.`);
    api.say(`Find the letter ${target}. ${target} is for ${word}.`);

    stage.innerHTML = `<div class="choices" style="--cols:${n}"></div>`;
    const row = stage.firstElementChild;
    choices.forEach((L, i) => {
      const b = document.createElement("button");
      b.className = "letter-tile";
      b.style.setProperty("--tile", TILE_COLORS[i % TILE_COLORS.length]);
      b.style.animationDelay = `${i * 70}ms`;
      b.setAttribute("aria-label", L);
      b.innerHTML = `<span class="letter-tile__up">${L}</span><span class="letter-tile__low">${L.toLowerCase()}</span>`;
      b.onclick = () => pick(b, L);
      row.appendChild(b);
      if (L === target) api.setCorrect(b);
    });
  }

  function pick(btn, L) {
    if (L === target) {
      btn.classList.add("is-right");
      api.sfxCorrect();
      api.reward(`${target} is for ${WORD_FOR[target]}!`, round);
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
