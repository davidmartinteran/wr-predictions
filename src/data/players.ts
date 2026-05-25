export type Player = {
  name: string;
  code: string;
  position: "DEL" | "MED" | "DEF" | "POR" | "EXT";
};

export const PLAYERS: Player[] = [
  // 🇦🇷 Argentina
  { name: "Lionel Messi", code: "ARG", position: "DEL" },
  { name: "Julián Álvarez", code: "ARG", position: "DEL" },
  { name: "Lautaro Martínez", code: "ARG", position: "DEL" },
  { name: "Enzo Fernández", code: "ARG", position: "MED" },
  { name: "Rodrigo De Paul", code: "ARG", position: "MED" },
  { name: "Alexis Mac Allister", code: "ARG", position: "MED" },
  { name: "Nahuel Molina", code: "ARG", position: "DEF" },
  { name: "Cristian Romero", code: "ARG", position: "DEF" },

  // 🇧🇷 Brasil
  { name: "Vinícius Jr.", code: "BRA", position: "EXT" },
  { name: "Rodrygo", code: "BRA", position: "EXT" },
  { name: "Endrick", code: "BRA", position: "DEL" },
  { name: "Raphinha", code: "BRA", position: "EXT" },
  { name: "Bruno Guimarães", code: "BRA", position: "MED" },
  { name: "Marquinhos", code: "BRA", position: "DEF" },
  { name: "Alisson", code: "BRA", position: "POR" },
  { name: "Éder Militão", code: "BRA", position: "DEF" },

  // 🇫🇷 Francia
  { name: "Kylian Mbappé", code: "FRA", position: "DEL" },
  { name: "Antoine Griezmann", code: "FRA", position: "DEL" },
  { name: "Ousmane Dembélé", code: "FRA", position: "EXT" },
  { name: "Aurélien Tchouaméni", code: "FRA", position: "MED" },
  { name: "Eduardo Camavinga", code: "FRA", position: "MED" },
  { name: "William Saliba", code: "FRA", position: "DEF" },
  { name: "Mike Maignan", code: "FRA", position: "POR" },
  { name: "Randal Kolo Muani", code: "FRA", position: "DEL" },

  // 🇪🇸 España
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

  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra
  { name: "Harry Kane", code: "ENG", position: "DEL" },
  { name: "Jude Bellingham", code: "ENG", position: "MED" },
  { name: "Phil Foden", code: "ENG", position: "MED" },
  { name: "Bukayo Saka", code: "ENG", position: "EXT" },
  { name: "Cole Palmer", code: "ENG", position: "MED" },
  { name: "Declan Rice", code: "ENG", position: "MED" },
  { name: "Trent Alexander-Arnold", code: "ENG", position: "DEF" },

  // 🇩🇪 Alemania
  { name: "Florian Wirtz", code: "GER", position: "MED" },
  { name: "Jamal Musiala", code: "GER", position: "MED" },
  { name: "Kai Havertz", code: "GER", position: "DEL" },
  { name: "Leroy Sané", code: "GER", position: "EXT" },
  { name: "İlkay Gündoğan", code: "GER", position: "MED" },
  { name: "Antonio Rüdiger", code: "GER", position: "DEF" },
  { name: "Manuel Neuer", code: "GER", position: "POR" },

  // 🇵🇹 Portugal
  { name: "Cristiano Ronaldo", code: "POR", position: "DEL" },
  { name: "Bruno Fernandes", code: "POR", position: "MED" },
  { name: "Bernardo Silva", code: "POR", position: "MED" },
  { name: "Rafael Leão", code: "POR", position: "EXT" },
  { name: "Diogo Jota", code: "POR", position: "DEL" },
  { name: "Rúben Dias", code: "POR", position: "DEF" },

  // 🇳🇱 Países Bajos
  { name: "Cody Gakpo", code: "NED", position: "EXT" },
  { name: "Memphis Depay", code: "NED", position: "DEL" },
  { name: "Xavi Simons", code: "NED", position: "MED" },
  { name: "Frenkie de Jong", code: "NED", position: "MED" },
  { name: "Virgil van Dijk", code: "NED", position: "DEF" },

  // 🇮🇹 Italia
  { name: "Federico Chiesa", code: "ITA", position: "EXT" },
  { name: "Nicolò Barella", code: "ITA", position: "MED" },
  { name: "Gianluca Scamacca", code: "ITA", position: "DEL" },
  { name: "Gianluigi Donnarumma", code: "ITA", position: "POR" },
  { name: "Sandro Tonali", code: "ITA", position: "MED" },

  // 🇧🇪 Bélgica
  { name: "Kevin De Bruyne", code: "BEL", position: "MED" },
  { name: "Romelu Lukaku", code: "BEL", position: "DEL" },
  { name: "Jérémy Doku", code: "BEL", position: "EXT" },
  { name: "Thibaut Courtois", code: "BEL", position: "POR" },

  // 🇭🇷 Croacia
  { name: "Luka Modrić", code: "CRO", position: "MED" },
  { name: "Mateo Kovačić", code: "CRO", position: "MED" },
  { name: "Andrej Kramarić", code: "CRO", position: "DEL" },

  // 🇺🇾 Uruguay
  { name: "Darwin Núñez", code: "URU", position: "DEL" },
  { name: "Federico Valverde", code: "URU", position: "MED" },
  { name: "Luis Suárez", code: "URU", position: "DEL" },
  { name: "Ronald Araújo", code: "URU", position: "DEF" },

  // 🇨🇴 Colombia
  { name: "Luis Díaz", code: "COL", position: "EXT" },
  { name: "James Rodríguez", code: "COL", position: "MED" },
  { name: "Jhon Durán", code: "COL", position: "DEL" },
  { name: "Richard Ríos", code: "COL", position: "MED" },

  // 🇺🇸 EE.UU.
  { name: "Christian Pulisic", code: "USA", position: "EXT" },
  { name: "Weston McKennie", code: "USA", position: "MED" },
  { name: "Timothy Weah", code: "USA", position: "EXT" },
  { name: "Folarin Balogun", code: "USA", position: "DEL" },
  { name: "Giovanni Reyna", code: "USA", position: "MED" },

  // 🇲🇽 México
  { name: "Hirving Lozano", code: "MEX", position: "EXT" },
  { name: "Santiago Giménez", code: "MEX", position: "DEL" },
  { name: "Edson Álvarez", code: "MEX", position: "MED" },

  // 🇨🇦 Canadá
  { name: "Alphonso Davies", code: "CAN", position: "DEF" },
  { name: "Jonathan David", code: "CAN", position: "DEL" },

  // 🇳🇴 Noruega
  { name: "Erling Haaland", code: "NOR", position: "DEL" },
  { name: "Martin Ødegaard", code: "NOR", position: "MED" },

  // 🇸🇪 Suecia
  { name: "Alexander Isak", code: "SWE", position: "DEL" },
  { name: "Dejan Kulusevski", code: "SWE", position: "EXT" },
  { name: "Viktor Gyökeres", code: "SWE", position: "DEL" },

  // 🇩🇰 Dinamarca
  { name: "Rasmus Højlund", code: "DEN", position: "DEL" },
  { name: "Christian Eriksen", code: "DEN", position: "MED" },
  { name: "Pierre-Emile Højbjerg", code: "DEN", position: "MED" },

  // 🇦🇹 Austria
  { name: "Marko Arnautović", code: "AUT", position: "DEL" },
  { name: "Marcel Sabitzer", code: "AUT", position: "MED" },
  { name: "Konrad Laimer", code: "AUT", position: "MED" },

  // 🇨🇭 Suiza
  { name: "Granit Xhaka", code: "SUI", position: "MED" },
  { name: "Breel Embolo", code: "SUI", position: "DEL" },
  { name: "Noah Okafor", code: "SUI", position: "DEL" },

  // 🇷🇸 Serbia
  { name: "Dušan Vlahović", code: "SRB", position: "DEL" },
  { name: "Aleksandar Mitrović", code: "SRB", position: "DEL" },
  { name: "Sergej Milinković-Savić", code: "SRB", position: "MED" },

  // 🇵🇱 Polonia
  { name: "Robert Lewandowski", code: "POL", position: "DEL" },
  { name: "Piotr Zieliński", code: "POL", position: "MED" },

  // 🇹🇷 Turquía
  { name: "Hakan Çalhanoğlu", code: "TUR", position: "MED" },
  { name: "Arda Güler", code: "TUR", position: "MED" },
  { name: "Kenan Yıldız", code: "TUR", position: "EXT" },

  // 🇲🇦 Marruecos
  { name: "Achraf Hakimi", code: "MAR", position: "DEF" },
  { name: "Hakim Ziyech", code: "MAR", position: "MED" },
  { name: "Youssef En-Nesyri", code: "MAR", position: "DEL" },
  { name: "Brahim Díaz", code: "MAR", position: "MED" },

  // 🇸🇳 Senegal
  { name: "Sadio Mané", code: "SEN", position: "EXT" },
  { name: "Ismaïla Sarr", code: "SEN", position: "EXT" },
  { name: "Nicolas Jackson", code: "SEN", position: "DEL" },

  // 🇳🇬 Nigeria
  { name: "Victor Osimhen", code: "NGA", position: "DEL" },
  { name: "Samuel Chukwueze", code: "NGA", position: "EXT" },

  // 🇪🇬 Egipto
  { name: "Mohamed Salah", code: "EGY", position: "EXT" },
  { name: "Omar Marmoush", code: "EGY", position: "DEL" },

  // 🇬🇭 Ghana
  { name: "Mohammed Kudus", code: "GHA", position: "MED" },
  { name: "Iñaki Williams", code: "GHA", position: "DEL" },

  // 🇨🇲 Camerún
  { name: "André-Frank Zambo Anguissa", code: "CMR", position: "MED" },

  // 🇨🇮 Costa de Marfil
  { name: "Sébastien Haller", code: "CIV", position: "DEL" },
  { name: "Simon Adingra", code: "CIV", position: "EXT" },

  // 🇩🇿 Argelia
  { name: "Riyad Mahrez", code: "ALG", position: "EXT" },

  // 🇿🇦 Sudáfrica
  { name: "Percy Tau", code: "RSA", position: "EXT" },

  // 🇯🇵 Japón
  { name: "Takefusa Kubo", code: "JPN", position: "EXT" },
  { name: "Takumi Minamino", code: "JPN", position: "MED" },
  { name: "Kaoru Mitoma", code: "JPN", position: "EXT" },
  { name: "Daichi Kamada", code: "JPN", position: "MED" },

  // 🇰🇷 Corea del Sur
  { name: "Son Heung-min", code: "KOR", position: "EXT" },
  { name: "Lee Kang-in", code: "KOR", position: "MED" },

  // 🇦🇺 Australia
  { name: "Jackson Irvine", code: "AUS", position: "MED" },

  // 🇮🇷 Irán
  { name: "Mehdi Taremi", code: "IRN", position: "DEL" },
  { name: "Sardar Azmoun", code: "IRN", position: "DEL" },

  // 🇶🇦 Catar
  { name: "Akram Afif", code: "QAT", position: "EXT" },
  { name: "Almoez Ali", code: "QAT", position: "DEL" },

  // 🇸🇦 Arabia Saudí
  { name: "Salem Al-Dawsari", code: "KSA", position: "EXT" },

  // 🇪🇨 Ecuador
  { name: "Moisés Caicedo", code: "ECU", position: "MED" },
  { name: "Enner Valencia", code: "ECU", position: "DEL" },

  // 🇵🇾 Paraguay
  { name: "Miguel Almirón", code: "PAR", position: "MED" },

  // 🇨🇱 Chile
  { name: "Alexis Sánchez", code: "CHI", position: "DEL" },
  { name: "Ben Brereton Díaz", code: "CHI", position: "DEL" },

  // 🇵🇦 Panamá
  { name: "José Fajardo", code: "PAN", position: "DEL" },

  // 🇨🇷 Costa Rica
  { name: "Keylor Navas", code: "CRC", position: "POR" },
  { name: "Joel Campbell", code: "CRC", position: "DEL" },

  // 🇯🇲 Jamaica
  { name: "Leon Bailey", code: "JAM", position: "EXT" },
  { name: "Michail Antonio", code: "JAM", position: "DEL" },

  // 🇳🇿 Nueva Zelanda
  { name: "Chris Wood", code: "NZL", position: "DEL" },

  // 🇹🇳 Túnez
  { name: "Youssef Msakni", code: "TUN", position: "MED" },

  // 🇸🇰 Eslovaquia
  { name: "Stanislav Lobotka", code: "SVK", position: "MED" },
];
