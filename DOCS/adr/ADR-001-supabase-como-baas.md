# ADR-001 — Supabase como BaaS

**Estado:** Aceptado
**Fecha:** 2026-05-20
**Contexto:** Fase 1 — Architecture & Design

---

## Contexto

Necesitamos auth + base de datos relacional + realtime + reglas de seguridad declarativas. El plazo es ~3 semanas (deadline 11 de junio). El developer es uno solo. El grupo de usuarios es <50 personas.

## Decisión

Usar **Supabase** (Postgres + Auth + Realtime + Row-Level Security + Edge Functions) como backend completo.

## Alternativas evaluadas

| Opción | Pros | Contras |
|---|---|---|
| **Supabase** | RLS nativo resuelve anonimato a nivel BD; Realtime integrado; Auth con Magic Link out-of-the-box; free tier suficiente; Postgres estándar (portabilidad) | Vendor lock-in en Auth y Realtime; Edge Functions tienen cold start; documentación a veces desactualizada |
| **Firebase** | Auth excelente; Realtime DB madura; gran ecosistema | Firestore no tiene RLS declarativo (security rules son menos expresivas para queries complejas); NoSQL complica scoring relacional; lock-in más fuerte |
| **Neon + Auth.js + custom** | Máximo control; Postgres puro; sin lock-in | Mucho más código para auth, realtime y RLS; inviable en 3 semanas solo |
| **PocketBase** | Single binary; simple; SQLite | Menos maduro; sin realtime robusto; comunidad pequeña; riesgo para producción |

## Tradeoffs aceptados

- **Vendor lock-in:** Aceptable para Tier B con plazo corto. Si el proyecto escala post-Mundial, Supabase usa Postgres estándar — la migración de datos es viable. Auth y Realtime sí tendrían coste de migración.
- **Free tier limits:** 500MB BD, 50K MAU auth, 2 Edge Functions concurrentes. Para <50 usuarios y ~104 partidos, sobra.
- **Cold start en Edge Functions:** Aceptable; el cron de revelado puede tardar 1-2s sin impacto UX.

## Consecuencias

- Todo el backend vive en Supabase: no hay servidor propio.
- RLS es la capa de seguridad principal (ver ADR-002).
- Realtime de Supabase alimenta la clasificación en vivo.
- Las migraciones SQL se gestionan con Supabase CLI (`supabase db diff` / `supabase migration`).
