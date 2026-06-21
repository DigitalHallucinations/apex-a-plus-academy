// Regenerates the documentation screenshots in docs/screenshots/ from the live
// app, seeded with the deterministic demo state. Repeatable: same viewport, same
// data, same framing every run.
//
//   1. node scripts/demo-state.mjs      # (re)generate the demo state
//   2. npm run dev                      # start the dev server (port 1420)
//   3. npm run screenshots              # capture into docs/screenshots/
//
// Override the target with SCREENSHOT_URL (e.g. a `vite preview` build).
import { chromium } from "playwright";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASE = process.env.SCREENSHOT_URL || "http://localhost:1420";
const OUT = "docs/screenshots";
if (!existsSync(`${OUT}/demo-state.json`)) {
  console.log("demo-state.json missing — generating it");
  execFileSync(process.execPath, ["scripts/demo-state.mjs"], { stdio: "inherit" });
}
const state = readFileSync(`${OUT}/demo-state.json`, "utf8");
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.addInitScript(s => {
  localStorage.setItem("apex-state", s);
  localStorage.setItem("skillforge-onboarded", "1"); // never capture the first-run tour
}, state);

try {
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 });
} catch {
  console.error(`Could not reach ${BASE}. Start the dev server first: npm run dev`);
  await browser.close();
  process.exit(1);
}

const nav = label => page.getByRole("button", { name: label, exact: true }).click();
const btn = label => page.getByRole("button", { name: label, exact: true }).click();
async function shot(name) {
  await sleep(600); // let charts/animations settle
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("captured", name);
}

// 1. Command Center — data-rich dashboard with the sidebar track switcher.
await nav("Command Center");
await page.waitForSelector(".result-ring, .hero-copy");
await shot("01-command-center");

// 2. Learning Paths — objectives, lessons, and per-objective progress.
await nav("Learning Paths");
await page.waitForSelector(".learn-layout");
await shot("02-learning-paths");

// 3. Practice Lab — an active single-answer question.
await nav("Practice Lab");
await page.waitForSelector(".setup-grid");
await btn("Launch session");
await page.waitForSelector(".exam-shell .answers button");
await shot("03-practice-lab");

// 4. Mock Exam — an active, timed, domain-weighted question (MCQ first).
await nav("Mock Exam");
await page.waitForSelector(".setup-grid");
await page.locator('label:has-text("Performance-based") + .count-picker button', { hasText: "0" }).first().click();
await page.fill('input[aria-label="Custom question count"]', "90");
await btn("Begin mock exam");
await page.waitForSelector(".exam-shell .answers");
await shot("04-mock-exam");

// 5. Recall Deck — a spaced-repetition flashcard.
await nav("Recall Deck");
await page.waitForSelector(".flashcard");
await shot("05-recall-deck");

// 6. Performance — analytics including the objective-coverage heatmap.
await nav("Performance");
await page.waitForSelector(".obj-heatmap", { timeout: 15000 });
await shot("06-performance");

// 7. Multi-select — the "choose two/three" format with checkboxes + hint.
await nav("Mock Exam");
await page.waitForSelector(".setup-grid");
await page.locator('label:has-text("Performance-based") + .count-picker button', { hasText: "0" }).first().click();
await page.fill('input[aria-label="Custom question count"]', "999");
await btn("Begin mock exam");
await page.waitForSelector(".exam-shell .answers");
let found = false;
for (let i = 0; i < 250 && !found; i++) {
  if (await page.locator(".mcq-hint").count()) { found = true; break; }
  await page.getByRole("button", { name: /^Next/ }).click();
  await sleep(15);
}
if (!found) throw new Error("no multi-select question encountered");
const opts = page.locator(".answers button");
await opts.nth(0).click();
await opts.nth(1).click();
await shot("07-multi-select");

// 8. Track switcher — the multi-track experience, menu open.
await nav("Command Center");
await page.locator(".track-current").click();
await page.waitForSelector(".track-menu");
await shot("08-track-switcher");

await browser.close();
console.log("done");
