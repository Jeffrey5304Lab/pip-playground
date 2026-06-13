/* Playwright smoke + interaction test for Pip's Playground.
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
  args: ["--use-fake-ui-for-media-stream"],
});
const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 });

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

console.log("\n== Home hub ==");
const rooms = page.locator(".room-card");
ok(await rooms.count() === 4, "hub shows 4 game rooms");
ok(await page.locator("#sound-toggle").isVisible(), "sound toggle visible");
await page.screenshot({ path: join(SHOTS, "2-hub.png") });

async function playRoom(idx, name, makeCorrect) {
  console.log(`\n== ${name} ==`);
  await page.locator(".room-card").nth(idx).click();
  await page.waitForTimeout(500);
  ok(await page.locator(".prompt").isVisible(), `${name}: prompt bar visible`);
  const starsBefore = parseInt(await page.locator("#star-count").innerText(), 10);
  await makeCorrect();
  let shown = true;
  try { await page.waitForSelector(".reward.is-show", { timeout: 1500 }); }
  catch { shown = false; }
  ok(shown, `${name}: reward overlay shows on correct`);
  await page.screenshot({ path: join(SHOTS, `3-${name}.png`) });
  await page.waitForTimeout(1700); // reward auto-dismiss + next round
  const starsAfter = parseInt(await page.locator("#star-count").innerText(), 10);
  ok(starsAfter === starsBefore + 1, `${name}: star count incremented (${starsBefore}→${starsAfter})`);
  await page.locator("#home-btn").click();
  await page.waitForTimeout(400);
}

// Identify the correct choice from the prompt text and pick it.
await playRoom(0, "colors", async () => {
  const word = (await page.locator("#prompt-text").innerText()).match(/Find the (\w+)/i)[1].toLowerCase();
  await page.locator(`.token[aria-label="${word}"]`).click();
});
await playRoom(1, "shapes", async () => {
  const word = (await page.locator("#prompt-text").innerText()).match(/Find the (\w+)/i)[1].toLowerCase();
  await page.locator(`.shape[aria-label="${word}"]`).click();
});
await playRoom(2, "numbers", async () => {
  const crit = page.locator(".count-field .critter");
  const n = await crit.count();
  for (let i = 0; i < n; i++) { await crit.nth(i).click(); await page.waitForTimeout(60); }
  await page.locator(`.num-btn[aria-label="${n}"]`).click();
});
await playRoom(3, "animals", async () => {
  // prompt asks "Who says <Sound>?" — map back to the animal aria-label via known table
  const sound = (await page.locator("#prompt-text").innerText()).match(/says\s+(\w+)/i)[1].toLowerCase();
  const map = { moo:"cow", woof:"dog", meow:"cat", quack:"duck", baa:"sheep", ribbit:"frog", roar:"lion", oink:"pig" };
  await page.locator(`.animal-card[aria-label="${map[sound]}"]`).click();
});

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
