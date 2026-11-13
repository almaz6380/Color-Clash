// Spielt beide Modi im simulierten iPhone-Browser durch und speichert Screenshots.
// Aufruf: node tests/ui.test.js   (braucht Playwright mit Chromium)
"use strict";
const path = require("path");
const fs = require("fs");
const { chromium, devices } = require("playwright");

const url = "file://" + path.join(__dirname, "..", "index.html");
const shots = path.join(__dirname, "screenshots");
fs.mkdirSync(shots, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  page.on("dialog", d => d.accept());

  // --- Tippen ---
  await page.goto(url);
  await page.waitForSelector("#betBody:not(.hidden)", { timeout: 20000 });
  const odds = await page.$$eval(".bodds", els => els.map(e => e.textContent));
  await page.tap(".ballbtn >> nth=0");
  await page.screenshot({ path: path.join(shots, "1-tipp.png") });
  await page.tap("#goBtn");
  await page.waitForTimeout(3000);
  if (await page.isEnabled("#boostBtn")) await page.tap("#boostBtn");
  await page.screenshot({ path: path.join(shots, "2-kampf.png") });
  await page.waitForSelector("#resultPanel:not(.hidden)", { timeout: 60000 });
  const tipResult = await page.textContent("#resTitle");
  await page.tap("#nextBtn");
  await page.waitForSelector("#betBody:not(.hidden)", { timeout: 20000 });

  // --- Duell ---
  await page.tap("#kindDuel");
  await page.waitForSelector("#duelBody:not(.hidden)");
  await page.tap("#duelList .ballbtn >> nth=0");
  await page.screenshot({ path: path.join(shots, "3-duell-wahl.png") });
  await page.tap("#duelGo");
  const box = await page.locator("#cv").boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height * 0.43;
  for (let k = 0; k < 3; k++) {
    await page.waitForTimeout(1300);
    await page.mouse.move(cx, cy); await page.mouse.down();
    await page.mouse.move(cx + (k % 2 ? -120 : 120), cy + 60, { steps: 5 }); await page.mouse.up();
  }
  const steered = await page.evaluate(() => game.steerReady > 0);
  for (const id of ["#jkShield", "#jkMagnet", "#jkTurbo"]) if (await page.isEnabled(id)) await page.tap(id);
  await page.screenshot({ path: path.join(shots, "4-duell-kampf.png") });
  await page.waitForSelector("#resultPanel:not(.hidden)", { timeout: 60000 });
  const duelResult = await page.textContent("#resTitle");
  await page.screenshot({ path: path.join(shots, "5-duell-ergebnis.png") });

  // --- Speicher überlebt Neuladen ---
  const coinsBefore = await page.textContent("#coins");
  await page.reload();
  await page.waitForSelector("#betBody:not(.hidden)", { timeout: 20000 });
  const coinsAfter = await page.textContent("#coins");

  await browser.close();

  let failed = 0;
  const check = (ok, msg) => { console.log(`${ok ? "OK  " : "FAIL"} ${msg}`); if (!ok) failed++; };
  check(odds.length === 4, `Quoten angezeigt: ${odds.join(" | ")}`);
  check(!!tipResult, `Tipp-Runde beendet: ${tipResult}`);
  check(steered, "Wischen lenkt den Ball im Duell");
  check(!!duelResult, `Duell beendet: ${duelResult}`);
  check(coinsBefore === coinsAfter, `Münzen nach Neuladen gleich (${coinsAfter})`);
  check(errors.length === 0, `Keine Konsolenfehler${errors.length ? ": " + errors.join("; ") : ""}`);
  console.log(`Screenshots: ${shots}`);
  process.exit(failed ? 1 : 0);
})();
