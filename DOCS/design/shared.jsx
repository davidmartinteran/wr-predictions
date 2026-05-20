// Shared: icons, mock data for ranking + bracket, helpers
// Loaded after data.js so we have window.GROUPS/MATCHES.

window.Icon = {
  Trophy: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9V4h12v5a6 6 0 0 1-12 0Z"/><path d="M6 4H3v2a3 3 0 0 0 3 3"/><path d="M18 4h3v2a3 3 0 0 1-3 3"/><path d="M12 15v3"/><path d="M9 21h6"/><path d="M9 18h6"/></svg>,
  List:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>,
  User:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  Check:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>,
  Chevron:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 6l6 6-6 6"/></svg>,
  Lock:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  Info:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".6" fill="currentColor"/></svg>,
  Bracket:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5h4l4 4M4 13h4l4-4M20 9V5h-4l-4 4M20 9v4l-4 4-4-4M12 9v0M12 13v0"/></svg>,
  Live:   (p) => <svg viewBox="0 0 8 8" fill="currentColor" {...p}><circle cx="4" cy="4" r="3.5"/></svg>,
  ArrowUp:(p) => <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9V3M3 6l3-3 3 3"/></svg>,
  ArrowDown:(p) => <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 3v6M3 6l3 3 3-3"/></svg>,
  Dash:   (p) => <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M3 6h6"/></svg>,
  Star:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9L2 9.2l7.1-.6L12 2Z"/></svg>,
};

// ────────────────── Friends / ranking mock ──────────────────
// 30 amigos, puntos totales, delta jornada, racha últimas 5 jornadas (+/-/0)
window.FRIENDS = (() => {
  const names = ["Álex G.","María P.","Pablo R.","Lucía F.","Javi M.","Carmen S.","Diego B.","Sara V.","Rubén L.","Andrea C.","Iván T.","Laura J.","Marco D.","Elena R.","Pepe H.","Ana M.","Sergi P.","Marta Q.","Jorge A.","Nuria E.","Iñaki Z.","Cris N.","David O.","Bea I.","Luis U.","Paula K.","Adri Y.","Clara X.","Borja W.","Rocío V."];
  // deterministic pseudo-random
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const arr = names.map((n, i) => {
    const pts = Math.round(72 - i * 1.6 - rnd() * 6 + (i < 5 ? 4 : 0));
    return {
      id: i,
      name: n,
      avatar: n.split(" ").map(s => s[0]).join(""),
      pts,
      delta: Math.round(rnd() * 8) - 3, // points gained this matchday
      exact: Math.floor(rnd() * 7),
      sign: Math.floor(8 + rnd() * 14),
      form: Array.from({ length: 5 }, () => rnd() > 0.5 ? 1 : (rnd() > 0.3 ? 0 : -1)),
      isMe: n === "Javi M.",
    };
  }).sort((a,b) => b.pts - a.pts);
  arr.forEach((r, i) => { r.rank = i + 1; r.prevRank = i + 1 + (Math.round(rnd()*4) - 2); });
  return arr;
})();

// ────────────────── Bracket mock ──────────────────
// 2026 has 48 teams → 32 advance (12 winners + 12 runners-up + 8 best 3rds)
// We'll mock a knockout tree: R32 (16) → R16 (8) → QF (4) → SF (2) → Final
window.BRACKET = (() => {
  // pick 32 teams from GROUPS (winner + runner-up for each + 8 best thirds)
  const teams = [];
  window.GROUPS.forEach(g => { teams.push(g.teams[0], g.teams[1]); }); // 24
  // 8 best thirds
  ["A","B","C","D","E","F","G","H"].forEach((gid) => {
    const g = window.GROUPS.find(x => x.id === gid);
    teams.push(g.teams[2]);
  });

  // Deterministic seeding pairs for R32 — just paired in order
  const pairs32 = [];
  for (let i = 0; i < 16; i++) pairs32.push([teams[i*2], teams[i*2+1]]);

  // Pick "user predicted winner" for each match (mostly the first team, some upsets)
  let s = 5;
  const r = () => { s = (s*9301 + 49297) % 233280; return s/233280; };
  const userPick = (a, b) => r() > 0.35 ? a : b;

  const r32 = pairs32.map((p, i) => ({ id: `R32-${i}`, a: p[0], b: p[1], pickedWinner: userPick(p[0], p[1]) }));
  const r16Teams = r32.map(m => m.pickedWinner);
  const r16 = []; for (let i = 0; i < 8; i++) r16.push({ id: `R16-${i}`, a: r16Teams[i*2], b: r16Teams[i*2+1], pickedWinner: userPick(r16Teams[i*2], r16Teams[i*2+1]) });
  const qfTeams = r16.map(m => m.pickedWinner);
  const qf = []; for (let i = 0; i < 4; i++) qf.push({ id: `QF-${i}`, a: qfTeams[i*2], b: qfTeams[i*2+1], pickedWinner: userPick(qfTeams[i*2], qfTeams[i*2+1]) });
  const sfTeams = qf.map(m => m.pickedWinner);
  const sf = []; for (let i = 0; i < 2; i++) sf.push({ id: `SF-${i}`, a: sfTeams[i*2], b: sfTeams[i*2+1], pickedWinner: userPick(sfTeams[i*2], sfTeams[i*2+1]) });
  const final = [{ id: "F-0", a: sf[0].pickedWinner, b: sf[1].pickedWinner, pickedWinner: userPick(sf[0].pickedWinner, sf[1].pickedWinner) }];
  const third = [{ id: "3-0", a: sf[0].a === final[0].a || sf[0].b === final[0].a ? (sf[0].a === final[0].a ? sf[0].b : sf[0].a) : sf[0].b,
                              b: sf[1].a === final[0].b || sf[1].b === final[0].b ? (sf[1].a === final[0].b ? sf[1].b : sf[1].a) : sf[1].b,
                              pickedWinner: null }];

  return { rounds: [
    { id: "R32",   label: "Treintaidoseavos", short: "R32",  matches: r32 },
    { id: "R16",   label: "Octavos",          short: "R16",  matches: r16 },
    { id: "QF",    label: "Cuartos",          short: "QF",   matches: qf },
    { id: "SF",    label: "Semifinales",      short: "SF",   matches: sf },
    { id: "3rd",   label: "Tercer puesto",    short: "3°",   matches: third },
    { id: "F",     label: "Final",            short: "F",    matches: final },
  ]};
})();

// helpers
window.isFilled = (p) => p && p.h !== "" && p.h !== undefined && p.h !== null && p.a !== "" && p.a !== undefined && p.a !== null;
window.clampScore = (v) => { if (v === "") return ""; const n = parseInt(v, 10); if (isNaN(n)) return ""; return Math.max(0, Math.min(20, n)); };
