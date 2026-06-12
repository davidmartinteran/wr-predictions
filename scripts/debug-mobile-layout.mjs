// Reproduce el corte del StandingsStrip bajo el BottomNav.
// Mide en FRESH LOAD vs SOFT NAVIGATION (click en nav), con y sin safe-area.
// Uso: node scripts/debug-mobile-layout.mjs [playerUserId]

import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const POOL = "b8cd6b79-20c2-4073-86ab-ec4269befdd1";
const ME = "davidmartinteran@gmail.com";
const OTHER = process.argv[2] ?? "7b3255ce-0978-4a12-a01e-2c7f67c62ba2";

async function measure(page, label) {
  const data = await page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), h: +b.height.toFixed(1) };
    };
    const nav = document.querySelector("nav.fixed.bottom-0");
    const strip = document.querySelector("main div.backdrop-blur");
    const main = document.querySelector("main");
    return {
      vh: window.innerHeight,
      nav: r(nav),
      strip: r(strip),
      main: r(main),
      mainPB: main ? getComputedStyle(main).paddingBottom : null,
      bodyH: r(document.body),
    };
  });
  let verdict = "";
  if (data.nav && data.strip) {
    const overlap = data.strip.bottom - data.nav.top;
    verdict = overlap > 1
      ? `❌ SOLAPE ${overlap.toFixed(1)}px (strip.bottom=${data.strip.bottom} > nav.top=${data.nav.top})`
      : `✓ ok (margen ${(-overlap).toFixed(1)}px)`;
  } else verdict = `strip=${!!data.strip} nav=${!!data.nav}`;
  console.log(`  ${label.padEnd(22)} vh=${data.vh} mainPB=${data.mainPB} | ${verdict}`);
}

async function run(insets) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
  });
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();
  if (insets) {
    await cdp.send("Emulation.setSafeAreaInsetsOverride", {
      insets: { top: 59, topMax: 59, left: 0, leftMax: 0, bottom: 34, bottomMax: 34, right: 0, rightMax: 0 },
    });
  }
  console.log(`\n═══ ${insets ? "PWA (insets 59/34)" : "WEB VIEW (insets 0)"} ═══`);

  // Login + landing fresco en predictions propias
  const next = encodeURIComponent(`/pools/${POOL}/predictions`);
  await page.goto(`${BASE}/dev/login?email=${encodeURIComponent(ME)}&next=${next}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  await measure(page, "FRESH propia");

  // Soft-nav: Clasificación → (back) Pronósticos, vía clicks en el bottom nav
  const clickNav = async (label) => {
    await page.evaluate((lbl) => {
      const link = [...document.querySelectorAll("nav.fixed.bottom-0 a")].find((a) => a.textContent?.includes(lbl));
      link?.click();
    }, label);
    await new Promise((r) => setTimeout(r, 900));
  };
  await clickNav("Calendario");
  await clickNav("Pronósticos");
  await measure(page, "SOFT-NAV propia");

  // Ir a porra de otro (link interno o goto). Probamos soft via goto+history no aplica;
  // usamos goto directo (fresh) y luego soft-nav de vuelta.
  await page.goto(`${BASE}/pools/${POOL}/predictions?player=${OTHER}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  await measure(page, "FRESH otro");
  await clickNav("Calendario");
  await clickNav("Pronósticos");
  await measure(page, "SOFT-NAV (vuelve propia)");

  await browser.close();
}

await run(false);
await run(true);
