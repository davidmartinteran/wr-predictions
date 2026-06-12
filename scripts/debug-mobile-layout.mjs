// Repro dirigido: soft-nav clasificación -> porra de otro (clic en jugador).
// Mide el StandingsStrip vs BottomNav. Web view (sin insets) por defecto.
// Uso: node scripts/debug-mobile-layout.mjs

import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const POOL = "b8cd6b79-20c2-4073-86ab-ec4269befdd1";
const ME = "davidmartinteran@gmail.com";

async function measure(page, label) {
  const data = await page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), h: +b.height.toFixed(1) };
    };
    const stripWrap = [...document.querySelectorAll("div")].find(
      (d) => d.className.includes("backdrop-blur") && d.textContent?.includes("quién pasa")
    );
    return {
      url: location.pathname + location.search,
      vh: window.innerHeight,
      nav: r(document.querySelector("nav.fixed.bottom-0")),
      strip: r(stripWrap),
      main: r(document.querySelector("main")),
    };
  });
  let verdict = "strip NO encontrado (sección no-grupos o no renderiza)";
  if (data.nav && data.strip) {
    const overlap = data.strip.bottom - data.nav.top;
    verdict = overlap > 1 ? `❌ SOLAPE ${overlap.toFixed(1)}px` : `✓ ok (${(-overlap).toFixed(1)}px)`;
  }
  console.log(`  ${label.padEnd(28)} ${(data.url).padEnd(50)} strip.bottom=${data.strip?.bottom ?? "—"} nav.top=${data.nav?.top ?? "—"} main.h=${data.main?.h} | ${verdict}`);
  return data;
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
});
const page = await browser.newPage();

// 1) Login fresco aterrizando en la CLASIFICACIÓN
const next = encodeURIComponent(`/pools/${POOL}/leaderboard`);
await page.goto(`${BASE}/dev/login?email=${encodeURIComponent(ME)}&next=${next}`, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));
console.log(`  (en clasificación: ${page.url()})`);

// 2) Clic en un jugador que NO sea el actual -> soft-nav a su porra
const clicked = await page.evaluate(() => {
  const link = [...document.querySelectorAll('a[href*="?player="]')][0];
  if (!link) return null;
  const href = link.getAttribute("href");
  link.click();
  return href;
});
console.log(`  (clic soft-nav: ${clicked})`);
await new Promise((r) => setTimeout(r, 1400));
const d = await measure(page, "SOFT-NAV clasif->otro");
await page.screenshot({ path: "scripts/_softnav_otro.png" });

// 3) FRESH directo a esa misma porra (full load) para comparar
const other = clicked?.match(/player=([^&]+)/)?.[1];
if (other) {
  await page.goto(`${BASE}/pools/${POOL}/predictions?player=${other}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  await measure(page, "FRESH otro (full load)");
  await page.screenshot({ path: "scripts/_fresh_otro.png" });
}

await browser.close();
