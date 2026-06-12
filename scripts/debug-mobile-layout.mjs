// Reproduce el bug del StandingsStrip bajo el BottomNav en mobile PWA.
// Emula safe-area insets de iPhone via CDP y mide geometría real.
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
    const probe = getComputedStyle(document.body).paddingTop;
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      bodyPaddingTop: probe,
      htmlScrollH: document.documentElement.scrollHeight,
      nav: r(nav),
      strip: r(strip),
      main: r(main),
      mainPB: main ? getComputedStyle(main).paddingBottom : null,
    };
  });
  console.log(`\n── ${label} ──`);
  console.log(JSON.stringify(data));
  if (data.nav && data.strip) {
    const overlap = data.strip.bottom - data.nav.top;
    console.log(
      overlap > 1
        ? `❌ SOLAPE: el strip baja ${overlap.toFixed(1)}px por debajo del top del nav`
        : `✓ sin solape (margen ${(-overlap).toFixed(1)}px)`
    );
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
});
const page = await browser.newPage();

// Emular safe-area de iPhone (notch + home indicator)
const cdp = await page.createCDPSession();
try {
  await cdp.send("Emulation.setSafeAreaInsetsOverride", {
    insets: { top: 59, topMax: 59, left: 0, leftMax: 0, bottom: 34, bottomMax: 34, right: 0, rightMax: 0 },
  });
  console.log("✓ safe-area emulada: top=59 bottom=34");
} catch (e) {
  console.warn("⚠ no se pudo emular safe-area:", e.message);
}

const next = encodeURIComponent(`/pools/${POOL}/predictions`);
await page.goto(`${BASE}/dev/login?email=${encodeURIComponent(ME)}&next=${next}`, {
  waitUntil: "networkidle2",
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 1500));
await measure(page, "PORRA PROPIA (own-closed)");
await page.screenshot({ path: "scripts/_own.png" });

await page.goto(`${BASE}/pools/${POOL}/predictions?player=${OTHER}`, {
  waitUntil: "networkidle2",
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 1500));
await measure(page, "PORRA DE OTRO (viewing-other)");
await page.screenshot({ path: "scripts/_other.png" });

await browser.close();
