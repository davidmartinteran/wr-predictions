// Mock data for Mundial 2026 — 48 teams, 12 groups, 72 group-stage matches.
// All groups invented for the mock; user can edit later.
window.GROUPS = [
  { id: "A", teams: [
    { code: "MEX", name: "México",   flag: "🇲🇽" },
    { code: "BEL", name: "Bélgica",  flag: "🇧🇪" },
    { code: "ECU", name: "Ecuador",  flag: "🇪🇨" },
    { code: "IRN", name: "Irán",     flag: "🇮🇷" },
  ]},
  { id: "B", teams: [
    { code: "CAN", name: "Canadá",       flag: "🇨🇦" },
    { code: "SVK", name: "Eslovaquia",   flag: "🇸🇰" },
    { code: "CIV", name: "C. Marfil",    flag: "🇨🇮" },
    { code: "QAT", name: "Catar",        flag: "🇶🇦" },
  ]},
  { id: "C", teams: [
    { code: "USA", name: "EE.UU.",          flag: "🇺🇸" },
    { code: "ESP", name: "España",          flag: "🇪🇸" },
    { code: "SWE", name: "Suecia",          flag: "🇸🇪" },
    { code: "NZL", name: "Nueva Zelanda",   flag: "🇳🇿" },
  ]},
  { id: "D", teams: [
    { code: "ARG", name: "Argentina",  flag: "🇦🇷" },
    { code: "SUI", name: "Suiza",      flag: "🇨🇭" },
    { code: "RSA", name: "Sudáfrica",  flag: "🇿🇦" },
    { code: "JAM", name: "Jamaica",    flag: "🇯🇲" },
  ]},
  { id: "E", teams: [
    { code: "FRA", name: "Francia",     flag: "🇫🇷" },
    { code: "DEN", name: "Dinamarca",   flag: "🇩🇰" },
    { code: "SEN", name: "Senegal",     flag: "🇸🇳" },
    { code: "AUS", name: "Australia",   flag: "🇦🇺" },
  ]},
  { id: "F", teams: [
    { code: "BRA", name: "Brasil",      flag: "🇧🇷" },
    { code: "CRO", name: "Croacia",     flag: "🇭🇷" },
    { code: "MAR", name: "Marruecos",   flag: "🇲🇦" },
    { code: "CRC", name: "Costa Rica",  flag: "🇨🇷" },
  ]},
  { id: "G", teams: [
    { code: "GER", name: "Alemania",      flag: "🇩🇪" },
    { code: "NED", name: "Países Bajos",  flag: "🇳🇱" },
    { code: "EGY", name: "Egipto",        flag: "🇪🇬" },
    { code: "JPN", name: "Japón",         flag: "🇯🇵" },
  ]},
  { id: "H", teams: [
    { code: "ITA", name: "Italia",     flag: "🇮🇹" },
    { code: "URU", name: "Uruguay",    flag: "🇺🇾" },
    { code: "KOR", name: "Corea Sur",  flag: "🇰🇷" },
    { code: "PAN", name: "Panamá",     flag: "🇵🇦" },
  ]},
  { id: "I", teams: [
    { code: "POR", name: "Portugal",  flag: "🇵🇹" },
    { code: "AUT", name: "Austria",   flag: "🇦🇹" },
    { code: "NGA", name: "Nigeria",   flag: "🇳🇬" },
    { code: "KSA", name: "A. Saudí",  flag: "🇸🇦" },
  ]},
  { id: "J", teams: [
    { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { code: "COL", name: "Colombia",   flag: "🇨🇴" },
    { code: "SRB", name: "Serbia",     flag: "🇷🇸" },
    { code: "TUN", name: "Túnez",      flag: "🇹🇳" },
  ]},
  { id: "K", teams: [
    { code: "NOR", name: "Noruega",   flag: "🇳🇴" },
    { code: "PAR", name: "Paraguay",  flag: "🇵🇾" },
    { code: "GHA", name: "Ghana",     flag: "🇬🇭" },
    { code: "TUR", name: "Turquía",   flag: "🇹🇷" },
  ]},
  { id: "L", teams: [
    { code: "POL", name: "Polonia",   flag: "🇵🇱" },
    { code: "CHI", name: "Chile",     flag: "🇨🇱" },
    { code: "ALG", name: "Argelia",   flag: "🇩🇿" },
    { code: "CMR", name: "Camerún",   flag: "🇨🇲" },
  ]},
];

// Build the 6 matches per group: round-robin in canonical order
// Pairing pattern for 4 teams (1,2,3,4): MD1: 1v2, 3v4 — MD2: 1v3, 4v2 — MD3: 4v1, 2v3
const PAIRINGS = [
  [[0,1],[2,3]],
  [[0,2],[3,1]],
  [[3,0],[1,2]],
];
const DATES = ["11 jun", "12 jun", "16 jun", "17 jun", "21 jun", "22 jun"];
const VENUES = ["Azteca", "MetLife", "SoFi", "AT&T", "BMO", "Lumen", "Mercedes", "Hard Rock", "NRG", "Arrowhead", "Levi's", "Gillette"];

window.MATCHES = [];
window.GROUPS.forEach((g, gi) => {
  PAIRINGS.forEach((md, mdIdx) => {
    md.forEach(([a, b], pairIdx) => {
      const idx = mdIdx * 2 + pairIdx;
      window.MATCHES.push({
        id: `${g.id}-${idx + 1}`,
        group: g.id,
        matchday: mdIdx + 1,
        date: DATES[mdIdx * 2 + pairIdx],
        time: pairIdx === 0 ? "18:00" : "21:00",
        venue: VENUES[(gi + idx) % VENUES.length],
        home: g.teams[a],
        away: g.teams[b],
      });
    });
  });
});
