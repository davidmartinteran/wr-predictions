# Design System — Porra Mundial 2026

**Fuente:** Claude Design handoff (`design-handoff/porra-wc/`)
**Fidelidad:** High-fidelity. Colores, tipografía, spacing e interacciones son finales.

---

## 1. Paleta de colores (Dark mode)

### Fondos
| Token | Valor | Uso |
|---|---|---|
| `bg-base` | `#0a0a0b` (zinc-950) | Fondo de la app |
| `bg-surface` | `#18181b` (zinc-900) | Cards, paneles |
| `bg-elevated` | `#27272a` (zinc-800) | Hover, bordes elevados |

### Texto
| Token | Valor | Uso |
|---|---|---|
| `fg-default` | `#fafafa` (zinc-50) | Texto principal |
| `fg-muted` | `#a1a1aa` (zinc-400) | Texto secundario |
| `fg-subtle` | `#71717a` (zinc-500) | Labels, metadata |
| `fg-faint` | `#52525b` (zinc-600) | Placeholders, deshabilitado |

### Bordes
| Token | Valor | Uso |
|---|---|---|
| `border-default` | `rgb(39 39 42 / 0.8)` (zinc-800/80) | Bordes de cards |
| `border-strong` | `#3f3f46` (zinc-700) | Bordes activos, dividers |

### Brand
| Token | Valor | Regla de uso |
|---|---|---|
| `primary` | `#1B9E5B` | CTAs, focus, aciertos, "pasa de ronda". NUNCA decorativo |
| `gold` | `#D4AF37` | SOLO podio top 3, barra 100%, "tu campeón". NUNCA en CTAs |
| `danger` / `live` | `#f43f5e` (rose-500) | Bajadas de posición, indicador "en directo", errores |

### Reglas de color
- Verde solo en CTAs primarios y aciertos confirmados
- Dorado solo en contextos de ranking (medallas, top 3, trofeo, barra al 100%)
- Nunca verde y dorado juntos en el mismo componente
- Cards se separan del fondo con `border border-zinc-800/80` + `bg-zinc-900/40–60`, sin sombras

## 2. Tipografía

| Uso | Familia | Weights | Notas |
|---|---|---|---|
| UI / texto | Inter | 400, 500, 600, 700 | `next/font` |
| Marcadores, puntuaciones | JetBrains Mono | 600, 700 | Siempre `tabular-nums` |

### Escala de tamaños
| Tamaño | Uso |
|---|---|
| `10.5px` | Labels uppercase, metadata (`tracking-[0.12em]`) |
| `11px` | Captions |
| `12-13px` | Cuerpo |
| `14-15px` | Nombres de equipo, items principales |
| `17px` | Títulos de panel |
| `20px` | H1 mobile |
| `22px` | Marcador mobile (mono bold) |
| `26px` | Marcador desktop (mono bold) |
| `28-34px` | H1 desktop, mega-números |

## 3. Spacing, radios, bordes

- **Radios:** `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), `rounded-full` (pills/avatars)
- **Sin sombras.** Separación por bordes y fondos sutiles.
- **Padding card:** `p-3.5` (mobile) / `p-4`–`p-5` (desktop)
- **Gap entre cards:** `space-y-2.5` (mobile) / `gap-3` (desktop)

## 4. Iconografía (lucide-react)

| Uso | Icono |
|---|---|
| Tab Pronósticos | `List` |
| Tab Clasificación | `Trophy` |
| Tab Mi Porra | `User` |
| Completado | `Check` |
| Chevron | `ChevronRight` |
| Bloqueo | `Lock` |
| Info | `Info` |
| Bracket | `Network` o `GitBranch` |
| En directo | Círculo rojo 8px + `animate-pulse` |
| Subida posición | `ArrowUp` (emerald) |
| Bajada posición | `ArrowDown` (rose) |
| Sin cambio | `Minus` (zinc) |
| Podio | `Star` (relleno) |

## 5. Layout

### Mobile (390 × 844)
- `flex flex-col h-screen`
- Header sticky (~88px)
- Contenido scrollable
- Bottom nav fija: 64px + safe area, 3 tabs (Pronósticos / Clasificación / Mi Porra)
- Tab activo: `text-zinc-50` + icono `text-primary`
- Tab inactivo: `text-zinc-500`

### Desktop (1440 × 900)
- Top bar 56px: logo+brand izquierda, tabs centrados, avatar+status derecha
- Layout de 3 columnas: sidebar 260px | centro `max-w-[920px]` | rail 280px

## 6. Interacciones

### Inputs de marcador
- `type="tel"` + `inputMode="numeric"` para teclado numérico móvil
- Tamaño: 44×44px (mobile), 52×52px (desktop)
- Estilo: `bg-zinc-950 border-zinc-800 text-center text-[22px] font-bold font-mono tabular-nums`
- Focus: `border-primary ring-2 ring-primary/25`
- Placeholder: `–` (zinc-700)
- Validación: 0–20, solo dígitos
- Separador: `:` en zinc-700

### Auto-save
- Debounce 500ms al backend
- Sync optimista (cambio inmediato + rollback si falla)
- Dot indicador opcional junto al input mientras se guarda

### Standings strip (mobile)
- Sticky encima de bottom nav, siempre visible al rellenar pronósticos
- Grid 4 columnas: posición + bandera + código equipo (mono) + pts
- Top 2 (pasan): `bg-primary/10` + `border-b-2 border-primary`
- 3-4 (no pasan): `border-b-2 border-zinc-800`, texto atenuado
- Reordena en tiempo real con cada marcador

### Bloqueo post-deadline
- Inputs `readonly`, badge cambia a `🔒 Bloqueado`

### Clasificación pre-reveal (antes 11 jun)
- Solo muestra: `X de 30 han completado sus pronósticos`
- Sin tabla, sin nombres, sin puntos
