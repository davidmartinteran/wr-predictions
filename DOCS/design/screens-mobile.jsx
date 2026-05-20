// Mobile screens (390 x 844). No phone bezel — designed to live inside
// a design canvas artboard.

const { useState, useMemo, useRef, useEffect } = React;

// ────────────────────────────────────────────────
// Shared mobile chrome
// ────────────────────────────────────────────────
function MobileShell({ children, activeTab }) {
  return (
    <div className="w-[390px] h-[844px] bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden relative" style={{ "--accent": "#1B9E5B" }}>
      <MobileStatusBar/>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      <MobileBottomNav active={activeTab}/>
    </div>
  );
}
function MobileStatusBar() {
  return (
    <div className="h-[44px] px-6 flex items-center justify-between text-[14px] font-semibold text-zinc-100 shrink-0 select-none">
      <div className="tabular-nums">9:41</div>
      <div className="flex items-center gap-1.5">
        <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor"><path d="M1 8.5h2v-1H1v1ZM5 8.5h2V5.5H5v3ZM9 8.5h2V3H9v5.5ZM13 8.5h2V.5h-2v8Z"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2.3c1.7 0 3.3.65 4.5 1.8l.8-.8A7.3 7.3 0 0 0 8 1.2 7.3 7.3 0 0 0 2.7 3.3l.8.8A6.4 6.4 0 0 1 8 2.3Zm0 2.5c1 0 2 .4 2.7 1.1l.8-.8A4.8 4.8 0 0 0 8 3.7a4.8 4.8 0 0 0-3.5 1.4l.8.8A3.8 3.8 0 0 1 8 4.8ZM8 7a1.7 1.7 0 1 0 0 3.4A1.7 1.7 0 0 0 8 7Z"/></svg>
        <div className="relative w-[24px] h-[11px] rounded-[3px] border border-zinc-300/70 ml-1">
          <div className="absolute inset-[1.5px] bg-zinc-100 rounded-[1.5px]" style={{ width: "75%" }}/>
        </div>
      </div>
    </div>
  );
}
function MobileBottomNav({ active }) {
  const items = [
    { id: "predictions", label: "Pronósticos", icon: window.Icon.List },
    { id: "ranking",     label: "Clasificación", icon: window.Icon.Trophy },
    { id: "mine",        label: "Mi Porra",   icon: window.Icon.User },
  ];
  return (
    <div className="border-t border-zinc-800/80 bg-zinc-950 shrink-0 relative">
      <div className="flex">
        {items.map(it => {
          const a = active === it.id;
          const I = it.icon;
          return (
            <div key={it.id} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 pb-3">
              <I className="w-[22px] h-[22px]" style={{ color: a ? "var(--accent)" : "rgb(113 113 122)" }}/>
              <span className="text-[10.5px] font-medium" style={{ color: a ? "rgb(244 244 245)" : "rgb(113 113 122)" }}>{it.label}</span>
            </div>
          );
        })}
      </div>
      <div className="h-[18px]"/>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[134px] h-[4px] rounded-full bg-zinc-100/90"/>
    </div>
  );
}

// ────────────────────────────────────────────────
// 1. Pronósticos · Fase de grupos
// ────────────────────────────────────────────────
window.MobilePronosticos = function MobilePronosticos() {
  const [picks, setPicks] = useState(() => {
    const seed = {};
    [["A-1",1,0],["A-2",2,2],["A-3",1,1],["A-4",3,1],["B-1",0,1],["B-2",1,2],
     ["C-1",1,2],["C-2",2,0],["C-3",1,1],["C-4",0,0],["C-5",2,1],["C-6",1,1],
     ["D-1",2,1],["D-2",1,0],["D-3",0,2],["E-1",2,0],["E-2",1,1],
     ["F-1",2,1],["F-2",1,2],["F-3",0,1],["G-1",1,1],["G-2",2,1]]
      .forEach(([id, h, a]) => { seed[id] = { h, a }; });
    return seed;
  });
  const [active, setActive] = useState("A");
  const filled = Object.values(picks).filter(window.isFilled).length;
  const groupMatches = window.MATCHES.filter(m => m.group === active);
  const groupFilled = groupMatches.filter(m => window.isFilled(picks[m.id])).length;

  return (
    <MobileShell activeTab="predictions">
      {/* header */}
      <div className="px-5 pt-2 pb-3 border-b border-zinc-800/80 shrink-0">
        <div className="flex items-baseline justify-between mb-2.5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Pronósticos</div>
            <h1 className="text-[20px] font-semibold text-zinc-50 leading-tight mt-0.5">Fase de grupos</h1>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
            <window.Icon.Lock className="w-3 h-3"/><span>Hasta 11 jun</span>
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-[12px] text-zinc-400">
              <span className="text-zinc-100 font-semibold tabular-nums">{filled}</span>
              <span className="text-zinc-500">/72 partidos completados</span>
            </div>
            <div className="text-[12px] tabular-nums font-medium" style={{ color: "var(--accent)" }}>{Math.round(filled/72*100)}%</div>
          </div>
          <div className="h-[6px] w-full rounded-full bg-zinc-800/80 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${filled/72*100}%`, background: "var(--accent)" }}/>
          </div>
        </div>
      </div>
      {/* group tabs */}
      <div className="border-b border-zinc-800/80 shrink-0">
        <div className="flex overflow-x-auto no-scrollbar px-3 gap-1">
          {window.GROUPS.map(g => {
            const ms = window.MATCHES.filter(m => m.group === g.id);
            const done = ms.every(m => window.isFilled(picks[m.id]));
            const a = g.id === active;
            return (
              <button key={g.id} onClick={() => setActive(g.id)}
                className={`relative shrink-0 px-3.5 py-3 text-[13px] font-medium transition-colors ${a ? "text-zinc-50" : "text-zinc-500"}`}>
                Grupo {g.id}
                {done && <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ml-1.5 align-middle" style={{ background: "var(--accent)" }}><window.Icon.Check className="w-2.5 h-2.5 text-zinc-950"/></span>}
                {a && <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-zinc-50"/>}
              </button>
            );
          })}
        </div>
      </div>
      {/* matches */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-3 min-h-0">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">6 partidos · Grupo {active}</div>
          <div className="text-[11px] text-zinc-500 tabular-nums">{groupFilled}/6</div>
        </div>
        <div className="space-y-2.5">
          {groupMatches.map(m => {
            const p = picks[m.id];
            const f = window.isFilled(p);
            return (
              <div key={m.id} className={`rounded-xl border p-3.5 ${f ? "border-zinc-700/80 bg-zinc-900/60" : "border-zinc-800/80 bg-zinc-900/40"}`}>
                <div className="flex items-center justify-between mb-2.5 text-[10.5px] uppercase tracking-[0.12em] text-zinc-500">
                  <div className="flex items-center gap-2"><span>J{m.matchday}</span><span className="text-zinc-700">·</span><span>{m.date}</span><span className="text-zinc-700">·</span><span>{m.time}</span></div>
                  <span className="text-zinc-600 normal-case tracking-normal text-[11px]">{m.venue}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[22px] leading-none shrink-0">{m.home.flag}</span>
                    <div className="min-w-0"><div className="text-[14px] text-zinc-100 font-medium truncate">{m.home.name}</div><div className="text-[10px] text-zinc-500 tracking-wider uppercase">Local</div></div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <MobileScoreInput value={p?.h} onChange={(v) => setPicks(x => ({ ...x, [m.id]: { ...(x[m.id]||{}), h: v } }))}/>
                    <span className="text-zinc-700 text-[14px]">:</span>
                    <MobileScoreInput value={p?.a} onChange={(v) => setPicks(x => ({ ...x, [m.id]: { ...(x[m.id]||{}), a: v } }))}/>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                    <div className="min-w-0"><div className="text-[14px] text-zinc-100 font-medium truncate">{m.away.name}</div><div className="text-[10px] text-zinc-500 tracking-wider uppercase">Visitante</div></div>
                    <span className="text-[22px] leading-none shrink-0">{m.away.flag}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button className="mt-4 w-full h-11 rounded-lg text-[14px] font-semibold text-white" style={{ background: "var(--accent)" }}>
          Siguiente grupo
        </button>
      </div>

      <MobileStandingsDock groupId={active} picks={picks}/>
    </MobileShell>
  );
};

function computeStandingsM(groupId, picks) {
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
  return { rows, counted, total: matches.length };
}

function MobileStandingsDock({ groupId, picks }) {
  const { rows, counted, total } = computeStandingsM(groupId, picks);
  const provisional = counted < total;

  return (
    <div className="shrink-0 border-t border-zinc-800/80 bg-zinc-900/70 backdrop-blur px-4 py-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[9.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
          Grupo {groupId} <span className="text-zinc-600 normal-case tracking-normal ml-1">· quién pasa</span>
        </div>
        <div className="text-[9.5px] tabular-nums" style={{ color: provisional ? "rgba(251,191,36,0.85)" : "var(--accent)" }}>
          {provisional ? `Provisional · ${counted}/${total}` : "Definitivo"}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {rows.map((r, i) => {
          const pass = i < 2;
          return (
            <div key={r.code}
              className="flex items-center gap-1.5 px-1.5 py-1 rounded-md"
              style={pass
                ? { background: "rgba(27,158,91,0.10)", borderBottom: "2px solid var(--accent)" }
                : { borderBottom: "2px solid rgb(39 39 42)" }}>
              <span className="text-[10px] font-semibold tabular-nums shrink-0"
                style={{ color: pass ? "var(--accent)" : "rgb(82 82 91)" }}>{i + 1}</span>
              <span className="text-[15px] leading-none shrink-0">{r.flag}</span>
              <span className={`text-[11px] font-semibold tracking-wide ${pass ? "text-zinc-50" : "text-zinc-400"}`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.code}</span>
              <span className="text-[10px] tabular-nums text-zinc-500 ml-auto">{r.pts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function MobileScoreInput({ value, onChange }) {
  return (
    <input type="tel" inputMode="numeric" maxLength={2} value={value ?? ""} placeholder="–"
      onChange={(e) => onChange(window.clampScore(e.target.value))}
      className="w-[44px] h-[44px] rounded-lg bg-zinc-950 border border-zinc-800 text-center text-[22px] font-bold tabular-nums text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/25"
      style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}/>
  );
}

// ────────────────────────────────────────────────
// 2. Clasificación (live ranking — durante el torneo)
// ────────────────────────────────────────────────
window.MobileClasificacion = function MobileClasificacion() {
  const top3 = window.FRIENDS.slice(0, 3);
  const rest = window.FRIENDS.slice(3);
  return (
    <MobileShell activeTab="ranking">
      {/* header */}
      <div className="px-5 pt-2 pb-3 border-b border-zinc-800/80 shrink-0">
        <div className="flex items-baseline justify-between mb-2.5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Clasificación</div>
            <h1 className="text-[20px] font-semibold text-zinc-50 leading-tight mt-0.5">30 jugadores</h1>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
            <span className="inline-flex items-center"><window.Icon.Live className="w-1.5 h-1.5 mr-1 text-rose-400 animate-pulse"/>En directo</span>
          </div>
        </div>
        {/* filter pills */}
        <div className="flex gap-1.5">
          {["Total","Hoy","Fase grupos","Eliminatorias"].map((l, i) => (
            <div key={l} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${i===0 ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 border border-zinc-800 text-zinc-400"}`}>{l}</div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {/* Podium */}
        <div className="px-5 pt-4 pb-5">
          <div className="grid grid-cols-3 gap-2 items-end">
            {/* 2 */}
            <PodiumStep place={2} player={top3[1]} h={90}/>
            {/* 1 */}
            <PodiumStep place={1} player={top3[0]} h={118}/>
            {/* 3 */}
            <PodiumStep place={3} player={top3[2]} h={72}/>
          </div>
        </div>

        {/* List */}
        <div className="px-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-2 px-1">Posiciones 4–30</div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
            {rest.map((r, i) => {
              const move = r.prevRank - r.rank;
              const Arrow = move > 0 ? window.Icon.ArrowUp : move < 0 ? window.Icon.ArrowDown : window.Icon.Dash;
              const arrowColor = move > 0 ? "text-emerald-400" : move < 0 ? "text-rose-400" : "text-zinc-600";
              return (
                <div key={r.id} className={`flex items-center gap-3 px-3 py-2.5 ${i ? "border-t border-zinc-800/60" : ""} ${r.isMe ? "bg-[color:var(--accent)]/8" : ""}`}
                  style={r.isMe ? { background: "rgba(27,158,91,0.08)", boxShadow: "inset 2px 0 0 var(--accent)" } : {}}>
                  <div className="w-6 text-right text-[12px] text-zinc-500 tabular-nums">{r.rank}</div>
                  <div className={`flex items-center gap-1 w-5 ${arrowColor}`}>
                    <Arrow className="w-2.5 h-2.5"/>
                    {move !== 0 && <span className="text-[10px] tabular-nums">{Math.abs(move)}</span>}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-semibold text-zinc-300">{r.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] text-zinc-100 truncate font-medium">{r.name}{r.isMe && <span className="text-[10px] text-[var(--accent)] ml-1.5 font-normal">· tú</span>}</div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                      <span className="tabular-nums">{r.exact} exactos</span>
                      <span className="text-zinc-700">·</span>
                      <span className="tabular-nums">{r.sign} signos</span>
                    </div>
                  </div>
                  <FormDots dots={r.form}/>
                  <div className="text-right shrink-0">
                    <div className="text-[15px] font-semibold tabular-nums text-zinc-50">{r.pts}</div>
                    <div className={`text-[10.5px] tabular-nums ${r.delta > 0 ? "text-emerald-400" : r.delta < 0 ? "text-rose-400" : "text-zinc-600"}`}>{r.delta > 0 ? `+${r.delta}` : r.delta} hoy</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MobileShell>
  );
};

function PodiumStep({ place, player, h }) {
  const isFirst = place === 1;
  const gold = "#D4AF37";
  const silver = "#C0C0C0";
  const bronze = "#CD7F32";
  const color = place === 1 ? gold : place === 2 ? silver : bronze;
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-2">
        <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 flex items-center justify-center text-[14px] font-semibold text-zinc-50"
          style={{ borderColor: color, boxShadow: isFirst ? `0 0 0 4px rgba(212,175,55,0.15)` : "none" }}>{player.avatar}</div>
        {isFirst && <window.Icon.Star className="absolute -top-1.5 -right-1.5 w-5 h-5" style={{ color: gold }}/>}
      </div>
      <div className="text-[12px] text-zinc-200 font-medium truncate w-full text-center">{player.name}</div>
      <div className="text-[10.5px] text-zinc-500 mb-1.5 tabular-nums">{player.pts} pts</div>
      <div className="w-full rounded-t-md flex items-center justify-center font-bold tabular-nums" style={{ height: h, background: "rgba(255,255,255,0.04)", borderTop: `3px solid ${color}` }}>
        <span className="text-[22px]" style={{ color }}>{place}</span>
      </div>
    </div>
  );
}

function FormDots({ dots }) {
  return (
    <div className="flex gap-0.5">
      {dots.map((d, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full"
          style={{ background: d > 0 ? "var(--accent)" : d < 0 ? "rgb(244 63 94)" : "rgb(82 82 91)" }}/>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────
// 3. Bracket · Eliminatorias
// ────────────────────────────────────────────────
window.MobileBracket = function MobileBracket() {
  const [round, setRound] = useState("R16");
  const rd = window.BRACKET.rounds.find(r => r.id === round);
  return (
    <MobileShell activeTab="predictions">
      <div className="px-5 pt-2 pb-3 border-b border-zinc-800/80 shrink-0">
        <div className="flex items-baseline justify-between mb-2.5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Pronósticos</div>
            <h1 className="text-[20px] font-semibold text-zinc-50 leading-tight mt-0.5">Eliminatorias</h1>
          </div>
          <div className="text-[11px] text-zinc-500"><span className="text-zinc-200 font-semibold tabular-nums">31</span>/31 partidos</div>
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          {window.BRACKET.rounds.map(r => (
            <button key={r.id} onClick={() => setRound(r.id)}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors ${round === r.id ? "bg-zinc-100 text-zinc-950" : "text-zinc-400"}`}>
              {r.short}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-[12px] text-zinc-300 font-semibold">{rd.label}</div>
          <div className="text-[11px] text-zinc-500 tabular-nums">{rd.matches.length} partidos</div>
        </div>
        <div className="space-y-2">
          {rd.matches.map(m => (
            <KOMatchCard key={m.id} m={m}/>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 mb-1.5">Tu campeón</div>
          <div className="flex items-center gap-3">
            <span className="text-[36px] leading-none">{window.BRACKET.rounds.find(r=>r.id==="F").matches[0].pickedWinner.flag}</span>
            <div>
              <div className="text-[18px] font-semibold text-zinc-50">{window.BRACKET.rounds.find(r=>r.id==="F").matches[0].pickedWinner.name}</div>
              <div className="text-[11px]" style={{ color: "#D4AF37" }}>★ Campeón Mundial 2026</div>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
};

function KOMatchCard({ m }) {
  const pickedA = m.pickedWinner?.code === m.a.code;
  const pickedB = m.pickedWinner?.code === m.b.code;
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden">
      <TeamRow team={m.a} picked={pickedA}/>
      <div className="h-px bg-zinc-800/80 mx-3"/>
      <TeamRow team={m.b} picked={pickedB}/>
    </div>
  );
}
function TeamRow({ team, picked }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors ${picked ? "bg-[color:var(--accent)]/8" : ""}`}
      style={picked ? { background: "rgba(27,158,91,0.10)" } : {}}>
      <span className="text-[22px] leading-none">{team.flag}</span>
      <div className={`flex-1 text-[14px] font-medium ${picked ? "text-zinc-50" : "text-zinc-300"}`}>{team.name}</div>
      {picked && (
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] font-semibold" style={{ color: "var(--accent)" }}>
          <window.Icon.Check className="w-3 h-3"/>Pasa
        </div>
      )}
    </button>
  );
}
