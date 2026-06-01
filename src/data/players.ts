export type Player = {
  name: string;
  code: string;
  position: "DEL" | "MED" | "DEF" | "POR" | "EXT";
};

// NOTA: Lista de estrellas conocidas por selección, NO las plantillas completas de 26.
// Incluye únicamente selecciones presentes en el Mundial 2026 (verificado contra el
// calendario de openfootball). Las plazas de repesca aún sin definir (UEFA Path A/B/C/D,
// IC Path 1/2) no se incluyen porque a día de hoy no se conocen los clasificados.
// Pendiente de completar con las convocatorias oficiales (FIFA confirma el 2 de junio).

export const PLAYERS: Player[] = [
  // 🇦🇷 Argentina (Grupo J)
  { name: "Lionel Messi", code: "ARG", position: "DEL" },
  { name: "Julián Álvarez", code: "ARG", position: "DEL" },
  { name: "Lautaro Martínez", code: "ARG", position: "DEL" },
  { name: "Enzo Fernández", code: "ARG", position: "MED" },
  { name: "Rodrigo De Paul", code: "ARG", position: "MED" },
  { name: "Alexis Mac Allister", code: "ARG", position: "MED" },
  { name: "Nahuel Molina", code: "ARG", position: "DEF" },
  { name: "Cristian Romero", code: "ARG", position: "DEF" },
  { name: "Emiliano Martínez", code: "ARG", position: "POR" }, // añadido (mejor portero)
  { name: "Nicolás Tagliafico", code: "ARG", position: "DEF" }, // añadido

  // 🇧🇷 Brasil (Grupo C)
  { name: "Vinícius Jr.", code: "BRA", position: "EXT" },
  { name: "Rodrygo", code: "BRA", position: "EXT" },
  { name: "Endrick", code: "BRA", position: "DEL" },
  { name: "Raphinha", code: "BRA", position: "EXT" },
  { name: "Bruno Guimarães", code: "BRA", position: "MED" },
  { name: "Marquinhos", code: "BRA", position: "DEF" },
  { name: "Alisson", code: "BRA", position: "POR" },
  { name: "Éder Militão", code: "BRA", position: "DEF" },
  { name: "Casemiro", code: "BRA", position: "MED" }, // añadido
  { name: "Gabriel Magalhães", code: "BRA", position: "DEF" }, // añadido

  // 🇫🇷 Francia (Grupo I)
  { name: "Kylian Mbappé", code: "FRA", position: "DEL" },
  { name: "Antoine Griezmann", code: "FRA", position: "DEL" },
  { name: "Ousmane Dembélé", code: "FRA", position: "EXT" },
  { name: "Aurélien Tchouaméni", code: "FRA", position: "MED" },
  { name: "Eduardo Camavinga", code: "FRA", position: "MED" },
  { name: "William Saliba", code: "FRA", position: "DEF" },
  { name: "Mike Maignan", code: "FRA", position: "POR" },
  { name: "Randal Kolo Muani", code: "FRA", position: "DEL" },
  { name: "Bradley Barcola", code: "FRA", position: "EXT" }, // añadido
  { name: "Michael Olise", code: "FRA", position: "EXT" }, // añadido

  // 🇪🇸 España (Grupo H)
  { name: "Lamine Yamal", code: "ESP", position: "EXT" },
  { name: "Pedri", code: "ESP", position: "MED" },
  { name: "Gavi", code: "ESP", position: "MED" },
  { name: "Rodri", code: "ESP", position: "MED" },
  { name: "Dani Olmo", code: "ESP", position: "MED" },
  { name: "Álvaro Morata", code: "ESP", position: "DEL" },
  { name: "Nico Williams", code: "ESP", position: "EXT" },
  { name: "Fermín López", code: "ESP", position: "MED" },
  { name: "Unai Simón", code: "ESP", position: "POR" },
  { name: "Marc Cucurella", code: "ESP", position: "DEF" },
  { name: "Mikel Merino", code: "ESP", position: "MED" }, // añadido
  { name: "Robin Le Normand", code: "ESP", position: "DEF" }, // añadido
  { name: "Mikel Oyarzabal", code: "ESP", position: "DEL" }, // añadido

  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra (Grupo L)
  { name: "Harry Kane", code: "ENG", position: "DEL" },
  { name: "Jude Bellingham", code: "ENG", position: "MED" },
  { name: "Phil Foden", code: "ENG", position: "MED" },
  { name: "Bukayo Saka", code: "ENG", position: "EXT" },
  { name: "Cole Palmer", code: "ENG", position: "MED" },
  { name: "Declan Rice", code: "ENG", position: "MED" },
  { name: "Trent Alexander-Arnold", code: "ENG", position: "DEF" },
  { name: "Jordan Pickford", code: "ENG", position: "POR" }, // añadido (mejor portero)
  { name: "Anthony Gordon", code: "ENG", position: "EXT" }, // añadido

  // 🇩🇪 Alemania (Grupo E)
  { name: "Florian Wirtz", code: "GER", position: "MED" },
  { name: "Jamal Musiala", code: "GER", position: "MED" },
  { name: "Kai Havertz", code: "GER", position: "DEL" },
  { name: "Leroy Sané", code: "GER", position: "EXT" },
  { name: "İlkay Gündoğan", code: "GER", position: "MED" },
  { name: "Antonio Rüdiger", code: "GER", position: "DEF" },
  { name: "Manuel Neuer", code: "GER", position: "POR" },
  { name: "Joshua Kimmich", code: "GER", position: "MED" }, // añadido
  { name: "Niclas Füllkrug", code: "GER", position: "DEL" }, // añadido

  // 🇵🇹 Portugal (Grupo K)
  { name: "Cristiano Ronaldo", code: "POR", position: "DEL" },
  { name: "Bruno Fernandes", code: "POR", position: "MED" },
  { name: "Bernardo Silva", code: "POR", position: "MED" },
  { name: "Rafael Leão", code: "POR", position: "EXT" },
  { name: "Diogo Jota", code: "POR", position: "DEL" },
  { name: "Rúben Dias", code: "POR", position: "DEF" },
  { name: "Vitinha", code: "POR", position: "MED" }, // añadido
  { name: "João Félix", code: "POR", position: "DEL" }, // añadido
  { name: "Diogo Costa", code: "POR", position: "POR" }, // añadido (mejor portero)

  // 🇳🇱 Países Bajos (Grupo F)
  { name: "Cody Gakpo", code: "NED", position: "EXT" },
  { name: "Memphis Depay", code: "NED", position: "DEL" },
  { name: "Xavi Simons", code: "NED", position: "MED" },
  { name: "Frenkie de Jong", code: "NED", position: "MED" },
  { name: "Virgil van Dijk", code: "NED", position: "DEF" },
  { name: "Tijjani Reijnders", code: "NED", position: "MED" }, // añadido
  { name: "Denzel Dumfries", code: "NED", position: "DEF" }, // añadido

  // 🇧🇪 Bélgica (Grupo G)
  { name: "Kevin De Bruyne", code: "BEL", position: "MED" },
  { name: "Romelu Lukaku", code: "BEL", position: "DEL" },
  { name: "Jérémy Doku", code: "BEL", position: "EXT" },
  { name: "Thibaut Courtois", code: "BEL", position: "POR" },
  { name: "Youri Tielemans", code: "BEL", position: "MED" }, // añadido

  // 🇭🇷 Croacia (Grupo L)
  { name: "Luka Modrić", code: "CRO", position: "MED" },
  { name: "Mateo Kovačić", code: "CRO", position: "MED" },
  { name: "Andrej Kramarić", code: "CRO", position: "DEL" },
  { name: "Joško Gvardiol", code: "CRO", position: "DEF" }, // añadido

  // 🇺🇾 Uruguay (Grupo H)
  { name: "Darwin Núñez", code: "URU", position: "DEL" },
  { name: "Federico Valverde", code: "URU", position: "MED" },
  { name: "Ronald Araújo", code: "URU", position: "DEF" },
  { name: "Manuel Ugarte", code: "URU", position: "MED" }, // añadido
  // Luis Suárez eliminado: retirado de la selección de Uruguay.

  // 🇨🇴 Colombia (Grupo K)
  { name: "Luis Díaz", code: "COL", position: "EXT" },
  { name: "James Rodríguez", code: "COL", position: "MED" },
  { name: "Jhon Durán", code: "COL", position: "DEL" },
  { name: "Richard Ríos", code: "COL", position: "MED" },

  // 🇺🇸 EE.UU. (Grupo D)
  { name: "Christian Pulisic", code: "USA", position: "EXT" },
  { name: "Weston McKennie", code: "USA", position: "MED" },
  { name: "Timothy Weah", code: "USA", position: "EXT" },
  { name: "Folarin Balogun", code: "USA", position: "DEL" },
  { name: "Giovanni Reyna", code: "USA", position: "MED" },
  { name: "Tyler Adams", code: "USA", position: "MED" }, // añadido
  { name: "Antonee Robinson", code: "USA", position: "DEF" }, // añadido

  // 🇲🇽 México (Grupo A)
  { name: "Santiago Giménez", code: "MEX", position: "DEL" },
  { name: "Edson Álvarez", code: "MEX", position: "MED" },
  { name: "Guillermo Ochoa", code: "MEX", position: "POR" }, // añadido (mejor portero)
  { name: "Hirving Lozano", code: "MEX", position: "EXT" },

  // 🇨🇦 Canadá (Grupo B)
  { name: "Alphonso Davies", code: "CAN", position: "DEF" },
  { name: "Jonathan David", code: "CAN", position: "DEL" },
  { name: "Stephen Eustáquio", code: "CAN", position: "MED" }, // añadido

  // 🇳🇴 Noruega (Grupo I)
  { name: "Erling Haaland", code: "NOR", position: "DEL" },
  { name: "Martin Ødegaard", code: "NOR", position: "MED" },
  { name: "Alexander Sørloth", code: "NOR", position: "DEL" }, // añadido

  // 🇦🇹 Austria (Grupo J)
  { name: "Marcel Sabitzer", code: "AUT", position: "MED" },
  { name: "Konrad Laimer", code: "AUT", position: "MED" },
  // Marko Arnautović mantenido fuera por duda de convocatoria; revisar el 2 de junio.

  // 🇨🇭 Suiza (Grupo B)
  { name: "Granit Xhaka", code: "SUI", position: "MED" },
  { name: "Breel Embolo", code: "SUI", position: "DEL" },
  { name: "Noah Okafor", code: "SUI", position: "DEL" },
  { name: "Manuel Akanji", code: "SUI", position: "DEF" }, // añadido

  // 🇲🇦 Marruecos (Grupo C)
  { name: "Achraf Hakimi", code: "MAR", position: "DEF" },
  { name: "Brahim Díaz", code: "MAR", position: "MED" },
  { name: "Youssef En-Nesyri", code: "MAR", position: "DEL" },
  { name: "Azzedine Ounahi", code: "MAR", position: "MED" }, // añadido
  // Hakim Ziyech eliminado: fuera de los planes recientes de la selección.

  // 🇸🇳 Senegal (Grupo I)
  { name: "Sadio Mané", code: "SEN", position: "EXT" },
  { name: "Ismaïla Sarr", code: "SEN", position: "EXT" },
  { name: "Nicolas Jackson", code: "SEN", position: "DEL" },
  { name: "Pape Matar Sarr", code: "SEN", position: "MED" }, // añadido

  // 🇪🇬 Egipto (Grupo G)
  { name: "Mohamed Salah", code: "EGY", position: "EXT" },
  { name: "Omar Marmoush", code: "EGY", position: "DEL" },

  // 🇬🇭 Ghana (Grupo L)
  { name: "Mohammed Kudus", code: "GHA", position: "MED" },
  { name: "Iñaki Williams", code: "GHA", position: "DEL" },

  // 🇨🇮 Costa de Marfil (Grupo E)
  { name: "Sébastien Haller", code: "CIV", position: "DEL" },
  { name: "Simon Adingra", code: "CIV", position: "EXT" },

  // 🇩🇿 Argelia (Grupo J)
  { name: "Riyad Mahrez", code: "ALG", position: "EXT" },

  // 🇿🇦 Sudáfrica (Grupo A)
  { name: "Percy Tau", code: "RSA", position: "EXT" },

  // 🇯🇵 Japón (Grupo F)
  { name: "Takefusa Kubo", code: "JPN", position: "EXT" },
  { name: "Takumi Minamino", code: "JPN", position: "MED" },
  { name: "Kaoru Mitoma", code: "JPN", position: "EXT" },
  { name: "Daichi Kamada", code: "JPN", position: "MED" },

  // 🇰🇷 Corea del Sur (Grupo A)
  { name: "Son Heung-min", code: "KOR", position: "EXT" },
  { name: "Lee Kang-in", code: "KOR", position: "MED" },
  { name: "Kim Min-jae", code: "KOR", position: "DEF" }, // añadido

  // 🇦🇺 Australia (Grupo D)
  { name: "Jackson Irvine", code: "AUS", position: "MED" },

  // 🇮🇷 Irán (Grupo G)
  { name: "Mehdi Taremi", code: "IRN", position: "DEL" },
  { name: "Sardar Azmoun", code: "IRN", position: "DEL" },

  // 🇶🇦 Catar (Grupo B)
  { name: "Akram Afif", code: "QAT", position: "EXT" },
  { name: "Almoez Ali", code: "QAT", position: "DEL" },

  // 🇸🇦 Arabia Saudí (Grupo H)
  { name: "Salem Al-Dawsari", code: "KSA", position: "EXT" },

  // 🇪🇨 Ecuador (Grupo E)
  { name: "Moisés Caicedo", code: "ECU", position: "MED" },
  { name: "Enner Valencia", code: "ECU", position: "DEL" },

  // 🇵🇾 Paraguay (Grupo D)
  { name: "Miguel Almirón", code: "PAR", position: "MED" },

  // 🇵🇦 Panamá (Grupo L)
  { name: "José Fajardo", code: "PAN", position: "DEL" },

  // 🇳🇿 Nueva Zelanda (Grupo G)
  { name: "Chris Wood", code: "NZL", position: "DEL" },

  // 🇹🇳 Túnez (Grupo F)
  { name: "Youssef Msakni", code: "TUN", position: "MED" },

  // Selecciones del Mundial 2026 SIN estrella reconocida que pueda confirmar con
  // seguridad — pendientes de rellenar con la convocatoria oficial:
  // Haití (Grupo C), Escocia (Grupo C), Curaçao (Grupo E), Cabo Verde (Grupo H),
  // Uzbekistán (Grupo K), Jordania (Grupo J).
  // Plazas de repesca aún sin clasificado: UEFA Path A/B/C/D, IC Path 1/2.
];
