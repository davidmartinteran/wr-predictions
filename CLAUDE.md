@AGENTS.md

# Porra Mundial 2026

## QUE — Stack y estructura
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui
- Supabase (Postgres + Auth + Realtime + RLS + Edge Functions)
- Hosting: Vercel. PWA manual (manifest + SW mínimo)
- Fuentes: Inter (UI) + JetBrains Mono (marcadores) via next/font
- Iconos: lucide-react

## Estructura
```
src/app/(auth)/        → login, auth callback
src/app/(main)/        → predictions, leaderboard, compare, profile
src/app/admin/         → results, scoring, invites
src/components/ui/     → shadcn components
src/components/        → predictions/, leaderboard/, admin/, bracket/
src/lib/supabase/      → client.ts, server.ts, middleware.ts, types.ts
src/lib/scoring/       → engine.ts (puro, TDD estricto)
supabase/migrations/   → SQL migrations
supabase/functions/    → Edge Functions (poll-results, reveal-pool)
DOCS/                  → Specs, ADRs, design system, prototipos
```

## POR QUE — Decisiones clave
- Anonimato vía RLS, NO en frontend (ADR-002) — el dato nunca llega al cliente
- Resultados vía API-Football polling cada 30min + override manual (ADR-003)
- Auth Magic Link sin password (ADR-004)
- Scoring engine es función pura sin side effects (testeable al 100%)
- Server Components por defecto; `'use client'` solo para interactividad

## COMO — Patrones obligatorios
- Mutaciones via Server Actions + validación Zod, nunca API routes custom
- Design tokens en DOCS/design.md — consultar antes de crear UI
- Componentes en DOCS/COMPONENT_SYSTEM.md — usar existentes antes de crear nuevos
- Cards: `border border-zinc-800/80 bg-zinc-900/40`, sin sombras
- Primary (#1B9E5B) solo en CTAs y aciertos; Gold (#D4AF37) solo en podio top 3
- Marcadores: JetBrains Mono, font-bold, tabular-nums
- Inputs marcador: type="tel" inputMode="numeric" 44×44 mobile / 52×52 desktop
- DB types auto-generados: `npx supabase gen types typescript`
- Tests scoring: Vitest, TDD estricto. Tests E2E anonimato: Playwright

## SESION — Protocolo
- Leer SESSION_LOG.md PRIMERO para estado actual del proyecto
- Leer DOCS/SPEC.md para contexto de producto
- Leer DOCS/ARCHITECTURE.md para decisiones técnicas
- Leer DOCS/design.md antes de crear cualquier componente UI
- Consultar DOCS/COMPONENT_SYSTEM.md antes de crear componentes nuevos
- Consultar DOCS/design/screens-mobile.jsx y screens-desktop.jsx para ver si la pantalla ya tiene diseño
- Actualizar SESSION_LOG.md al final de cada sesión con cambios realizados
