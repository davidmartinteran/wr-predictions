// Desktop screens (1440 x 900). Same brand & components scaled up.

const { useState: useStateD, useMemo: useMemoD } = React;

// ────────────────────────────────────────────────
// Shared desktop chrome
// ────────────────────────────────────────────────
function DesktopShell({ children, activeTab }) {
  return (
    <div className="w-[1440px] h-[900px] bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden" style={{ "--accent": "#1B9E5B" }}>
      <DesktopTopBar active={activeTab}/>
      <div className="flex-1 flex min-h-0">{children}</div>
    </div>
  );
}
function DesktopTopBar({ active }) {
  const tabs = [
    { id: "predictions", label: "Pronósticos" },
    { id: "ranking",     label: "Clasificación" },
    { id: "mine",        label: "Mi Porra" },
  ];
  return (
    <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur shrink-0 flex items-center px-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
          <window.Icon.Trophy className="w-4 h-4 text-zinc-950"/>
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-zinc-50">Porra Mundial 2026</div>
          <div className="text-[10.5px] text-zinc-500 tabular-nums">Los Amigos · 30 jugadores</div>
        </div>
      </div>
      <div className="ml-10 flex items-center gap-1">
        {tabs.map(t => (
          <div key={t.id} className={`px-3 py-1.5 text-[13px] rounded-md ${active === t.id ? "bg-zinc-900 text-zinc-50 border border-zinc-800" : "text-zinc-400"}`}>
            {t.label}
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800">
          <window.Icon.Live className="w-1.5 h-1.5 text-rose-400 animate-pulse"/>
          <span className="text-[11px] text-zinc-300">2 partidos en juego</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-right leading-tight">
            <div className="text-[12px] text-zinc-200 font-medium">Javi M.</div>
            <div className="text-[10.5px] text-zinc-500 tabular-nums">#5 · 64 pts</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-semibold text-zinc-200">JM</div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// 1. Desktop · Pronósticos · Fase de grupos
// ────────────────────────────────────────────────
window.DesktopPronosticos = function DesktopPronosticos() {
  const [active, setActive] = useStateD("C");
  const [picks, setPicks] = useStateD(() => {
    const seed = {};
    [["A-1",1,0],["A-2",2,2],["A-3",1,1],["A-4",3,1],["A-5",2,0],["A-6",1,1],
     ["B-1",0,1],["B-2",1,2],["B-3",1,1],["B-4",2,2],
     ["C-1",1,2],["C-2",2,0],["C-3",1,1],
     ["D-1",2,1],["D-2",1,0],["D-3",0,2],
     ["E-1",2,0],["E-2",1,1],
     ["F-1",2,1],["F-2",1,2],["F-3",0,1],
     ["G-1",1,1],["G-2",2,1]].forEach(([id,h,a]) => { seed[id] = {h,a}; });
    return seed;
  });
  const filled = Object.values(picks).filter(window.isFilled).length;
  const groupMatches = window.MATCHES.filter(m => m.group === active);

  return (
    <DesktopShell activeTab="predictions">
      {/* LEFT — group sidebar */}
      <aside className="w-[260px] border-r border-zinc-800/80 bg-zinc-950 shrink-0 flex flex-col">
        <div className="p-5 border-b border-zinc-800/80">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-1">Pronósticos</div>
          <h2 className="text-[17px] font-semibold text-zinc-50">Fase de grupos</h2>
        </div>
        <div className="p-3 flex-1 overflow-y-auto">
          {window.GROUPS.map(g => {
            const ms = window.MATCHES.filter(m => m.group === g.id);
            const f = ms.filter(m => window.isFilled(picks[m.id])).length;
            const a = g.id === active;
            const done = f === 6;
            return (
              <button key={g.id} onClick={() => setActive(g.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-colors ${a ? "bg-zinc-900 border border-zinc-800" : "border border-transparent hover:bg-zinc-900/50"}`}>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold ${a ? "bg-zinc-100 text-zinc-950" : "bg-zinc-800 text-zinc-300"}`}>{g.id}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium ${a ? "text-zinc-50" : "text-zinc-300"}`}>Grupo {g.id}</div>
                  <div className="text-[10.5px] text-zinc-500 truncate">{g.teams.map(t => t.flag).join(" ")}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="text-[10.5px] text-zinc-500 tabular-nums">{f}/6</div>
                  {done && <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}><window.Icon.Check className="w-2.5 h-2.5 text-zinc-950"/></div>}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* CENTER — selected group */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-10 py-7 max-w-[920px]">
          {/* Group header */}
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-3">
              <h1 className="text-[32px] font-bold text-zinc-50 leading-none">Grupo {active}</h1>
              <div className="text-[13px] text-zinc-500">6 partidos · {groupMatches.filter(m=>window.isFilled(picks[m.id])).length} completados</div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
              <window.Icon.Lock className="w-3 h-3"/><span>Bloqueo: 11 jun 17:00</span>
            </div>
          </div>
          {/* Teams strip */}
          <div className="grid grid-cols-4 gap-2 mt-4 mb-6">
            {window.GROUPS.find(g => g.id === active).teams.map(t => (
              <div key={t.code} className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5 flex items-center gap-2.5">
                <span className="text-[22px]">{t.flag}</span>
                <div className="leading-tight">
                  <div className="text-[13px] text-zinc-100 font-medium">{t.name}</div>
                  <div className="text-[10.5px] text-zinc-500">FIFA #{12 + t.code.charCodeAt(0) % 30}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Matchdays */}
          {[1,2,3].map(md => {
            const dayMatches = groupMatches.filter(m => m.matchday === md);
            return (
              <div key={md} className="mb-7">
                <div className="flex items-baseline gap-2 mb-2.5">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Jornada {md}</div>
                  <div className="text-[11px] text-zinc-600">{dayMatches[0].date}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {dayMatches.map(m => {
                    const p = picks[m.id];
                    const f = window.isFilled(p);
                    return (
                      <div key={m.id} className={`rounded-xl border bg-zinc-900/40 p-4 transition-colors ${f ? "border-zinc-700" : "border-zinc-800/80"}`}>
                        <div className="flex items-center justify-between mb-3 text-[10.5px] uppercase tracking-[0.12em] text-zinc-500">
                          <div>{m.date} · {m.time}</div>
                          <div className="text-zinc-600 normal-case tracking-normal">{m.venue}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2.5 flex-1">
                            <span className="text-[28px] leading-none">{m.home.flag}</span>
                            <div className="text-[15px] text-zinc-100 font-medium">{m.home.name}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DesktopScoreInput value={p?.h} onChange={v => setPicks(x => ({ ...x, [m.id]: { ...(x[m.id]||{}), h: v } }))}/>
                            <span className="text-zinc-700">:</span>
                            <DesktopScoreInput value={p?.a} onChange={v => setPicks(x => ({ ...x, [m.id]: { ...(x[m.id]||{}), a: v } }))}/>
                          </div>
                          <div className="flex items-center gap-2.5 flex-1 justify-end text-right">
                            <div className="text-[15px] text-zinc-100 font-medium">{m.away.name}</div>
                            <span className="text-[28px] leading-none">{m.away.flag}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* RIGHT — progress rail */}
      <aside className="w-[280px] border-l border-zinc-800/80 bg-zinc-950 shrink-0 p-5 overflow-y-auto">
        <DesktopStandingsPreview groupId={active} picks={picks}/>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 mb-4">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Tu progreso</div>
            <div className="text-[11px] tabular-nums font-medium" style={{ color: "var(--accent)" }}>{Math.round(filled/72*100)}%</div>
          </div>
          <div className="text-[28px] font-bold text-zinc-50 tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {filled}<span className="text-zinc-600">/72</span>
          </div>
          <div className="text-[11px] text-zinc-500 mb-3">partidos de fase de grupos</div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${filled/72*100}%`, background: "var(--accent)" }}/>
          </div>
          <div className="grid grid-cols-6 gap-1 mt-3.5">
            {window.GROUPS.map(g => {
              const ms = window.MATCHES.filter(m => m.group === g.id);
              const f = ms.filter(m => window.isFilled(picks[m.id])).length;
              const pct = f/6;
              return (
                <div key={g.id} className="flex flex-col items-center gap-1">
                  <div className="w-full h-8 bg-zinc-800/80 rounded-sm overflow-hidden relative">
                    <div className="absolute bottom-0 left-0 right-0" style={{ height: `${pct*100}%`, background: f === 6 ? "var(--accent)" : "rgb(82 82 91)" }}/>
                  </div>
                  <div className="text-[9.5px] text-zinc-500 tabular-nums">{g.id}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 mb-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-2">Pendiente</div>
          <ul className="space-y-1.5 text-[12px] text-zinc-300">
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-zinc-600"/>Eliminatorias (bracket)</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-zinc-600"/>Máximo goleador</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-zinc-600"/>Mejor jugador (MVP)</li>
          </ul>
        </div>

        <button className="w-full h-10 rounded-lg text-[13px] font-semibold text-white" style={{ background: "var(--accent)" }}>
          Continuar al bracket →
        </button>
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 text-center">
          Tus pronósticos son <span className="text-zinc-300">anónimos</span> hasta el 11 jun.
        </p>
      </aside>
    </DesktopShell>
  );
};
function DesktopScoreInput({ value, onChange }) {
  return (
    <input type="tel" inputMode="numeric" maxLength={2} value={value ?? ""} placeholder="–"
      onChange={e => onChange(window.clampScore(e.target.value))}
      className="w-[52px] h-[52px] rounded-lg bg-zinc-950 border border-zinc-800 text-center text-[26px] font-bold tabular-nums text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/25"
      style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}/>
  );
}

function DesktopStandingsPreview({ groupId, picks }) {
  const group = window.GROUPS.find(g => g.id === groupId);
  const matches = window.MATCHES.filter(m => m.group === groupId);
  const table = {};
  group.teams.forEach(t => { table[t.code] = { ...t, pts: 0, gf: 0, ga: 0, gd: 0, pj: 0 }; });
  let counted = 0;
  matches.forEach(m => {
    const p = picks[m.id]; if (!window.isFilled(p)) return;
    counted++;
    const h = parseInt(p.h, 10), a = parseInt(p.a, 10);
    table[m.home.code].pj++; table[m.away.code].pj++;
    table[m.home.code].gf += h; table[m.home.code].ga += a;
    table[m.away.code].gf += a; table[m.away.code].ga += h;
    if (h > a) table[m.home.code].pts += 3;
    else if (h < a) table[m.away.code].pts += 3;
    else { table[m.home.code].pts++; table[m.away.code].pts++; }
  });
  const rows = Object.values(table).map(r => ({ ...r, gd: r.gf - r.ga }))
    .sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name));
  const provisional = counted < 6;

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Tu clasificación</div>
          <div className="text-[13px] font-semibold text-zinc-100 leading-tight">Grupo {groupId}</div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] text-zinc-500 tabular-nums">{counted}/6</div>
          {provisional && counted > 0 && <div className="text-[10px] text-amber-400/80">Provisional</div>}
        </div>
      </div>
      {counted === 0 ? (
        <div className="px-4 py-5 text-center">
          <div className="text-[11.5px] text-zinc-500 leading-relaxed">
            Mete un marcador y veré cómo<br/>queda tu Grupo {groupId}.
          </div>
        </div>
      ) : (
        <>
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="text-[9.5px] uppercase tracking-[0.1em] text-zinc-500">
                <th className="text-left font-medium pl-3 py-1.5 w-5">#</th>
                <th className="text-left font-medium py-1.5">Equipo</th>
                <th className="text-right font-medium px-1.5 tabular-nums w-7">PJ</th>
                <th className="text-right font-medium px-1.5 tabular-nums w-9">DG</th>
                <th className="text-right font-medium pr-3 tabular-nums w-9">PTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const passes = i < 2;
                const played = r.pj > 0;
                return (
                  <tr key={r.code} className="border-t border-zinc-800/60">
                    <td className="pl-3 py-1.5">
                      <span className={`inline-block w-1 h-3 rounded-full mr-1 align-middle ${passes ? (provisional ? "opacity-40" : "") : "opacity-0"}`}
                        style={{ background: "var(--accent)" }}/>
                      <span className="text-zinc-500 tabular-nums">{i + 1}</span>
                    </td>
                    <td className="py-1.5 text-zinc-100">
                      <span className="mr-1">{r.flag}</span>
                      <span className={`${played ? "" : "text-zinc-500"} text-[11.5px]`}>{r.name}</span>
                    </td>
                    <td className="text-right text-zinc-400 tabular-nums px-1.5">{r.pj}</td>
                    <td className="text-right text-zinc-400 tabular-nums px-1.5">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                    <td className="text-right text-zinc-50 font-semibold tabular-nums pr-3">{r.pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 flex items-center gap-1.5">
            <span className="inline-block w-1 h-2.5 rounded-full" style={{ background: "var(--accent)" }}/>
            Pasan a octavos
          </div>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// 2. Desktop · Clasificación
// ────────────────────────────────────────────────
window.DesktopClasificacion = function DesktopClasificacion() {
  const all = window.FRIENDS;
  return (
    <DesktopShell activeTab="ranking">
      <main className="flex-1 overflow-y-auto">
        <div className="px-10 py-7 max-w-[1240px]">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Clasificación</div>
              <h1 className="text-[32px] font-bold text-zinc-50 leading-tight">Los Amigos · Mundial 2026</h1>
              <div className="text-[13px] text-zinc-500 mt-1">Jornada 18 de 64 · Actualizado hace 12 s</div>
            </div>
            <div className="flex items-center gap-2">
              {["Total","Hoy","Fase grupos","Eliminatorias"].map((l, i) => (
                <div key={l} className={`px-3 py-1.5 text-[12px] rounded-md ${i===0 ? "bg-zinc-100 text-zinc-950 font-medium" : "bg-zinc-900 border border-zinc-800 text-zinc-400"}`}>{l}</div>
              ))}
            </div>
          </div>

          {/* Top 3 podium cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {all.slice(0,3).map((p, i) => {
              const colors = ["#D4AF37","#C0C0C0","#CD7F32"];
              const labels = ["Líder","2º","3º"];
              const c = colors[i];
              return (
                <div key={p.id} className="rounded-xl border bg-zinc-900/50 p-5 flex items-center gap-4 relative overflow-hidden"
                  style={{ borderColor: i === 0 ? "rgba(212,175,55,0.4)" : "rgb(39 39 42)" }}>
                  {i === 0 && <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 0% 0%, rgba(212,175,55,0.08), transparent 60%)" }}/>}
                  <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 flex items-center justify-center text-[16px] font-semibold text-zinc-50 relative" style={{ borderColor: c }}>
                    {p.avatar}
                    {i === 0 && <window.Icon.Star className="absolute -top-1.5 -right-1.5 w-5 h-5" style={{ color: c }}/>}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] uppercase tracking-[0.12em] font-semibold" style={{ color: c }}>{labels[i]}</div>
                    <div className="text-[17px] font-semibold text-zinc-50">{p.name}</div>
                    <div className="text-[11px] text-zinc-500 tabular-nums">{p.exact} exactos · {p.sign} signos · +{p.delta > 0 ? p.delta : 0} hoy</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[34px] font-bold tabular-nums leading-none" style={{ color: c, fontFamily: "'JetBrains Mono', monospace" }}>{p.pts}</div>
                    <div className="text-[10.5px] text-zinc-500 uppercase tracking-wider mt-1">pts</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
            <div className="grid grid-cols-[60px_44px_minmax(0,1fr)_90px_80px_80px_80px_140px_90px] gap-3 px-5 py-3 text-[10.5px] uppercase tracking-[0.12em] text-zinc-500 font-medium border-b border-zinc-800/80">
              <div>Pos.</div><div>±</div><div>Jugador</div>
              <div className="text-right tabular-nums">Exactos</div>
              <div className="text-right tabular-nums">Signos</div>
              <div className="text-right tabular-nums">Bonus</div>
              <div className="text-right tabular-nums">Hoy</div>
              <div className="text-center">Últimas 5</div>
              <div className="text-right tabular-nums">Total</div>
            </div>
            {all.map((p, i) => {
              const move = p.prevRank - p.rank;
              const Arrow = move > 0 ? window.Icon.ArrowUp : move < 0 ? window.Icon.ArrowDown : window.Icon.Dash;
              const arrowColor = move > 0 ? "text-emerald-400" : move < 0 ? "text-rose-400" : "text-zinc-600";
              const podium = i < 3 ? ["#D4AF37","#C0C0C0","#CD7F32"][i] : null;
              return (
                <div key={p.id} className={`grid grid-cols-[60px_44px_minmax(0,1fr)_90px_80px_80px_80px_140px_90px] gap-3 px-5 py-2.5 border-b border-zinc-800/40 items-center text-[13px] ${p.isMe ? "" : ""}`}
                  style={p.isMe ? { background: "rgba(27,158,91,0.07)", boxShadow: "inset 3px 0 0 var(--accent)" } : {}}>
                  <div className="flex items-center gap-1.5">
                    {podium && <span className="w-1.5 h-5 rounded-full" style={{ background: podium }}/>}
                    <span className="text-zinc-300 tabular-nums font-medium">{p.rank}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${arrowColor}`}>
                    <Arrow className="w-2.5 h-2.5"/>
                    {move !== 0 && <span className="text-[10.5px] tabular-nums">{Math.abs(move)}</span>}
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10.5px] font-semibold text-zinc-300">{p.avatar}</div>
                    <div className="min-w-0">
                      <div className="text-zinc-100 truncate font-medium">{p.name}{p.isMe && <span className="text-[10.5px] text-[var(--accent)] ml-2 font-normal">· tú</span>}</div>
                      <div className="text-[10.5px] text-zinc-500">Campeón: <span className="text-zinc-400">{["🇦🇷","🇪🇸","🇫🇷","🇧🇷","🏴󠁧󠁢󠁥󠁮󠁧󠁿"][p.id % 5]}</span> · MVP: <span className="text-zinc-400">{["Bellingham","Yamal","Mbappé","Vinicius","Messi"][p.id % 5]}</span></div>
                    </div>
                  </div>
                  <div className="text-right tabular-nums text-zinc-200">{p.exact}</div>
                  <div className="text-right tabular-nums text-zinc-400">{p.sign}</div>
                  <div className="text-right tabular-nums text-zinc-400">{Math.max(0, p.exact - 2)}</div>
                  <div className={`text-right tabular-nums font-medium ${p.delta > 0 ? "text-emerald-400" : p.delta < 0 ? "text-rose-400" : "text-zinc-500"}`}>{p.delta > 0 ? `+${p.delta}` : p.delta}</div>
                  <div className="flex justify-center">
                    <FormBarsD dots={p.form}/>
                  </div>
                  <div className="text-right tabular-nums text-zinc-50 font-semibold text-[15px]">{p.pts}</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </DesktopShell>
  );
};
function FormBarsD({ dots }) {
  return (
    <div className="flex gap-0.5 items-end h-4">
      {dots.map((d, i) => (
        <div key={i} className="w-2 rounded-sm"
          style={{ height: d > 0 ? "100%" : d < 0 ? "40%" : "60%", background: d > 0 ? "var(--accent)" : d < 0 ? "rgb(244 63 94)" : "rgb(82 82 91)" }}/>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────
// 3. Desktop · Bracket (full tree)
// ────────────────────────────────────────────────
window.DesktopBracket = function DesktopBracket() {
  const rounds = window.BRACKET.rounds.filter(r => r.id !== "3rd"); // omit 3rd-place for clean tree
  return (
    <DesktopShell activeTab="predictions">
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-10 py-6 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Pronósticos</div>
              <h1 className="text-[28px] font-bold text-zinc-50 leading-tight">Bracket · Eliminatorias</h1>
              <div className="text-[13px] text-zinc-500 mt-1">31 partidos · 32 equipos · Comienza 28 jun</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 flex items-center gap-3">
                <window.Icon.Lock className="w-3.5 h-3.5 text-zinc-400"/>
                <div className="text-[11px] text-zinc-400">Bloqueo: <span className="text-zinc-200 font-medium">11 jun 17:00</span></div>
              </div>
              <div className="rounded-lg border px-4 py-2 flex items-center gap-3" style={{ borderColor: "rgba(212,175,55,0.4)" }}>
                <window.Icon.Star className="w-3.5 h-3.5" style={{ color: "#D4AF37" }}/>
                <div className="text-[11px]">
                  <div className="text-zinc-500">Tu campeón</div>
                  <div className="text-[13px] font-semibold text-zinc-50">{window.BRACKET.rounds.find(r => r.id === "F").matches[0].pickedWinner.flag} {window.BRACKET.rounds.find(r => r.id === "F").matches[0].pickedWinner.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bracket tree */}
        <div className="flex-1 overflow-auto px-10 py-8" style={{ background: "radial-gradient(ellipse at center, rgba(27,158,91,0.04), transparent 70%)" }}>
          <div className="flex items-stretch gap-6 h-full min-w-max">
            {rounds.map((r, ri) => {
              const matches = r.matches;
              return (
                <div key={r.id} className="flex flex-col" style={{ width: 200 }}>
                  <div className="text-center mb-3">
                    <div className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-zinc-500">{r.label}</div>
                    <div className="text-[10.5px] text-zinc-600 tabular-nums">{matches.length} {matches.length === 1 ? "partido" : "partidos"}</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-around gap-2">
                    {matches.map(m => (
                      <BracketCard key={m.id} m={m} compact={ri >= 3}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </DesktopShell>
  );
};
function BracketCard({ m, compact }) {
  const pickedA = m.pickedWinner?.code === m.a.code;
  const pickedB = m.pickedWinner?.code === m.b.code;
  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 overflow-hidden">
      <BracketTeam team={m.a} picked={pickedA} compact={compact}/>
      <div className="h-px bg-zinc-800"/>
      <BracketTeam team={m.b} picked={pickedB} compact={compact}/>
    </div>
  );
}
function BracketTeam({ team, picked, compact }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "px-2.5 py-2" : "px-3 py-2.5"} ${picked ? "" : ""}`}
      style={picked ? { background: "rgba(27,158,91,0.10)", boxShadow: "inset 3px 0 0 var(--accent)" } : {}}>
      <span className={compact ? "text-[16px]" : "text-[18px]"}>{team.flag}</span>
      <div className={`flex-1 ${compact ? "text-[11.5px]" : "text-[12.5px]"} font-medium ${picked ? "text-zinc-50" : "text-zinc-400"} truncate`}>{team.name}</div>
      {picked && <window.Icon.Check className="w-3 h-3" style={{ color: "var(--accent)" }}/>}
    </div>
  );
}
