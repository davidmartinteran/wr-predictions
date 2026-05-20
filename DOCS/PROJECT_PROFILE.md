# PROJECT_PROFILE — Porra Mundial 2026

**Fase -1 — Project Profiling**
**Autor:** David
**Fecha:** Mayo 2026
**Versión:** 0.1.0

---

## 1. One-liner

App PWA para que un grupo cerrado de amigos meta pronósticos anónimos del Mundial 2026 antes del 11 de junio y vea la clasificación al día durante el torneo.

## 2. Contexto

Grupo de amigos hace porras de Mundial y Eurocopa con sistema de puntuación basado en dificultad de acierto: marcadores, clasificados de grupo, eliminatorias, mejor jugador y máximo goleador. Hasta ahora el proceso es manual (Excel, mensajes, etc.). El objetivo es **digitalizarlo**, con énfasis en:

- **Anonimato hasta el comienzo del torneo** (evitar copia entre amigos).
- **Visibilidad de clasificación en tiempo real** durante el torneo.
- **Sistema de puntuación parametrizable** (los puntos se acuerdan entre todos y deben poder ajustarse antes del deadline).

## 3. Tier asignado

**Tier B — Pragmático con rigor en lo crítico**

Justificación:
- El producto maneja "dinero" (premios entre amigos) → integridad del scoring y anti-fraude (anonimato) son críticos.
- El plazo (≈3 semanas) hace inviable Tier A (specs exhaustivas, auditorías formales).
- No es un proyecto descartable → Tier C es insuficiente.

**Implicaciones:**
- Specs ligeras pero completas (este documento + `SPEC.md` + 3-5 ADRs clave).
- TDD selectivo: estricto en lógica de scoring y reglas de anonimato; pragmático en UI.
- Sin auditorías formales de Fase 5; sí smoke tests E2E del flujo crítico.
- Feature flags solo para el "revelado" del 11 de junio (toggle de visibilidad).
- Observabilidad mínima: logs estructurados en Supabase + Vercel Analytics.

## 4. Restricciones duras

| Restricción | Valor | Implicación |
|---|---|---|
| **Deadline funcional** | 11 de junio de 2026 (kick-off Mundial) | Sin pronósticos editables después |
| **Plazo de desarrollo** | ~3 semanas | Scope quirúrgico, sin features "nice to have" en MVP |
| **Usuarios concurrentes** | <50 (grupo cerrado) | No hay que optimizar para escala |
| **Presupuesto infra** | €0 ideal, <€10/mes aceptable | Vercel free + Supabase free deberían bastar |
| **Idioma** | Español | Sin i18n |

## 5. Stack técnico

| Capa | Elección | Por qué |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) + TypeScript | Zona de confort del developer; SSR/RSC útil para clasificación |
| **UI** | Tailwind + shadcn/ui | Velocidad de scaffolding; consistencia visual sin diseñar desde cero |
| **PWA** | next-pwa o manifest manual | Instalable en móvil sin stores |
| **Backend** | Supabase (Postgres + Auth + Realtime + RLS) | RLS resuelve el anonimato a nivel BD; Realtime para clasificación live |
| **Auth** | Supabase Auth (Magic Link por email) | Sin passwords, fricción mínima para amigos |
| **Hosting** | Vercel | Deploy automático desde GitHub; free tier suficiente |
| **Datos del Mundial** | Manual en MVP (admin mete resultados) | Decisión en ADR-003; APIs externas opcional post-MVP |

## 6. Estrategia de agentes

- **Modo principal:** Claude Code en escritorio, sesiones Spec-Driven.
- **Sub-agentes:** No formalizados en MVP (Tier B con plazo corto). Uso ad-hoc de Plan Mode para features no triviales.
- **GitHub Actions:** Solo `claude-pr-review.yml` opcional si sobra tiempo. No nightly audits en MVP.
- **Remote Control:** No prioritario en MVP.

## 7. Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Bug en cálculo de puntuación tras revelado | Media | Alto (rompe confianza del grupo) | TDD estricto en módulo de scoring + tabla de casos en `SPEC.md` |
| Filtración de pronósticos antes del 11 de junio | Baja (si RLS bien hecho) | Alto (destruye el sentido del producto) | RLS en BD + test E2E que verifique imposibilidad de leer pronósticos ajenos antes del deadline |
| No llegar al 11 de junio con features completas | **Alta** | Alto | Scope quirúrgico: MVP incluye SOLO grupos + clasificados + campeón + goleador + mejor jugador. Eliminatorias detalladas → fase 2 si da tiempo |
| Admin (yo) no mete resultados a tiempo durante el Mundial | Media | Medio | UI de admin sencilla y móvil-first; recordatorios manuales |
| Empate en puntos al final | Alta | Bajo | Tiebreaker definido en reglas (acierto exacto > acierto signo) |

## 8. Definición de "Done" del MVP

El MVP está listo cuando:

1. ✅ Cualquier amigo con email invitado puede registrarse con Magic Link.
2. ✅ Cada usuario puede meter y editar su pronóstico hasta el 11 de junio 18:00 (hora de inicio del primer partido).
3. ✅ Antes del deadline, ningún usuario puede ver pronósticos de otros (verificado a nivel BD).
4. ✅ El 11 de junio, los pronósticos se revelan automáticamente.
5. ✅ El admin puede meter resultados reales tras cada partido desde un panel móvil-first.
6. ✅ La clasificación se actualiza en tiempo real al meter resultados.
7. ✅ La app es instalable como PWA en iOS y Android.
8. ✅ El sistema de puntos es configurable (un JSON o tabla editable por el admin).

## 9. Fuera de scope del MVP

- Histórico de porras anteriores.
- Comentarios o chat entre usuarios.
- Notificaciones push.
- Estadísticas avanzadas (rachas, head-to-head, etc.).
- Integración con API externa de resultados.
- Pronósticos sobre eliminatorias detalladas con marcadores exactos (solo "quién pasa" en MVP; marcadores se evalúa si da tiempo).
- Sistema de pagos / cobro de premios automatizado.
