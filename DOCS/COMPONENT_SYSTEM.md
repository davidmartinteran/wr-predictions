# Component System — Porra Mundial 2026

**Fuente:** Claude Design handoff
**Base:** shadcn/ui + extensiones custom

---

## 1. Atoms (primitivos)

### ScoreInput
Input numérico para marcador de partido.
- **Props:** `value: number | null`, `onChange`, `disabled: boolean`
- **Tamaño:** 44×44px (mobile), 52×52px (desktop)
- **Estilo:** `bg-zinc-950 border border-zinc-800 rounded-lg text-center font-mono font-bold tabular-nums`
- **Focus:** `border-primary ring-2 ring-primary/25`
- **Base shadcn:** `Input` con customización

### TeamBadge
Emoji de bandera + nombre del equipo.
- **Props:** `team: { code, name, flag }`, `size: 'sm' | 'md'`, `side: 'home' | 'away'`
- **Variantes:** `home` (bandera-nombre-caption LOCAL), `away` (nombre-bandera, alineado derecha)

### RankBadge
Indicador de posición en el ranking.
- **Props:** `rank: number`, `change: number`
- **Variantes:** top 3 con color de podio (gold/silver/bronze), 4+ en zinc-500
- **Flecha:** `ArrowUp` emerald / `ArrowDown` rose / `Minus` zinc

### FormDots
Racha de últimas 5 jornadas.
- **Props:** `form: (1|0|-1)[]`
- **Render:** 5 dots de 6px: verde (acierto), rojo (fallo), zinc (neutro)

### ProgressBar
Barra de progreso de pronósticos.
- **Props:** `current: number`, `total: number`
- **Estilo:** 6px height, `bg-zinc-800`, relleno `bg-primary`, dorado al 100%
- **Label:** `{current}/{total} partidos completados — {pct}%`

### StatusChip
Chip de estado inline.
- **Props:** `variant: 'provisional' | 'definitive' | 'locked' | 'live'`
- **Estilos:** provisional=amber, definitive=primary, locked=zinc+Lock, live=rose+pulse

## 2. Molecules (compuestas)

### MatchCard
Card de un partido con inputs de marcador.
- **Props:** `match: Match`, `prediction: Prediction | null`, `disabled: boolean`
- **Layout:** meta row (fecha/hora/sede) + match row (TeamBadge home + ScoreInput : ScoreInput + TeamBadge away)
- **Estados:** vacío, parcial (un input), completo (borde sube a zinc-700), bloqueado (readonly)
- **Base shadcn:** `Card`

### LeaderboardRow
Fila del ranking.
- **Props:** `row: RankingRow`, `isMe: boolean`
- **Layout:** rank + RankBadge + avatar 32px + nombre + sub (exactos/signos) + FormDots + total + delta
- **Highlight "yo":** `bg-primary/8` + barra lateral 2px primary
- **Base shadcn:** Fila de tabla custom

### BracketMatch
Nodo de eliminatoria en el bracket.
- **Props:** `match: BracketMatch`, `onPickWinner`, `disabled: boolean`
- **Layout:** dos filas (equipo A / equipo B) con divider
- **Seleccionado:** `bg-primary/10` + barra lateral 3px primary + chip `✓ PASA`
- **No seleccionado:** texto zinc-400

### StandingsStrip (mobile)
Tira sticky de clasificación provisional del grupo.
- **Props:** `groupId: string`, `standings: StandingRow[]`, `matchesPlayed: number`, `totalMatches: number`
- **Layout:** header (GRUPO X · QUIÉN PASA + StatusChip) + grid 4 columnas
- **Posición:** sticky encima de bottom nav

### PodiumCard (desktop)
Card de top 3 en la clasificación.
- **Props:** `row: RankingRow`, `position: 1|2|3`
- **Estilo:** avatar 56px, label uppercase del color, nombre 17px, mega-número del color
- **Líder:** halo dorado radial + borde `rgba(212,175,55,0.4)`

## 3. Organisms (secciones)

### GroupSelector
Selector de grupo A-L.
- **Mobile:** Tabs scrollables horizontales con underline. Check verde cuando grupo completo.
- **Desktop:** Sidebar vertical 260px, cada grupo como botón con banderas + progreso x/6.
- **Base shadcn:** `Tabs` (mobile), lista custom (desktop)

### MatchList
Lista de partidos de un grupo.
- **Props:** `matches: Match[]`, `predictions: Map<string, Prediction>`, `disabled: boolean`
- **Mobile:** Stack vertical `space-y-2.5`
- **Desktop:** Grid 2 columnas por jornada

### LeaderboardTable
Tabla de clasificación completa.
- **Props:** `rows: RankingRow[]`, `filter: string`, `myUserId: string`
- **Layout mobile:** PodiumSection (3 columnas) + lista densa 4-30
- **Layout desktop:** 3 PodiumCards + tabla shadcn con columnas (Pos/±/Jugador/Exactos/Signos/Bonus/Hoy/Forma/Total)
- **Filtros:** pills `Total | Hoy | Fase grupos | Eliminatorias`
- **Base shadcn:** `Table` (desktop), lista custom (mobile)

### BracketView
Vista completa del bracket de eliminatorias.
- **Mobile:** Segmented control (R32/R16/QF/SF/3°/F) + lista vertical de matches por ronda
- **Desktop:** Árbol horizontal 5 columnas de 200px, matches con `justify-around`
- **Propagación:** ganador avanza automáticamente a siguiente ronda
- **Base shadcn:** `ToggleGroup` para segmented control

### BottomNav
Navegación inferior mobile.
- **Tabs:** Pronósticos (List) | Clasificación (Trophy) | Mi Porra (User)
- **Estilo:** 64px + safe area, activo=zinc-50+primary, inactivo=zinc-500
- **Indicador home iOS:** 134×4px, zinc-100, centrado

### TopBar (desktop)
Barra superior desktop.
- **Layout:** logo+brand izquierda | tabs centrados | status+avatar derecha
- **Altura:** 56px

## 4. Templates (pantallas)

### PronosticsScreen
- **Mobile:** Header sticky + ProgressBar + GroupSelector + MatchList + StandingsStrip + BottomNav
- **Desktop:** TopBar + Sidebar(GroupSelector) + Centro(MatchList por jornadas) + Rail(ProgressCard + StandingsTable)

### LeaderboardScreen
- **Mobile:** Header + Filtros + PodiumSection + LeaderboardList + BottomNav
- **Desktop:** TopBar + Header + PodiumCards + LeaderboardTable
- **Pre-reveal:** Solo muestra contador de participantes

### BracketScreen
- **Mobile:** Header + SegmentedControl + BracketMatchList + CampeónCard + BottomNav
- **Desktop:** TopBar + Header + BracketTree horizontal + CampeónCard

## 5. Pantallas pendientes de diseñar

- **Login:** Campo email + botón magic link + branding
- **Mi Porra:** Resumen personal post-reveal
- **Extras:** Goleador + Mejor jugador (inputs texto con búsqueda)
- **Admin:** Panel de resultados
- **Estado "revelación":** Transición visual del 11 de junio
