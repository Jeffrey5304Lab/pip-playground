import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const p = await b.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:8123/index.html", { waitUntil: "networkidle" });
await p.locator("#start-btn").click(); await p.waitForTimeout(600);
const names = ["colors","shapes","numbers","animals"];
for (let i=0;i<4;i++){
  await p.locator(".room-card").nth(i).click();
  await p.waitForTimeout(500);
  if(i===2){ const c=p.locator(".count-field .critter"); const n=await c.count(); for(let k=0;k<n;k++){await c.nth(k).click();await p.waitForTimeout(50);} }
  await p.screenshot({ path: `tests/shots/board-${names[i]}.png` });
  await p.locator("#home-btn").click(); await p.waitForTimeout(300);
}
await b.close(); console.log("done");
