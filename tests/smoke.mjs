/* Playwright smoke + interaction test for Pip's Playground.
   Walks every game (via the two-level subject shelf) through a full
   lesson and asserts the progression, sticker book, bilingual toggle,
   and parent-area reset. Also regenerates the PNG app icons.
   Run: NODE_PATH=$(npm root -g) node tests/smoke.mjs            */
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const BASE = "http://localhost:8123/index.html";
const SHOTS = join(ROOT, "tests", "shots");

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? "  ✓ " : "  ✗ ") + m); };

/* the shelf, mirroring app.js: subject id → ordered room ids */
const SUBJECTS = [
  { id: "english", rooms: ["letters", "words", "casematch", "sightwords"] },
  { id: "numbers", rooms: ["count", "count10"] },
  { id: "colors",  rooms: ["colors", "shapes", "pattern"] },
  { id: "nature",  rooms: ["animals", "fruits"] },
];
const ALL_ROOMS = SUBJECTS.flatMap((s) => s.rooms);

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 });
// Fresh slate; pin bilingual OFF so the lesson walk-through uses the fast,
// deterministic timing (the toggle itself is asserted separately below).
await page.addInitScript(() => {
  try { localStorage.clear(); localStorage.setItem("pip.bilingual", "0"); } catch (_) {}
});

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

console.log("\n== Load & gate ==");
await page.goto(BASE, { waitUntil: "networkidle" });
ok(await page.locator("#gate").isVisible(), "start gate visible");
ok(await page.locator("#gate-mascot svg").count() === 1, "mascot SVG rendered on gate");
await page.screenshot({ path: join(SHOTS, "1-gate.png") });

await page.locator("#start-btn").click();
await page.waitForTimeout(700);

console.log("\n== Home: subject shelf ==");
ok(await page.locator(".subject-grid").count() === 1, "home shows the subject grid");
ok(await page.locator(".subject-card").count() === 4, "four subject cards");
ok(await page.locator(".world").count() === 0, "old level-map is gone");
ok(await page.locator("#book-btn").count() === 1, "sticker-book button present");
await page.screenshot({ path: join(SHOTS, "2-home.png") });

const fillPct = () => page.evaluate(() => {
  const f = document.querySelector("#lesson-fill");
  return f && f.style.width ? parseFloat(f.style.width) : 0;
});

async function solve(room) {
  const txt = await page.locator("#prompt-text").innerText();
  if (room === "colors") {
    const w = txt.match(/Find the (\w+)/i)[1].toLowerCase();
    await page.locator(`.token[aria-label="${w}"]`).click();
  } else if (room === "shapes") {
    const w = txt.match(/Find the (\w+)/i)[1].toLowerCase();
    await page.locator(`.shape[aria-label="${w}"]`).click();
  } else if (room === "count") {
    const n = await page.locator(".stage .critter").count();
    await page.locator(`.num-btn[aria-label="${n}"]`).click();
  } else if (room === "count10") {
    const n = await page.locator(".stage .critter:not(.is-crossed)").count();
    await page.locator(`.num-btn[aria-label="${n}"]`).click();
  } else if (room === "animals") {
    const sound = txt.match(/says\s+(\w+)/i)[1].toLowerCase();
    const map = { moo:"cow", woof:"dog", meow:"cat", quack:"duck", baa:"sheep", ribbit:"frog", roar:"lion", oink:"pig" };
    await page.locator(`.animal-card[aria-label="${map[sound]}"]`).click();
  } else if (room === "letters") {
    const L = txt.match(/Find the (\w)/i)[1].toUpperCase();
    await page.locator(`.letter-tile[aria-label="${L}"]`).click();
  } else if (room === "casematch") {
    // displayed prompt: "Find the little a" | "Find the big A"
    const m = txt.match(/(?:little|big)\s+(\w)/i);
    await page.locator(`.letter-tile[aria-label="${m[1]}"]`).click();
  } else if (room === "words" || room === "fruits") {
    const w = txt.match(/Find the (\w+)/i)[1].toLowerCase();
    await page.locator(`.animal-card[aria-label="${w}"]`).click();
  } else if (room === "sightwords") {
    const w = txt.match(/Find the word (\w+)/i)[1];
    await page.locator(`.word-tile[aria-label="${w}"]`).click();
  } else if (room === "pattern") {
    const tokens = page.locator(".choices .token");
    const n = await tokens.count();
    const before = await fillPct();
    for (let i = 0; i < n; i++) {
      await tokens.nth(i).click();
      try {
        await page.waitForFunction((b) => {
          const f = document.querySelector("#lesson-fill");
          const done = document.querySelector(".lesson-done.is-show");
          return !!done || (f && f.style.width && parseFloat(f.style.width) > b + 1);
        }, before, { timeout: 800 });
        break;
      } catch { /* wrong token — try the next */ }
    }
  }
}

/** Play one lesson of `room`, assuming we're on its subject's room grid. */
async function playRoom(room, captureSticker = false) {
  console.log(`\n== ${room} ==`);
  await page.locator(`.room-card[data-room="${room}"]`).click();
  await page.waitForTimeout(450);
  ok(await page.locator(".lesson-bar").isVisible(), `${room}: lesson progress bar visible`);

  for (let q = 0; q < 5; q++) {
    await page.waitForSelector(".stage .choices > *, .stage .num-btn", { timeout: 3000 });
    if (room !== "pattern") {
      const before = await fillPct();
      await solve(room);
      await page.waitForFunction((b) => {
        const f = document.querySelector("#lesson-fill");
        return f && f.style.width && parseFloat(f.style.width) > b + 1;
      }, before, { timeout: 3000 }).catch(() => {});
    } else {
      await solve(room);
    }
    if (q < 4) await page.waitForTimeout(820);
  }

  let done = true;
  try { await page.waitForSelector(".lesson-done.is-show", { timeout: 5000 }); }
  catch { done = false; }
  ok(done, `${room}: lesson-complete screen shows after 5 correct`);
  if (done && captureSticker) {
    ok(await page.locator(".sticker-reveal__badge").count() === 1, `${room}: a sticker is revealed`);
    ok(await page.locator(".lesson-done__pip svg").count() === 1, `${room}: Pip celebrates`);
    await page.waitForTimeout(900); // let the staggered stat cards finish animating in
    ok(await page.locator(".lesson-done__stats .stat-card").count() === 3, `${room}: shows all 3 completion stats`);
    await page.screenshot({ path: join(SHOTS, "3-lesson-done.png") });
  }
  await page.locator("#lesson-continue").click();
  await page.waitForTimeout(450);
}

let first = true;
for (const subj of SUBJECTS) {
  console.log(`\n==== subject: ${subj.id} ====`);
  await page.locator(`.subject-card[data-subject="${subj.id}"]`).click();
  await page.waitForTimeout(400);
  ok(await page.locator(".room-grid").count() === 1, `${subj.id}: opens its room grid`);
  ok(await page.locator(".room-card").count() === subj.rooms.length, `${subj.id}: ${subj.rooms.length} game cards`);
  for (const room of subj.rooms) { await playRoom(room, first); first = false; }
  // back to the shelf
  await page.locator("#subj-back").click();
  await page.waitForTimeout(400);
  ok(await page.locator(".subject-grid").count() === 1, `${subj.id}: back returns to the shelf`);
}

console.log("\n== Sticker book ==");
await page.locator("#book-btn").click();
await page.waitForTimeout(400);
ok(await page.locator(".sticker-slot").count() === 26, "sticker book shows all 26 slots");
ok(await page.locator(".sticker-slot.is-owned").count() >= 1, "earned stickers are unlocked");
ok(await page.locator(".sticker-slot.is-locked").count() >= 1, "uncollected stickers show as locked");
await page.screenshot({ path: join(SHOTS, "4-sticker-book.png") });
await page.locator("#book-back").click();
await page.waitForTimeout(300);

console.log("\n== Progress persistence ==");
const save = await page.evaluate(() => JSON.parse(localStorage.getItem("pip.save.v1")));
ok(Object.keys(save.crowns).length === ALL_ROOMS.length, `all ${ALL_ROOMS.length} rooms earned a crown`);
ok(save.streak === 1, `day streak started (=${save.streak})`);
ok(Array.isArray(save.owned) && save.owned.length >= 1, `stickers persisted (=${save.owned ? save.owned.length : 0})`);

console.log("\n== Parent area + bilingual toggle ==");
await page.locator("#parent-btn").dispatchEvent("pointerdown");
await page.waitForTimeout(150);
await page.locator("#parent-btn").dispatchEvent("pointerup");
await page.waitForTimeout(150);
ok(await page.locator(".parent").count() === 0, "a short tap does not open the parent area");
await page.locator("#parent-btn").dispatchEvent("pointerdown");
await page.waitForTimeout(1300);
ok(await page.locator(".parent").count() === 1, "a ~1.1s hold opens the parent area");
await page.waitForTimeout(700);
ok(await page.locator("#bilingual-toggle").count() === 1, "bilingual (Chinese guidance) toggle present");
const onBefore = await page.locator("#bilingual-toggle").getAttribute("aria-checked");
await page.locator("#bilingual-toggle").click();
await page.waitForTimeout(150);
const onAfter = await page.locator("#bilingual-toggle").getAttribute("aria-checked");
ok(onBefore !== onAfter, `bilingual toggle flips (${onBefore} → ${onAfter})`);
await page.screenshot({ path: join(SHOTS, "5-parent-area.png") });
await page.locator("#reset-btn").click();
await page.waitForTimeout(150);
ok((await page.locator("#reset-btn .big-btn__label").innerText()) === "Tap again to confirm", "reset asks for a confirm tap first");
await page.locator("#reset-btn").click();
await page.waitForTimeout(500);
ok(await page.locator(".subject-grid").count() === 1, "confirming returns to the shelf");
const wiped = await page.evaluate(() => JSON.parse(localStorage.getItem("pip.save.v1")));
ok(Object.keys(wiped.crowns).length === 0 && wiped.streak === 0, "reset actually clears saved progress");

console.log("\n== Console errors ==");
ok(errors.length === 0, "no console/page errors" + (errors.length ? ": " + errors.join(" | ") : ""));

/* ---- regenerate the PNG icons from the SVG ---- */
console.log("\n== Icons ==");
async function renderIcon(size, out, src = "icon.svg") {
  const p = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><html><body style="margin:0;padding:0"><img src="http://localhost:8123/icons/${src}" width="${size}" height="${size}"></body></html>`, { waitUntil: "networkidle" });
  await p.waitForTimeout(150);
  await p.screenshot({ path: join(ROOT, "icons", out), clip: { x: 0, y: 0, width: size, height: size } });
  await p.close();
  console.log("  ✓ wrote icons/" + out);
}
await renderIcon(192, "icon-192.png");
await renderIcon(512, "icon-512.png");
await renderIcon(512, "icon-maskable-512.png", "icon-maskable.svg");

await browser.close();
console.log("\n" + (fails.length ? `FAILED (${fails.length}):\n - ` + fails.join("\n - ") : "ALL PASS ✅"));
process.exit(fails.length ? 1 : 0);
