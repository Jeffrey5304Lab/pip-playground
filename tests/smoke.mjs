/* Playwright smoke + interaction test for Pip's Playground.
   Walks every room through a full lesson and asserts the Duolingo-style
   progression (progress fill, lesson-complete, persisted crowns).
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

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 });
// fresh slate every run
await page.addInitScript(() => { try { localStorage.clear(); } catch (_) {} });

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

console.log("\n== Level map ==");
ok(await page.locator(".world").count() === 7, "map shows 7 worlds");
ok(await page.locator(".node").count() === 21, "map shows 3 nodes per world");
ok(await page.locator(".node.is-current").count() >= 1, "current node(s) marked");
ok(await page.locator(".node.is-locked").count() >= 1, "later nodes locked until earned");
ok(await page.locator(".stat-chip--streak").count() === 1, "map shows streak chip");
await page.screenshot({ path: join(SHOTS, "2-map.png") });

const fillPct = () => page.evaluate(() => {
  const f = document.querySelector("#lesson-fill");
  return f ? parseFloat(getComputedStyle(f).width) : 0;
});

async function solve(name) {
  const txt = await page.locator("#prompt-text").innerText();
  if (name === "colors") {
    const w = txt.match(/Find the (\w+)/i)[1].toLowerCase();
    await page.locator(`.token[aria-label="${w}"]`).click();
  } else if (name === "shapes") {
    const w = txt.match(/Find the (\w+)/i)[1].toLowerCase();
    await page.locator(`.shape[aria-label="${w}"]`).click();
  } else if (name === "numbers") {
    const n = await page.locator(".count-field .critter").count();
    await page.locator(`.num-btn[aria-label="${n}"]`).click();
  } else if (name === "animals") {
    const sound = txt.match(/says\s+(\w+)/i)[1].toLowerCase();
    const map = { moo:"cow", woof:"dog", meow:"cat", quack:"duck", baa:"sheep", ribbit:"frog", roar:"lion", oink:"pig" };
    await page.locator(`.animal-card[aria-label="${map[sound]}"]`).click();
  } else if (name === "letters") {
    const L = txt.match(/Find the (\w)/i)[1].toUpperCase();
    await page.locator(`.letter-tile[aria-label="${L}"]`).click();
  } else if (name === "words") {
    const w = txt.match(/Find the (\w+)/i)[1].toLowerCase();
    await page.locator(`.animal-card[aria-label="${w}"]`).click();
  } else if (name === "patterns") {
    const before = await fillPct();
    const tokens = page.locator(".choices .token");
    const n = await tokens.count();
    for (let i = 0; i < n; i++) {
      await tokens.nth(i).click();
      await page.waitForTimeout(380);
      if (await fillPct() > before + 1) break;
    }
  }
}

async function playLesson(idx, name) {
  console.log(`\n== ${name} ==`);
  await page.locator(".world").nth(idx).locator(".node:not(.is-locked)").first().click();
  await page.waitForTimeout(500);
  ok(await page.locator(".lesson-bar").isVisible(), `${name}: lesson progress bar visible`);

  for (let q = 0; q < 5; q++) {
    await page.waitForSelector(".stage .choices > *", { timeout: 3000 });
    if (name !== "patterns") {
      const before = await fillPct();
      await solve(name);
      await page.waitForFunction((b) => {
        const f = document.querySelector("#lesson-fill");
        return f && parseFloat(getComputedStyle(f).width) > b + 1;
      }, before, { timeout: 3000 }).catch(() => {});
    } else {
      await solve(name);
    }
    if (q < 4) await page.waitForTimeout(820);
  }

  let done = true;
  try { await page.waitForSelector(".lesson-done.is-show", { timeout: 4000 }); }
  catch { done = false; }
  ok(done, `${name}: lesson-complete screen shows after 5 correct`);
  if (done && idx === 0) {
    ok(await page.locator(".sticker-reveal__badge").count() === 1, `${name}: a sticker is revealed on completion`);
    await page.screenshot({ path: join(SHOTS, "3-lesson-done.png") });
  }
  await page.locator("#lesson-continue").click();
  await page.waitForTimeout(500);
}

await playLesson(0, "colors");
ok(await page.locator('.world[data-room="colors"] .node.is-done').count() >= 1, "completed node shows on map after a lesson");
await playLesson(1, "shapes");
await playLesson(2, "numbers");
await playLesson(3, "animals");
await playLesson(4, "letters");
await playLesson(5, "words");
await playLesson(6, "patterns");

console.log("\n== Sticker book ==");
await page.locator("#book-btn").click();
await page.waitForTimeout(400);
ok(await page.locator(".sticker-slot").count() === 16, "sticker book shows all 16 slots");
ok(await page.locator(".sticker-slot.is-owned").count() >= 1, "earned stickers are unlocked in the book");
ok(await page.locator(".sticker-slot.is-locked").count() >= 1, "uncollected stickers show as locked");
await page.screenshot({ path: join(SHOTS, "4-sticker-book.png") });
await page.locator("#book-back").click();
await page.waitForTimeout(300);

console.log("\n== Progress persistence ==");
const save = await page.evaluate(() => JSON.parse(localStorage.getItem("pip.save.v1")));
ok(Object.keys(save.crowns).length === 7, "all 7 rooms earned a crown");
ok(save.streak === 1, `day streak started (=${save.streak})`);
ok(Array.isArray(save.owned) && save.owned.length >= 1, `stickers persisted (=${save.owned ? save.owned.length : 0})`);

console.log("\n== Console errors ==");
ok(errors.length === 0, "no console/page errors" + (errors.length ? ": " + errors.join(" | ") : ""));

/* ---- generate PNG icons from the SVG ---- */
console.log("\n== Icons ==");
async function renderIcon(size, out) {
  const p = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><html><body style="margin:0;padding:0"><img src="http://localhost:8123/icons/icon.svg" width="${size}" height="${size}"></body></html>`, { waitUntil: "networkidle" });
  await p.waitForTimeout(150);
  await p.screenshot({ path: join(ROOT, "icons", out), clip: { x: 0, y: 0, width: size, height: size } });
  await p.close();
  console.log("  ✓ wrote icons/" + out);
}
await renderIcon(192, "icon-192.png");
await renderIcon(512, "icon-512.png");
await renderIcon(512, "icon-maskable-512.png");

await browser.close();
console.log("\n" + (fails.length ? `FAILED (${fails.length}):\n - ` + fails.join("\n - ") : "ALL PASS ✅"));
process.exit(fails.length ? 1 : 0);
