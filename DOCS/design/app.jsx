const { useState, useEffect, useMemo, useRef } = React;

// ---------- Persistence ----------
const STORAGE_KEY = "porra-wc-2026:v1";
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { picks: {}, activeGroup: "A", tab: "predictions" };
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

// ---------- Tweaks ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfy",
  "groupSelector": "tabs",
  "progressStyle": "bar",
  "accent": "#1B9E5B",
  "showVenue": true
}/*EDITMODE-END*/;

// ---------- Icons (inline SVG, lucide-style) ----------
const Icon = {
  Trophy: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9V4h12v5a6 6 0 0 1-12 0Z"/><path d="M6 4H3v2a3 3 0 0 0 3 3"/><path d="M18 4h3v2a3 3 0 0 1-3 3"/><path d="M12 15v3"/><path d="M9 21h6"/><path d="M9 18h6"/></svg>,
  List:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>,
  User:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  Check:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>,
  Chevron:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 6l6 6-6 6"/></svg>,
  Lock:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  Info:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".6" fill="currentColor"/></svg>,
};

// ---------- Status bar (iOS-ish) ----------
function StatusBar() {
  return (
    <div className="h-[44px] px-6 flex items-center justify-between text-[14px] font-semibold text-zinc-100 shrink-0 select-none">
      <div>9:41</div>
      <div className="flex items-center gap-1.5">
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none"><path d="M1 8.5h2v-1H1v1ZM5 8.5h2V5.5H5v3ZM9 8.5h2V3H9v5.5ZM13 8.5h2V.5h-2v8Z" fill="currentColor"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2.3c1.7 0 3.3.65 4.5 1.8l.8-.8A7.3 7.3 0 0 0 8 1.2 7.3 7.3 0 0 0 2.7 3.3l.8.8A6.4 6.4 0 0 1 8 2.3Zm0 2.5c1 0 2 .4 2.7 1.1l.8-.8A4.8 4.8 0 0 0 8 3.7a4.8 4.8 0 0 0-3.5 1.4l.8.8A3.8 3.8 0 0 1 8 4.8ZM8 7a1.7 1.7 0 1 0 0 3.4A1.7 1.7 0 0 0 8 7Z" fill="currentColor"/></svg>
        <div className="relative w-[24px] h-[11px] rounded-[3px] border border-zinc-300/70 ml-1">
          <div className="absolute inset-[1.5px] bg-zinc-100 rounded-[1.5px]" style={{ width: "75%" }}/>
          <div className="absolute -right-[2.5px] top-1/2 -translate-y-1/2 w-[1.5px] h-[4px] bg-zinc-300/70 rounded-r"/>
        </div>
      </div>
    </div>
  );
}

// ---------- Header ----------
function Header({ filled, total, accent, progressStyle }) {
  const pct = Math.round((filled / total) * 100);
  const isFull = filled === total;
  const goldUntil = isFull;

  return (
    <div className="px-5 pt-2 pb-3 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur sticky top-0 z-20">
      <div className="flex items-baseline justify-between mb-2.5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Pronósticos</div>
          <h1 className="text-[20px] font-semibold text-zinc-50 leading-tight mt-0.5">Fase de grupos</h1>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
          <Icon.Lock className="w-3 h-3"/>
          <span>Hasta 11 jun</span>
        </div>
      </div>

      {progressStyle === "bar" && (
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-[12px] text-zinc-400">
              <span className="text-zinc-100 font-semibold tabular-nums">{filled}</span>
              <span className="text-zinc-500">/{total} partidos completados</span>
            </div>
            <div className="text-[12px] tabular-nums font-medium" style={{ color: goldUntil ? "#D4AF37" : accent }}>{pct}%</div>
          </div>
          <div className="h-[6px] w-full rounded-full bg-zinc-800/80 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: goldUntil ? "#D4AF37" : accent }}/>
          </div>
        </div>
      )}
      {progressStyle === "dots" && (
        <div className="flex items-center justify-between">
          <div className="text-[12px] text-zinc-400">
            <span className="text-zinc-100 font-semibold tabular-nums">{filled}</span>
            <span className="text-zinc-500">/{total} partidos</span>
          </div>
          <div className="flex gap-[3px]">
            {Array.from({ length: 24 }).map((_, i) => {
              const on = i < Math.round((filled / total) * 24);
              return <div key={i} className="w-[5px] h-[10px] rounded-[1.5px]"
                style={{ background: on ? (isFull ? "#D4AF37" : accent) : "rgb(39 39 42)" }}/>;
            })}
          </div>
        </div>
      )}
      {progressStyle === "ring" && (
        <div className="flex items-center gap-3">
          <ProgressRing pct={pct} color={isFull ? "#D4AF37" : accent}/>
          <div>
            <div className="text-[15px] text-zinc-100 font-semibold tabular-nums leading-none">{filled}<span className="text-zinc-500 font-normal">/{total}</span></div>
            <div className="text-[11px] text-zinc-500 mt-1">partidos completados</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ pct, color }) {
  const r = 18, c = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} stroke="rgb(39 39 42)" strokeWidth="4" fill="none"/>
      <circle cx="22" cy="22" r={r} stroke={color} strokeWidth="4" fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct/100)}
        strokeLinecap="round" transform="rotate(-90 22 22)"
        style={{ transition: "stroke-dashoffset 400ms ease" }}/>
      <text x="22" y="25" textAnchor="middle" fill="#fafafa" fontSize="11" fontWeight="600">{pct}%</text>
    </svg>
  );
}

// ---------- Group selector ----------
function GroupSelector({ active, onChange, style, picks }) {
  const scrollerRef = useRef(null);
  // auto-center active
  useEffect(() => {
    const el = scrollerRef.current?.querySelector(`[data-group="${active}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  if (style === "grid") {
    return (
      <div className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-950">
        <div className="grid grid-cols-6 gap-1.5">
          {window.GROUPS.map(g => {
            const grpMatches = window.MATCHES.filter(m => m.group === g.id);
            const filled = grpMatches.filter(m => isFilled(picks[m.id])).length;
            const done = filled === grpMatches.length;
            const isActive = g.id === active;
            return (
              <button key={g.id} onClick={() => onChange(g.id)}
                className={`relative h-10 rounded-md text-[13px] font-semibold tabular-nums transition-colors
                  ${isActive ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800"}`}>
                {g.id}
                {done && !isActive && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)]"/>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // tabs (horizontal scroll)
  return (
    <div className="border-b border-zinc-800/80 bg-zinc-950 sticky top-[88px] z-10">
      <div ref={scrollerRef} className="flex overflow-x-auto no-scrollbar px-3 gap-1">
        {window.GROUPS.map(g => {
          const grpMatches = window.MATCHES.filter(m => m.group === g.id);
          const filled = grpMatches.filter(m => isFilled(picks[m.id])).length;
          const done = filled === grpMatches.length;
          const isActive = g.id === active;
          return (
            <button key={g.id} data-group={g.id} onClick={() => onChange(g.id)}
              className={`relative shrink-0 px-3.5 py-3 text-[13px] font-medium tracking-wide transition-colors
                ${isActive ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-300"}`}>
              <span className="tabular-nums">Grupo {g.id}</span>
              {done && (
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ml-1.5 align-middle"
                  style={{ background: "var(--accent)" }}>
                  <Icon.Check className="w-2.5 h-2.5 text-zinc-950"/>
                </span>
              )}
              {isActive && <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-zinc-50"/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Match Card ----------
function isFilled(pick) {
  return pick && pick.h !== "" && pick.h !== undefined && pick.h !== null
              && pick.a !== "" && pick.a !== undefined && pick.a !== null;
}
function clampScore(v) {
  if (v === "") return "";
  const n = parseInt(v, 10);
  if (isNaN(n)) return "";
  return Math.max(0, Math.min(20, n));
}

function ScoreInput({ value, onChange, side, accent }) {
  return (
    <input
      type="tel"
      inputMode="numeric"
      maxLength={2}
      value={value ?? ""}
      placeholder="–"
      onChange={(e) => onChange(clampScore(e.target.value))}
      aria-label={`Goles ${side}`}
      className="w-[44px] h-[44px] rounded-lg bg-zinc-950 border border-zinc-800
        text-center text-[22px] font-bold tabular-nums text-zinc-50
        placeholder:text-zinc-700 focus:outline-none focus:border-[var(--accent)]
        focus:ring-2 focus:ring-[color:var(--accent)]/25 transition-all"
      style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
    />
  );
}

function MatchCard({ match, pick, onChange, density, showVenue, accent }) {
  const filled = isFilled(pick);
  const compact = density === "compact";

  return (
    <div className={`rounded-xl border bg-zinc-900/60 transition-colors
      ${filled ? "border-zinc-700/80" : "border-zinc-800/80"}
      ${compact ? "p-3" : "p-3.5"}`}>
      {/* meta row */}
      <div className="flex items-center justify-between mb-2.5 text-[10.5px] uppercase tracking-[0.12em] text-zinc-500">
        <div className="flex items-center gap-2">
          <span>J{match.matchday}</span>
          <span className="text-zinc-700">·</span>
          <span>{match.date}</span>
          <span className="text-zinc-700">·</span>
          <span>{match.time}</span>
        </div>
        {showVenue && <span className="text-zinc-600 normal-case tracking-normal text-[11px]">{match.venue}</span>}
      </div>

      {/* match row */}
      <div className="flex items-center gap-2.5">
        {/* home */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[22px] leading-none shrink-0">{match.home.flag}</span>
          <div className="min-w-0">
            <div className="text-[14px] text-zinc-100 font-medium truncate leading-tight">{match.home.name}</div>
            <div className="text-[10px] text-zinc-500 tracking-wider uppercase">Local</div>
          </div>
        </div>

        {/* scores */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ScoreInput value={pick?.h} side="local" accent={accent}
            onChange={(v) => onChange({ ...(pick || {}), h: v })}/>
          <span className="text-zinc-700 text-[14px] font-medium">:</span>
          <ScoreInput value={pick?.a} side="visitante" accent={accent}
            onChange={(v) => onChange({ ...(pick || {}), a: v })}/>
        </div>

        {/* away */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <div className="text-[14px] text-zinc-100 font-medium truncate leading-tight">{match.away.name}</div>
            <div className="text-[10px] text-zinc-500 tracking-wider uppercase">Visitante</div>
          </div>
          <span className="text-[22px] leading-none shrink-0">{match.away.flag}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Group standings preview (predicted, live as you type) ----------
function computeStandings(groupId, picks) {
  const group = window.GROUPS.find(g => g.id === groupId);
  const matches = window.MATCHES.filter(m => m.group === groupId);
  const table = {};
  group.teams.forEach(t => { table[t.code] = { ...t, pts: 0, gf: 0, ga: 0, gd: 0, pj: 0 }; });
  let countedMatches = 0;
  matches.forEach(m => {
    const p = picks[m.id];
    if (!isFilled(p)) return;
    countedMatches++;
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
  return { rows, countedMatches, total: matches.length };
}

function GroupStandingsPreview({ groupId, picks }) {
  const { rows, countedMatches, total } = computeStandings(groupId, picks);
  if (countedMatches === 0) return null;
  const provisional = countedMatches < total;

  return (
    <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Icon.Info className="w-3.5 h-3.5 text-zinc-500"/>
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-400 font-medium">Tu clasificación Grupo {groupId}</div>
        </div>
        <div className="text-[10.5px] text-zinc-500 tabular-nums">
          {provisional && <span className="text-amber-400/80 mr-1.5">·</span>}
          {countedMatches}/{total} partidos
        </div>
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">
            <th className="text-left font-medium pl-3.5 py-1.5 w-6">#</th>
            <th className="text-left font-medium py-1.5">Equipo</th>
            <th className="text-right font-medium px-1.5 tabular-nums">PJ</th>
            <th className="text-right font-medium px-1.5 tabular-nums">DG</th>
            <th className="text-right font-medium pr-3.5 tabular-nums">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const passes = i < 2;
            const played = r.pj > 0;
            return (
              <tr key={r.code} className="border-t border-zinc-800/60">
                <td className="pl-3.5 py-2">
                  <span className={`inline-block w-1 h-3 rounded-full mr-1.5 align-middle ${passes && !provisional ? "" : passes && provisional ? "opacity-40" : "opacity-0"}`}
                    style={{ background: "var(--accent)" }}/>
                  <span className="text-zinc-500 tabular-nums">{i + 1}</span>
                </td>
                <td className="py-2 text-zinc-100">
                  <span className="mr-1.5">{r.flag}</span>
                  <span className={played ? "" : "text-zinc-500"}>{r.name}</span>
                </td>
                <td className="text-right text-zinc-400 tabular-nums px-1.5">{r.pj}</td>
                <td className="text-right text-zinc-400 tabular-nums px-1.5">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                <td className="text-right text-zinc-50 font-semibold tabular-nums pr-3.5">{r.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {provisional && (
        <div className="px-3.5 py-2 border-t border-zinc-800/60 bg-zinc-900/40 text-[10.5px] text-zinc-500">
          Provisional — actualiza con cada marcador
        </div>
      )}
    </div>
  );
}

// ---------- Sticky standings strip (positions 1-4 of selected group) ----------
function StandingsDock({ groupId, picks }) {
  const { rows, countedMatches, total } = computeStandings(groupId, picks);
  const provisional = countedMatches < total;

  return (
    <div className="shrink-0 border-t border-zinc-800/80 bg-zinc-900/70 backdrop-blur px-4 py-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[9.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
          Grupo {groupId} <span className="text-zinc-600 normal-case tracking-normal ml-1">· quién pasa</span>
        </div>
        <div className="text-[9.5px] tabular-nums" style={{ color: provisional ? "rgba(251,191,36,0.85)" : "var(--accent)" }}>
          {provisional ? `Provisional · ${countedMatches}/${total}` : "Definitivo"}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {rows.map((r, i) => {
          const pass = i < 2;
          return (
            <div key={r.code}
              className="flex items-center gap-1.5 px-1.5 py-1 rounded-md"
              style={pass ? { background: "rgba(27,158,91,0.10)", borderBottom: "2px solid var(--accent)" } : { borderBottom: "2px solid rgb(39 39 42)" }}>
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

// ---------- Bottom nav ----------
function BottomNav({ tab, onChange }) {
  const items = [
    { id: "predictions", label: "Pronósticos", icon: Icon.List },
    { id: "ranking",     label: "Clasificación", icon: Icon.Trophy },
    { id: "mine",        label: "Mi Porra",   icon: Icon.User },
  ];
  return (
    <div className="border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur shrink-0">
      <div className="flex">
        {items.map(it => {
          const active = tab === it.id;
          const I = it.icon;
          return (
            <button key={it.id} onClick={() => onChange(it.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 pb-3 transition-colors">
              <I className="w-[22px] h-[22px]" style={{ color: active ? "var(--accent)" : "rgb(113 113 122)" }}/>
              <span className="text-[10.5px] font-medium" style={{ color: active ? "rgb(244 244 245)" : "rgb(113 113 122)" }}>{it.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-[18px]"/>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[134px] h-[4px] rounded-full bg-zinc-100/90"/>
    </div>
  );
}

// ---------- App ----------
function App() {
  const [state, setState] = useState(() => loadState());
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  useEffect(() => { saveState(state); }, [state]);

  const setPick = (matchId, pick) => {
    setState(s => ({ ...s, picks: { ...s.picks, [matchId]: pick } }));
  };
  const setActiveGroup = (g) => setState(s => ({ ...s, activeGroup: g }));
  const setTab = (t) => setState(s => ({ ...s, tab: t }));

  const filled = useMemo(() =>
    window.MATCHES.filter(m => isFilled(state.picks[m.id])).length,
    [state.picks]
  );
  const groupMatches = useMemo(() =>
    window.MATCHES.filter(m => m.group === state.activeGroup),
    [state.activeGroup]
  );

  // demo seed: prefill some matches so the screen looks alive on first load
  useEffect(() => {
    if (Object.keys(state.picks).length === 0) {
      const demo = {};
      const sample = [
        ["A-1",1,0],["A-2",2,2],["A-3",1,1],["A-4",3,1],
        ["B-1",0,1],["B-2",1,2],
        ["C-1",1,2],["C-2",2,0],["C-3",1,1],["C-4",0,0],["C-5",2,1],["C-6",1,1],
        ["D-1",2,1],["D-2",1,0],["D-3",0,2],
        ["E-1",2,0],["E-2",1,1],
        ["F-1",2,1],["F-2",1,2],["F-3",0,1],
        ["G-1",1,1],["G-2",2,1],
      ];
      sample.forEach(([id, h, a]) => { demo[id] = { h, a }; });
      setState(s => ({ ...s, picks: demo }));
    }
  }, []);

  return (
    <div style={{ "--accent": tweaks.accent }} className="flex flex-col h-full bg-zinc-950 text-zinc-100 relative overflow-hidden">
      <StatusBar/>
      <Header filled={filled} total={72} accent={tweaks.accent} progressStyle={tweaks.progressStyle}/>
      <GroupSelector active={state.activeGroup} onChange={setActiveGroup}
        style={tweaks.groupSelector} picks={state.picks}/>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-3 min-h-0">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
            6 partidos · Grupo {state.activeGroup}
          </div>
          <div className="text-[11px] text-zinc-500 tabular-nums">
            {groupMatches.filter(m => isFilled(state.picks[m.id])).length}/6
          </div>
        </div>
        <div className={`space-y-${tweaks.density === "compact" ? "2" : "2.5"}`}>
          {groupMatches.map(m => (
            <MatchCard key={m.id} match={m} pick={state.picks[m.id]}
              onChange={(p) => setPick(m.id, p)}
              density={tweaks.density} showVenue={tweaks.showVenue} accent={tweaks.accent}/>
          ))}
        </div>

        <button className="mt-5 w-full h-11 rounded-lg text-[14px] font-semibold text-white transition-opacity active:opacity-80"
          style={{ background: "var(--accent)" }}>
          Siguiente grupo
          <Icon.Chevron className="w-4 h-4 inline ml-1 -mt-0.5"/>
        </button>

        <p className="mt-4 text-[11px] leading-relaxed text-zinc-500 text-center px-6">
          Tus pronósticos son <span className="text-zinc-300">anónimos</span> hasta el 11 de junio.
          Puedes editar hasta el primer pitido.
        </p>
      </div>

      <StandingsDock groupId={state.activeGroup} picks={state.picks}/>

      <BottomNav tab={state.tab} onChange={setTab}/>

      {/* Tweaks */}
      <window.TweaksPanel>
        <window.TweakSection label="Layout">
          <window.TweakRadio label="Densidad de cards" value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[{ value: "comfy", label: "Cómoda" }, { value: "compact", label: "Compacta" }]}/>
          <window.TweakRadio label="Selector de grupo" value={tweaks.groupSelector}
            onChange={(v) => setTweak("groupSelector", v)}
            options={[{ value: "tabs", label: "Tabs" }, { value: "grid", label: "Grid 12" }]}/>
          <window.TweakSelect label="Indicador de progreso" value={tweaks.progressStyle}
            onChange={(v) => setTweak("progressStyle", v)}
            options={[{ value: "bar", label: "Barra" }, { value: "dots", label: "Puntos" }, { value: "ring", label: "Anillo" }]}/>
          <window.TweakToggle label="Mostrar sede del partido" value={tweaks.showVenue}
            onChange={(v) => setTweak("showVenue", v)}/>
        </window.TweakSection>
        <window.TweakSection label="Color">
          <window.TweakColor label="Acento" value={tweaks.accent}
            onChange={(v) => setTweak("accent", v)}
            options={["#1B9E5B", "#22C55E", "#06B6D4", "#F97316"]}/>
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
