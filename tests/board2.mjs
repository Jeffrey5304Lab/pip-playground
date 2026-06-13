import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const p = await b.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:8123/index.html", { waitUntil: "networkidle" });
await p.locator("#start-btn").click(); await p.waitForTimeout(700);
await p.screenshot({ path: "tests/shots/hub7.png" });
const names = ["colors","shapes","numbers","animals","letters","words","patterns"];
for (const idx of [4,5,6]) {
  await p.locator(".room-card").nth(idx).click();
  await p.waitForTimeout(700);
  await p.screenshot({ path: `tests/shots/board-${names[idx]}.png` });
  await p.locator("#home-btn").click(); await p.waitForTimeout(400);
}
await b.close(); console.log("done");
