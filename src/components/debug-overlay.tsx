"use client";

import { useEffect, useState } from "react";

// Overlay de depuracion: pinta medidas de layout en la parte superior de la
// pantalla para diagnosticar en el movil real (PWA standalone) sin consola.
// Se activa con ?debug=1 (persiste en localStorage, sobrevive al lanzar la PWA
// desde el icono). Tocar el recuadro lo desactiva. Inocuo salvo que se active.
export function DebugOverlay() {
  const [on, setOn] = useState(false);
  const [data, setData] = useState("");

  useEffect(() => {
    const param = new URLSearchParams(location.search).get("debug");
    if (param === "1") localStorage.setItem("debug", "1");
    if (param === "0") localStorage.removeItem("debug");
    setOn(localStorage.getItem("debug") === "1");
  }, []);

  useEffect(() => {
    if (!on) return;
    const measure = () => {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0;visibility:hidden";
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const insTop = cs.paddingTop;
      const insBot = cs.paddingBottom;
      probe.remove();

      const r = (el: Element | null | undefined) =>
        el
          ? (b => `${Math.round(b.top)}..${Math.round(b.bottom)} h${Math.round(b.height)}`)(
              el.getBoundingClientRect()
            )
          : "—";
      const main = document.querySelector("main");
      const ml = document.querySelector("main .overflow-y-auto");
      const strip = [...document.querySelectorAll("div")].find(
        (d) => d.className.includes("backdrop-blur") && d.textContent?.includes("quién pasa")
      );
      const nav = document.querySelector("nav.fixed.bottom-0");
      const standalone =
        matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone ||
        false;

      setData(
        `standalone=${standalone} innerH=${innerHeight}\n` +
          `insets t=${insTop} b=${insBot}\n` +
          `outer ${r(main?.parentElement)}\n` +
          `main  ${r(main)} pb=${main ? getComputedStyle(main).paddingBottom : "—"}\n` +
          `mlist ${ml ? `scroll=${ml.scrollHeight > ml.clientHeight} c${ml.clientHeight}/s${ml.scrollHeight}` : "—"}\n` +
          `nav   ${r(nav)}\n` +
          `strip ${r(strip)}`
      );
    };
    measure();
    const id = setInterval(measure, 1000);
    return () => clearInterval(id);
  }, [on]);

  if (!on) return null;
  return (
    <pre
      onClick={() => {
        localStorage.removeItem("debug");
        location.reload();
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        margin: 0,
        padding: "4px 6px",
        fontSize: 10,
        lineHeight: 1.3,
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        whiteSpace: "pre-wrap",
      }}
    >
      {data}
    </pre>
  );
}
