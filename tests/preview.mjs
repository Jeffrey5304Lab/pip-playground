import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const p = await b.newPage({ viewport: { width: 760, height: 700 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:8123/tests/preview.html", { waitUntil: "networkidle" });
await p.waitForTimeout(300);
await p.screenshot({ path: "tests/shots/art-preview.png", fullPage: true });
await b.close(); console.log("ok");
