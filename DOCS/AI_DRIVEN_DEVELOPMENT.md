# FLUJO DE DESARROLLO AGÉNTICO ÓPTIMO

**Meta-framework agnóstico para desarrollo web/mobile con IA**  
Combinando Spec-Driven Development, Claude Code y mejores prácticas de la industria

**v1.4.0 | Abril 2026 | David | Frontend Developer**
_Documento vivo — versionar y actualizar tras cada retrospectiva_

---

## Changelog v1.4.0

- **NUEVO:** Design Gate — gate genérico obligatorio antes de implementar UI: consultar design.md del proyecto
- **NUEVO:** Background Stream Pattern — patrón concreto para tareas paralelas no críticas mientras el dev trabaja en consola
- **NUEVO:** Autonomous PR Mode — flujo "leave-home" para que Claude implemente features y abra PRs para revisión diferida
- **NUEVO:** Principio de documentación auto-referenciada — el agente usa REQUIREMENTS.md + DATA_MODEL.md como fuente de verdad; gaps encontrados se documentan en el PR para mejorar los docs orgánicamente
- **MEJORADO:** Stream B con ejemplos de tareas seguras vs. inseguras para background

## Changelog v1.3.0

- **NUEVO:** Principio fundamental — Disciplina Metodológica (el framework se sigue, no se pospone)
- **NUEVO:** Compound engineering como gate obligatorio post-milestone (no soft, hard)
- **NUEVO:** Protocolo de compliance para fases tempranas (0-3): el agente debe leer el framework completo
- **NUEVO:** Criterio explícito de ADRs para Tier B (>3 archivos, patrón reutilizable, alternativas no obvias)
- **NUEVO:** Regla de consulta de DOCS obligatoria antes de implementar (components → COMPONENT_SYSTEM.md, data → DATA_MODEL.md, UI → design.md)
- **NUEVO:** SESSION_LOG.md como artefacto obligatorio desde Fase 2 (no opcional)
- **MEJORADO:** `/rehydrate` incluye verificación de artefactos pendientes por fase
- **MEJORADO:** Quality gates de Fase 2 y 3 ampliados con artefactos metodológicos

## Changelog v1.2.0

- **NUEVO:** Principio fundamental — Decisión Informada (exponer WHY, herramientas, pros/cons, alternativas con tradeoffs)
- **NUEVO:** Fase 1 incluye Design System como artefacto formal (chromatic guide + component system spec + Stitch MCP)
- **NUEVO:** Fase 2 incluye custom commands de scaffolding y Claude Memory como mecanismo de persistencia cross-sesión
- **NUEVO:** Capa Transversal 13 — Decisión Informada (transparencia en decisiones técnicas)
- **MEJORADO:** Fase 1 — Artefactos ampliados con design.md, COMPONENT_SYSTEM.md, STITCH_PROMPTS.md
- **MEJORADO:** Fase 2 — Artefactos ampliados con commands de scaffolding, UX review agent, Stitch MCP integration
- **MEJORADO:** Principios fundamentales actualizados con aprendizajes de Fases 0-2

## Changelog v1.1.0

- **NUEVO:** Capa Transversal 11 — Multi-Agent Orchestration (paralelismo formalizado por Tier)
- **NUEVO:** Capa Transversal 12 — Remote & Autonomous Development (Remote Control, headless, GitHub Actions)
- **NUEVO:** Fase 2 incluye Autonomous Agent Infrastructure y Starter Kit ejecutable
- **NUEVO:** Mini-ciclo de Fase 4 reescrito con paralelismo integrado
- **NUEVO:** Comando `/rehydrate` para warm start automatizado
- **NUEVO:** Comandos custom `.claude/commands/` formalizados por fase
- **MEJORADO:** Tiers ahora definen nivel de paralelismo explícito
- **MEJORADO:** Context Persistence con mecanismo de warm start
- **MEJORADO:** Fase -1 incluye decisión de infraestructura de agentes
- **MEJORADO:** Quality Gates incluyen verificación de orquestación multi-agente

---

## Visión General del Framework

Este documento define el flujo de desarrollo óptimo para aplicaciones web y mobile, fusionando tres fuentes de conocimiento: (1) un framework de fases validado contra Shape Up, Lean Startup, DevSecOps y prácticas de Stripe/Shopify/Vercel/Linear, (2) metodologías de desarrollo agéntico con Claude Code incluyendo Spec-Driven Development, Compound Engineering, TDD con agentes y orquestación multi-agente, y (3) experiencia práctica acumulada en proyectos reales.

El resultado es un sistema híbrido: las fases tempranas (-1 a 2) son secuenciales y rigurosas (contexto y decisiones), la zona central (3-4) es iterativa con discovery continuo y paralelismo de agentes, y las fases finales (5-7) operan como un ciclo de mejora continua. La capa de IA amplifica cada fase con agentes especializados, aislamiento de contexto, verificación automatizada y orquestación paralela.

> **Principio fundamental:** La ingeniería de contexto es la habilidad central. La calidad del código que un agente IA genera es directamente proporcional a la calidad del contexto que recibe: specs claras, CLAUDE.md precisos, reglas relevantes y conversaciones limpias.

> **Principio operativo:** El framework sirve al producto, no al revés. Si una práctica ralentiza el shipping sin mitigar un riesgo real, se degrada de Tier o se elimina para ese proyecto.

> **Principio de orquestación:** Un solo agente bien dirigido supera a diez agentes mal coordinados. El paralelismo se activa cuando hay tareas genuinamente independientes, nunca como sustituto de buena planificación.

> **Principio de disciplina metodológica:** El framework se sigue en tiempo real, no se pospone. SESSION_LOG, IMPROVEMENT_LOG, compound engineering y ADRs se mantienen al ritmo del desarrollo. Si la metodología se deja para "después", se acumula deuda que cuesta más corregir que prevenir. En fases tempranas (0-3), el agente IA debe leer el framework completo para internalizar el flujo antes de empezar a codear.

> **Principio de decisión informada:** Toda decisión técnica se expone antes de ejecutarse. El agente IA debe comunicar: (1) **POR QUÉ** se elige un enfoque, (2) **CON QUÉ** herramientas/librerías/patrones se implementa, (3) **PROS y CONTRAS** del enfoque elegido, y (4) **ALTERNATIVAS** con sus tradeoffs evaluados. Esto construye el modelo mental del desarrollador y permite decisiones conscientes. Para decisiones triviales, una línea basta; para decisiones arquitectónicas, un análisis breve con opciones.

---

## Mapa de Fases

El flujo se organiza en 9 fases (-1 a 7) con tres zonas diferenciadas, capas transversales y puntos de decisión explícitos:

**ZONA DE ENTRADA** (perfilar el proyecto, activar el framework correcto)

- **Fase -1 — Project Profiling:** Del tipo de proyecto al nivel de rigor, gates y estrategia de agentes

**ZONA SECUENCIAL** (ejecutar en orden, completar antes de avanzar)

- **Fase 0 — Discovery & Spec:** Del problema a la especificación validada
- **Fase 1 — Architecture & Design:** De la spec a las decisiones técnicas documentadas
- **Fase 2 — Project Scaffolding:** De la arquitectura al proyecto base funcional con CI/CD, agentes configurados e infraestructura autónoma

**ZONA ITERATIVA** (ciclos continuos, discovery paralelo, agentes en paralelo)

- **Fase 3 — Core Foundation:** Infraestructura mínima viable para la primera feature
- **Fase 3.5 — Cognitive Core Design (si AI-heavy):** Capa cognitiva mínima para features IA
- **Fase 4 — Feature Development:** Ciclos Spec-Driven paralelos: Spec → Plan → TDD+Review en paralelo → Merge → Compound

**ZONA CONTINUA** (operan en ciclo permanente post-launch)

- **Fase 5 — Integration & Hardening:** Testing E2E, auditorías, edge cases
- **Fase 6 — Deployment & Release:** Progressive delivery con feature flags
- **Fase 7 — Post-Launch & Iteration:** Métricas, feedback, tech debt, retrospectiva

> **Punto de decisión clave:** Tras la primera iteración de Fase 4: ¿Pivotar o perseverar? Para productos greenfield con alta incertidumbre, liberar un MVP real a usuarios reales antes de completar todas las features planificadas. Lean Startup manda.

---

## SISTEMA DE TIERS (Rigor Adaptativo + Nivel de Paralelismo)

El framework define un "flujo perfecto", pero cada proyecto activa un subconjunto según riesgo, horizonte y ambición. Esto evita sobrearquitectura prematura y hace el meta-framework sostenible.

### Tier A — Alto riesgo / Core de negocio

- Specs formales completas
- ADRs obligatorios para decisiones significativas
- TDD estricto en core
- Multi-agent review (seguridad, perf, a11y)
- Auditorías completas (Fase 5)
- Observabilidad completa desde el principio
- Feature flags obligatorias (release desacoplado)
- **Paralelismo:** Agent Teams + N-of-1 competitivo para features críticas
- **Autonomía:** GitHub Actions CI/CD + cron nocturno + Remote Control

### Tier B — Producto estándar

- Specs ligeras pero explícitas
- ADRs para decisiones irreversibles + decisiones que: (1) afectan >3 archivos, (2) introducen un patrón reutilizable, o (3) eligen entre alternativas no obvias. Formato ligero (<1 página)
- Tests razonables (unit + integración)
- Review humano + 1 sub-agente (rotatorio)
- Auditorías proporcionadas (perf/a11y según necesidad)
- Observabilidad mínima viable
- **Paralelismo:** Sub-agentes con worktree isolation para tareas independientes
- **Autonomía:** GitHub Actions para PRs + Remote Control

### Tier C — Experimento / Prototipo

- Spec mínima (objetivo, flujos, criterios)
- Sin ADR formal (decisiones en ARCHITECTURE.md)
- Tests mínimos (smoke + unit críticos)
- Review ligera
- Auditorías opcionales
- Shipping rápido (validación primero)
- **Paralelismo:** Sesión única, máxima velocidad. Worktrees solo si hay tareas claramente separadas
- **Autonomía:** Opcional. Remote Control si hay sesiones largas

> **Regla:** El Tier se define en Fase -1. No se sube de Tier "a mitad" salvo evidencia (incidente, cambio de riesgo, cambio de alcance).

---

## FASE -1 — PROJECT PROFILING

_Del tipo de proyecto al nivel de rigor, gates y estrategia de agentes_

### Objetivo

Clasificar el proyecto antes de aplicar el framework para determinar: (1) Tier (A/B/C), (2) gates obligatorios, (3) capas IA aplicables, (4) modo de ejecución (solo builder vs equipo), y (5) estrategia de agentes (paralelismo, autonomía, infraestructura remota).

### Actividades

1. **Definir el tipo de producto.** CRUD, mobile-first, multi-tenant, AI-heavy, etc.
2. **Evaluar nivel de riesgo.** PII, autenticación, pagos, compliance, integraciones críticas.
3. **Definir horizonte temporal.** 2 semanas, 2 meses, largo plazo.
4. **Modo de ejecución.** Solo builder vs equipo (afecta a templates, PRs, gates).
5. **Activar Tier.** A/B/C según riesgo + ambición.
6. **Decidir capas aplicables.** AI Evaluation Layer, GDPR, observability, feature flags, etc.
7. **Estrategia de agentes.** Nivel de paralelismo, infraestructura remota, autonomía nocturna.
8. **Definition of Done del proyecto.** Qué significa "release v1" para este producto.

### Estrategia de Agentes por Tier

**Tier A:**

- Agent Teams para features complejas (implementación + tests + security review en paralelo)
- N-of-1 competitivo: 2-3 agentes implementan la misma spec, se elige la mejor solución
- GitHub Actions con `@claude` triggers para review de PRs y implementación por issues
- Cron nocturno para auditorías automatizadas (seguridad, deps, documentación)
- Remote Control activo para supervisión móvil de sesiones largas

**Tier B:**

- Sub-agentes con worktree isolation para tareas paralelas (ej: tests + docs en paralelo con implementación)
- GitHub Actions para auto-review de PRs
- Remote Control para sesiones de más de 30 minutos

**Tier C:**

- Sesión única con Claude Code interactivo
- Remote Control opcional para sesiones largas
- Sin infraestructura de agentes adicional

### Flujo con Claude Code

- **Modo Plan:** Claude propone preguntas de profiling y sugiere Tier/gates/estrategia de agentes basado en el contexto del proyecto.
- **Sub-agente researcher:** benchmarks de industria según tipo de producto (si aplica).

### Quality Gate: Exit Criteria

- `PROJECT_PROFILE.md` creado y versionado
- Tier seleccionado y justificado
- Gates activados listados (obligatorios vs opcionales)
- Estrategia de agentes definida (paralelismo + autonomía + Remote Control)
- Si AI-heavy: se activa Fase 3.5 y AI Evaluation Layer

### Artifacts

| Artifact             | Descripción                                          |
| -------------------- | ---------------------------------------------------- |
| `PROJECT_PROFILE.md` | Perfil: tipo, riesgo, tier, gates, DoD, agentes      |
| `GATES.md`           | Lista de quality gates activados (hard/soft)         |
| `AGENT_STRATEGY.md`  | Estrategia de paralelismo, autonomía, Remote Control |

---

## FASE 0 — DISCOVERY & SPEC

_Del problema a la especificación validada_

### Objetivo

Transformar una idea o necesidad en una especificación formal y validada que sirva como fuente de verdad para todo el desarrollo posterior. El artefacto principal no son requisitos tradicionales sino hipótesis con criterios de validación.

### Actividades

1. **Definición del problema y público objetivo.** Quién tiene el problema, por qué existe, qué alternativas usan hoy.
2. **User research y validación de asunciones.** Entrevistas, journey maps, análisis competitivo.
3. **Requisitos como hipótesis (MoSCoW).** Cada requisito es una hipótesis: "Creemos que [feature] logrará [resultado] para [usuario], medido por [métrica]."
4. **Definición de MVP vs versión completa.** El MVP es el experimento mínimo que valida la hipótesis más arriesgada.
5. **Spec formal (Spec-Driven Development).** SPEC.md con tipos, estados, flujos, acceptance criteria. EARS o Gherkin.
6. **Regulatory/GDPR assessment.** ¿Se procesan datos personales? DPIA si aplica.
7. **Métricas de éxito y riesgo.** DORA targets, KPIs de producto, matriz de riesgo.

### Añadido (AI-heavy)

8. **Definir "qué es correcto" en IA.** Criterios de calidad de respuesta: exactitud, cobertura, consistencia, tono, seguridad.
9. **Riesgos específicos IA.** Prompt injection, PII leakage, alucinación en dominios críticos, coste/latencia, drift.
10. **Métricas IA iniciales.** Latencia objetivo, coste por request, tasa de fallback/no-answer.

### Flujo con Claude Code

- **Modo Plan (Shift+Tab x2):** Claude analiza la spec y genera preguntas antes de implementación.
- **/model opusplan:** Opus para planificar, Sonnet para ejecutar.
- **Sub-agente researcher:** Investiga mejores prácticas, analiza competidores y sugiere arquitecturas.

### Quality Gate: Exit Criteria

- SPEC.md escrito, revisado y versionado en git
- Hipótesis priorizadas con métricas de validación definidas
- Scope del MVP alineado y explícito
- Assessment legal/GDPR completado si aplica
- (AI-heavy) Métricas + riesgos IA documentados

### Artifacts

| Artifact                | Descripción                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| `SPEC.md`               | Especificación formal con tipos, estados, flujos y acceptance criteria |
| `PROJECT_BRIEF.md`      | Problema, público, MVP, métricas                                       |
| `REQUIREMENTS.md`       | Requisitos MoSCoW como hipótesis                                       |
| `RISK_MATRIX.md`        | Riesgos, probabilidad, impacto, mitigaciones                           |
| `DPIA.md`               | Data Protection Impact Assessment (si aplica)                          |
| `AI_SUCCESS_METRICS.md` | (AI-heavy) Métricas IA, coste/latencia, seguridad                      |

---

## FASE 1 — ARCHITECTURE & DESIGN

_De la spec a las decisiones técnicas documentadas_

### Objetivo

Traducir la especificación en decisiones técnicas documentadas e irreversibles usando ADRs. Cada decisión importante se documenta con contexto, opciones consideradas y razonamiento.

### Actividades

1. **Selección de stack tecnológico.** Basada en constraints de Fase 0. ADR con alternativas y trade-offs.
2. **Arquitectura del sistema.** Monolito, microfrontends, serverless... Diagramas C4. Diseño DR: RTO/RPO/failover.
3. **Modelado de datos.** Entidades, relaciones, migraciones. Si hay API, contratos con OpenAPI/GraphQL.
4. **API Contracts.** API-first design con versionado explícito.
5. **Design System completo.** No solo tokens base — definir el sistema visual completo:
   - **Chromatic guide** (`design.md`): paleta de colores, tipografía, espaciado, iconografía, patrones de componentes, reglas de uso de color (ej: accent solo en CTAs primarios).
   - **Component system spec** (`COMPONENT_SYSTEM.md`): inventario de todos los componentes necesarios organizado por atomic design (atoms → molecules → organisms → templates), con props interface, variantes y reglas de portabilidad (ThemeProvider, sin i18n en atoms/molecules, domain-free).
   - **Screen design** (`STITCH_PROMPTS.md` + Stitch MCP): diseño de todas las pantallas usando herramientas de prototipado IA. Prompts detallados por flujo que incluyen el design system como contexto.
   - **Design tokens exportados** (`DESIGN_TOKENS.json`): tokens en formato consumible por código.
6. **Privacy by Design.** Consent management, audit logging, data retention desde diseño.
7. **Observability design.** Logging estructurado, métricas, tracing (OpenTelemetry).

### Añadido (AI-heavy)

8. **Arquitectura de la capa IA.** Orchestrator, tools, retrieval, memory, evaluación.
9. **Versionado de prompts y contratos.** Prompts como código, identificadores de versión, cambios auditables.
10. **Política de datos para IA.** Qué se guarda, cuánto, anonimización y borrado.

### Flujo con Claude Code

- **Sequential Thinking MCP:** Decisiones arquitectónicas multi-paso.
- **Context7 MCP:** Validar features/capacidades reales de frameworks elegidos.
- **Stitch MCP:** Diseño de pantallas con IA. Generar screens a partir de prompts que incluyen el design system completo como contexto. Revisión con agente `ux-review`.
- **CLAUDE.md QUÉ-POR QUÉ-CÓMO:** Tecnologías (QUÉ), razonamiento (POR QUÉ), patrones (CÓMO).
- **Principio de Decisión Informada:** Cada decisión de diseño (paleta, tipografía, componentes, layout) se presenta con alternativas evaluadas y tradeoffs antes de ejecutar.

### Quality Gate: Exit Criteria

- ADRs documentados para cada decisión significativa (según Tier)
- Data model validado contra flujos de la spec
- API contracts definidos
- Design system completo: chromatic guide + component spec + screen designs + tokens exportados
- Component system spec validado: props interfaces, variantes, reglas de portabilidad
- (AI-heavy) Arquitectura IA y políticas de datos IA definidas

### Artifacts

| Artifact                | Descripción                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| `docs/adr/`             | ADR-001, ADR-002...                                                      |
| `ARCHITECTURE.md`       | Diagramas C4, patrones, infraestructura                                  |
| `DATA_MODEL.md`         | Entidades, relaciones, migraciones                                       |
| `API_CONTRACTS.md`      | OpenAPI o GraphQL schema versionado                                      |
| `design.md`             | Chromatic guide: paleta, tipografía, espaciado, iconografía, patrones    |
| `COMPONENT_SYSTEM.md`   | Inventario atomic design: atoms, molecules, organisms, templates + props |
| `STITCH_PROMPTS.md`     | Prompts de diseño por flujo para generación de pantallas con Stitch MCP  |
| `DESIGN_TOKENS.json`    | Tokens exportados en formato consumible por código                       |
| `DR_PLAN.md`            | RTO/RPO/failover/backup                                                  |
| `AI_ARCHITECTURE.md`    | (AI-heavy) Orquestación, retrieval, memory, evaluación                   |
| `PROMPT_VERSIONING.md`  | (AI-heavy) Convenciones y versionado                                     |

---

## FASE 2 — PROJECT SCAFFOLDING

_De la arquitectura al proyecto base funcional con agentes y autonomía_

### Objetivo

Crear el proyecto base con tooling, CI/CD verde, configuración de agentes optimizada e infraestructura de desarrollo autónomo. Al terminar, cualquier dev (humano o IA) puede clonar y empezar en 5 minutos, los agentes pueden ejecutar en paralelo, y el proyecto puede recibir trabajo autónomo vía GitHub Actions o Remote Control.

### Actividades

1. **Inicialización del proyecto.** Boilerplate según stack. Estructura estandarizada.
2. **Tooling de desarrollo.** Linting, formatting, hooks, conventional commits.
3. **Testing framework.** Unit, integration, E2E. Coverage targets según Tier.
4. **CI/CD básico.** Build + lint + test + typecheck en PRs. Staging automático.
5. **Entornos.** Variables por entorno. Dev containers opcional.
6. **Config Claude Code.** CLAUDE.md lean, rules path-specific, sub-agentes, hooks, MCP.
7. **Templates colaboración.** PR templates, issues, CONTRIBUTING.
8. **AGENTS.md.** Reglas para agentes por fase.
9. **Comandos custom.** `.claude/commands/` con dos tipos:
   - **Orquestación:** `/rehydrate`, `/parallel-build`, `/parallel-review`, `/compound` (paralelismo y rehidratación).
   - **Scaffolding:** `/new-screen`, `/new-migration`, `/new-edge-function`, `/new-prompt` (creación rápida de artefactos con estructura y convenciones correctas desde el inicio).
10. **Infraestructura de autonomía.** GitHub Actions workflows, configuración headless, Remote Control docs.
11. **Claude Memory.** Configurar el sistema de memoria persistente de Claude Code para contexto cross-sesión: perfil del usuario, feedback acumulado, estado del proyecto, referencias externas. Complementa a `SESSION_LOG.md` y `.claude/rules/` con información que no es derivable del código.
12. **Design tokens en código.** Traducir `DESIGN_TOKENS.json` a constantes consumibles por el framework (ej: `theme.ts` para React Native). Validar que los valores coinciden con `design.md`.

### Modo Solo Builder vs Team

- **Solo builder:** minimizar burocracia (PR templates opcionales) pero mantener gates automáticos. Maximizar autonomía de agentes.
- **Equipo:** PR templates + acuerdos de review obligatorios. Agent Teams para tareas coordinadas.

### Configuración Claude Code óptima

**CLAUDE.md (<80 líneas)** con QUÉ-POR QUÉ-CÓMO:

```
# Proyecto: [nombre]
## QUÉ — Stack y estructura
[tecnologías, estructura de carpetas, convenciones de naming]

## POR QUÉ — Decisiones clave
[referencia a ADRs, constraints, trade-offs activos]

## CÓMO — Patrones obligatorios
[patrones de código, testing, error handling, imports]

## AGENTES — Reglas de orquestación
[qué tareas son paralelizables, límites, worktrees]

## SESIÓN — Protocolo de inicio
[archivos a leer, comando /rehydrate, /clear entre tareas]
```

**.claude/rules/** path-specific:

```
.claude/rules/
├── frontend.md        # Reglas React/Vue/Svelte
├── testing.md         # Convenciones de tests
├── api.md             # Contratos y validación
├── security.md        # Reglas de seguridad
├── ai-features.md     # (AI-heavy) Prompts, eval, guardrails
└── orchestration.md   # Reglas de paralelismo y agentes
```

**.claude/agents/** (sub-agentes especializados):

```
.claude/agents/
├── feature.md          # Implementación end-to-end de features
├── review.md           # Review de arquitectura, seguridad, perf, calidad
├── debug.md            # Diagnóstico y fix de bugs
├── docs.md             # Documentación y sincronización
├── ux-review.md        # Review de diseño en Stitch vs design system
├── test-writer.md      # Escribe tests desde specs
├── researcher.md       # Investiga mejores prácticas
└── security-auditor.md # Auditoría OWASP, deps
```

**.claude/commands/** (orquestación + scaffolding):

```
.claude/commands/
├── # Orquestación
├── rehydrate.md        # Warm start: carga contexto crítico
├── parallel-build.md   # Spawn N agentes en worktrees
├── parallel-review.md  # Review paralelo multi-agente
├── nightly-audit.md    # Auditoría nocturna headless
├── feature-cycle.md    # Mini-ciclo completo de feature
├── compound.md         # Persistir learnings post-feature
├── # Scaffolding (crean artefactos con estructura correcta)
├── new-screen.md       # Scaffold pantalla con hooks, i18n, types
├── new-migration.md    # Crear migración SQL timestamped
├── new-edge-function.md # Scaffold Edge Function con auth, cors, rate-limit
└── new-prompt.md       # Crear prompt versionado con PromptDefinition
```

**Hooks:** auto-format + verificación (vitest + tsc).

**MCP:** Context7, GitHub, Playwright (según proyecto).

### Comandos Custom — Detalle

**`/rehydrate` — Warm Start automatizado:**

```markdown
# /rehydrate

## Instrucciones

Lee los siguientes archivos en orden y resume el estado actual del proyecto:

1. PROJECT_PROFILE.md (tier, tipo, constraints)
2. CLAUDE.md (patrones, reglas activas)
3. ARCHITECTURE.md (stack, decisiones)
4. Último SESSION_LOG.md (estado del trabajo)
5. Último RETROSPECTIVE.md (learnings recientes)
6. (Si AI-heavy) AI_SUCCESS_METRICS.md + último EVAL_REPORT.md

Tras leer, confirma:

- Tier activo y gates obligatorios
- Feature/tarea en curso o próxima
- Patrones o anti-patrones recientes relevantes
- Bloqueos conocidos

NO empieces a implementar. Solo confirma comprensión del contexto.
```

**`/parallel-build` — Construcción paralela:**

```markdown
# /parallel-build $FEATURE_NAME $NUM_AGENTS

## Instrucciones

1. Lee la spec de la feature: docs/specs/$FEATURE_NAME.md
2. Crea $NUM_AGENTS worktrees:
   - git worktree add .claude/worktrees/$FEATURE_NAME-N -b $FEATURE_NAME-N
   - Copia .env a cada worktree
3. Lanza $NUM_AGENTS sub-agentes con Task tool (run_in_background: true):
   - Cada agente recibe: spec + CLAUDE.md + rules relevantes
   - Cada agente trabaja en su worktree aislado
   - Cada agente escribe RESULTS.md al terminar
4. Monitorea progreso via .agent-status/
5. Cuando todos terminen, presenta resumen comparativo
```

**`/parallel-review` — Review multi-agente:**

```markdown
# /parallel-review $BRANCH_OR_PR

## Instrucciones

Lanza sub-agentes de review en paralelo:

1. security-reviewer: OWASP, deps, secrets, injection
2. perf-reviewer: complejidad, bundle size, queries, lazy loading
3. a11y-reviewer: WCAG 2.1 AA, semantic HTML, ARIA, keyboard nav
4. logic-reviewer: edge cases, error handling, tipos, estados

Cada reviewer escribe findings en formato:

- SEVERITY: critical/warning/info
- FILE: path
- LINE: número
- FINDING: descripción
- SUGGESTION: fix propuesto

Consolida findings ordenados por severidad.
```

### Infraestructura de Autonomía

**GitHub Actions — Workflow base para PRs:**

```yaml
# .github/workflows/claude-pr-review.yml
name: Claude PR Review
on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]

jobs:
  claude-review:
    if: |
      github.event_name == 'pull_request' ||
      contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: "--allowedTools Read Glob Grep"
```

**GitHub Actions — Implementación por issues:**

```yaml
# .github/workflows/claude-implement.yml
name: Claude Implement
on:
  issues:
    types: [opened, edited]
  issue_comment:
    types: [created]

jobs:
  implement:
    if: contains(github.event.comment.body, '@claude implement')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Implement the feature described in this issue following CLAUDE.md guidelines. Create a PR with the changes."
```

**GitHub Actions — Auditoría nocturna:**

```yaml
# .github/workflows/claude-nightly.yml
name: Claude Nightly Audit
on:
  schedule:
    - cron: "0 3 * * *" # 3 AM UTC
  workflow_dispatch:

jobs:
  nightly-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Run nightly audit:
            1. Check for dependency vulnerabilities (npm audit / pip audit)
            2. Review any open TODOs or FIXMEs added in last 24h
            3. Verify test coverage hasn't dropped
            4. Generate summary in docs/audits/YYYY-MM-DD.md
          claude_args: "--max-turns 20 --max-budget-usd 2.00"
```

**Remote Control — Protocolo:**

```
## Inicio de sesión remota
1. En terminal local: `claude remote-control` (o `/rc` dentro de sesión)
2. Escanear QR con Claude App (iOS/Android)
3. Verificar que aparece sesión con punto verde en claude.ai/code
4. Si el portátil duerme, la sesión se reconecta automáticamente al despertar

## Cuándo usar Remote Control
- Sesiones de implementación > 30 minutos
- Ejecución de /parallel-build (monitorear desde móvil)
- Auditorías nocturnas que requieren supervisión puntual
- Cualquier tarea donde quieras desacoplarte del escritorio

## Para activar por defecto
/config → Enable Remote Control for all sessions → true
```

### Añadido (AI-heavy)

- `prompts/` para prompts versionados
- `eval/` para golden prompts y harness mínimo
- logging base IA (latencia/coste/fallback) desde el inicio

### Quality Gate: Exit Criteria

- CI/CD verde con build + lint + test + typecheck
- README con setup en un comando
- CLAUDE.md validado con primera sesión
- Branching strategy documentada (trunk-based + flags)
- Comandos custom funcionales (orquestación + scaffolding)
- GitHub Actions workflows configurados (PR review + nightly audit mínimo)
- Remote Control documentado en RUNBOOK.md
- Design tokens implementados en código (`theme.ts` o equivalente) y validados contra `design.md`
- Claude Memory configurada con perfil de usuario, feedback y estado del proyecto
- Comandos de scaffolding (`/new-screen`, `/new-migration`, etc.) validados
- (AI-heavy) `prompts/` + `eval/` + logging IA base

### Artifacts

| Artifact              | Descripción                                                          |
| --------------------- | -------------------------------------------------------------------- |
| Repo inicializado     | Proyecto con tooling, pipeline y agentes                             |
| `CLAUDE.md`           | Instrucciones principales para Claude Code                           |
| `.claude/rules/`      | Reglas path-specific (components, types, supabase-functions, prompts) |
| `.claude/agents/`     | Sub-agentes especializados (feature, review, debug, docs, ux-review) |
| `.claude/commands/`   | Comandos de orquestación + scaffolding                               |
| `theme.ts`            | Design tokens implementados en código (validados vs design.md)       |
| Claude Memory         | Perfil de usuario, feedback, estado del proyecto (cross-sesión)      |
| `AGENTS.md`           | Reglas de agentes por fase                                           |
| `CONTRIBUTING.md`     | Convenciones                                                         |
| `.github/workflows/`  | PR review + implement + nightly audit                                |
| `RUNBOOK.md`          | Incluye protocolo Remote Control                                     |
| `prompts/`            | (AI-heavy) Prompts como código                                       |
| `eval/`               | (AI-heavy) Golden prompts + harness                                  |

### Starter Kit — Template Repository

Para no repetir este scaffolding en cada proyecto, mantener un **GitHub template repository** con la estructura base:

```
template-agentic-project/
├── .claude/
│   ├── rules/
│   │   ├── frontend.md
│   │   ├── testing.md
│   │   ├── api.md
│   │   ├── security.md
│   │   └── orchestration.md
│   ├── agents/
│   │   ├── test-writer.md
│   │   ├── code-reviewer.md
│   │   ├── researcher.md
│   │   ├── doc-writer.md
│   │   └── security-auditor.md
│   ├── commands/
│   │   ├── rehydrate.md
│   │   ├── parallel-build.md
│   │   ├── parallel-review.md
│   │   ├── nightly-audit.md
│   │   ├── feature-cycle.md
│   │   └── compound.md
│   └── worktrees/           # .gitignore'd
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── claude-pr-review.yml
│   │   ├── claude-implement.yml
│   │   └── claude-nightly.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── feature.md
│   │   └── bug.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── adr/
│   ├── specs/
│   └── audits/
├── CLAUDE.md                  # Template con placeholders
├── PROJECT_PROFILE.md         # Template
├── ARCHITECTURE.md            # Template
├── AGENTS.md                  # Template con roles por fase
├── CONTRIBUTING.md
├── SESSION_LOG.md             # Template
├── .gitignore                 # Incluye .claude/worktrees/
└── README.md                  # Setup en un comando
```

Cada nuevo proyecto: `Use this template` → rellenar `PROJECT_PROFILE.md` → ajustar `CLAUDE.md` → listo para Fase 0.

---

## FASE 3 — CORE FOUNDATION

_Infraestructura mínima viable para la primera feature_

### Objetivo

Construir la infraestructura mínima para la primera feature. Aplicar YAGNI.

> **Principio YAGNI aplicado:** No construir un core monolítico antes de la primera feature. Construir el mínimo core necesario y expandir por iteración.

### Actividades

1. **Auth (si aplica).**
2. **Routing.**
3. **State management mínimo.**
4. **API client layer.**
5. **Layout system.**
6. **Observability.**
7. **Feature flags.**

### Flujo con Claude Code

- Worktrees paralelos para módulos independientes (ej: auth en un worktree, layout en otro)
- TDD desde el core
- Hook Stop para verificación automática
- `/rehydrate` al inicio de cada sesión

### Quality Gate: Exit Criteria

- Primera feature implementable sin bloqueos
- Observability funcionando
- Tests del core pasando (según Tier)
- Feature flag system operativo (Tier A/B)
- Worktrees limpios (sin ramas huérfanas)
- SESSION_LOG.md actualizado con estado del milestone
- `/compound` ejecutado tras cada milestone (IMPROVEMENT_LOG actualizado)
- DOCS consultados y alineados con implementación
- Consulta obligatoria antes de implementar: COMPONENT_SYSTEM.md (componentes), DATA_MODEL.md (datos), design.md (UI)

### Artifacts

| Artifact            | Descripción                                     |
| ------------------- | ----------------------------------------------- |
| Core modules        | Auth/routing/state/api/layout (solo necesarios) |
| Observability setup | OTel, logs, health                              |
| Feature flag config | Flags base                                      |
| Core tests          | Tests con cobertura target                      |

---

## FASE 3.5 — COGNITIVE CORE DESIGN (SI AI-HEAVY)

_Infraestructura cognitiva mínima viable para la primera feature IA_

### Objetivo

Definir e implementar la capa cognitiva mínima: fronteras entre estado determinista, conocimiento semántico y contexto efímero.

> **YAGNI para IA:** no construir "el cerebro definitivo"; construir lo mínimo para una feature IA concreta y expandir.

### Actividades

1. **Modelo de información.** DB vs embeddings vs contexto.
2. **Retrieval strategy.** Top-k + metadata + re-ranking (si aplica).
3. **Prompts como código.** Convención y ownership.
4. **Cost/latency budget.** Límite por request + fallback.
5. **Seguridad IA base.** PII redaction, input validation, guardrails.
6. **Observabilidad IA base.** latencia/coste/fallback.
7. **Harness de evaluación mínimo.** Golden prompts iniciales.

### Flujo con Claude Code

- Plan Mode estricto
- Sub-agente ai-architect
- Cross-model review para endpoints IA

### Quality Gate: Exit Criteria

- Primera feature IA implementable sin bloqueos
- Prompts versionados en repo
- Logs IA mínimos funcionando
- Golden prompts ejecutables

### Artifacts

| Artifact                    | Descripción                        |
| --------------------------- | ---------------------------------- |
| `COGNITIVE_ARCHITECTURE.md` | Memory/retrieval/budgets/seguridad |
| `prompts/`                  | Prompts versionados                |
| `eval/`                     | Golden prompts + harness           |
| `AI_RUNBOOK.md`             | Debugging, fallbacks, kill-switch  |

---

## FASE 4 — FEATURE DEVELOPMENT

_Ciclos Spec-Driven con paralelismo integrado: Spec → Plan → Build+Review paralelo → Merge → Compound_

### Objetivo

Implementar features en ciclos iterativos usando Spec-Driven Development + TDD + Compound Engineering + orquestación multi-agente. Discovery en paralelo.

### Regla: Complejidad adaptativa por feature

| Tipo de feature              | Ciclo                                | Paralelismo                                                       |
| ---------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| Core / riesgo alto (Tier A)  | Ciclo completo + N-of-1 competitivo  | Agent Teams: 2-3 implementaciones paralelas + merge del mejor     |
| Producto normal (Tier B)     | Ciclo completo con spec ligera       | Sub-agentes: implementación + tests + docs en worktrees paralelos |
| UI menor / refactor (Tier C) | Plan + tests mínimos + review rápida | Sesión única secuencial                                           |

### Mini-ciclo por feature (v1.1 — con paralelismo)

**Distribución de esfuerzo: PLAN 35% → BUILD+REVIEW 50% (en paralelo) → MERGE+COMPOUND 15%**

**1. SPEC (dentro del 35% de Plan)**

- Spec con acceptance criteria y estados
- EARS/Gherkin para evitar ambigüedad
- Clasificar feature por tipo (ver tabla arriba) para decidir nivel de paralelismo

**2. PLAN (35%)**

- Plan Mode / opusplan
- Plan escrito en archivo: `docs/specs/feature-x.md`
- Tareas <2h, etiquetadas como `parallelizable: true/false`
- Si Tier A: definir qué tareas van a N-of-1 competitivo
- Si Tier B: identificar tareas que van a sub-agentes paralelos

**2.5. DESIGN GATE (pre-build, obligatorio para features con UI)**

Antes de escribir cualquier componente, el agente consulta el documento de diseño del proyecto
(típicamente `DOCS/design/design.md` o equivalente) y verifica:

- Tokens de color y espaciado correctos (`theme.ts` del proyecto)
- Sistema de elevación/sombras (bordes, shadows, glass — según el design system activo)
- Reglas de color de acento (cuándo y dónde se usa)
- Sistema de iconografía (librería, stroke weight, variantes permitidas)
- Componentes existentes reutilizables (consultar `COMPONENT_SYSTEM.md` o equivalente antes de crear nuevos)

El design doc específico de cada proyecto define los checks concretos (ver `.claude/rules/` del proyecto).
Este gate es **obligatorio** en Tier A y Tier B con UI. En Tier C (refactor sin cambios visuales) es opcional.
Si no existe design doc en el proyecto → crearlo es prerequisito antes de Phase 4.

**3. BUILD + REVIEW EN PARALELO (50%)**

Este es el cambio principal respecto a v1.0. En lugar de TDD secuencial → review secuencial, BUILD y REVIEW operan como streams paralelos:

**Stream A — Implementación (worktree principal o múltiples):**

- Rojo → Verde → Refactor (TDD)
- Si Tier A con N-of-1: `/parallel-build feature-x 3` → 3 agentes implementan la misma spec
- Si Tier B: implementación en worktree principal

**Stream B — Review continuo (sub-agentes en paralelo):**

- Mientras Stream A avanza, sub-agentes de review operan en paralelo:
  - `security-reviewer`: revisa cada commit/cambio significativo
  - `test-writer`: escribe tests adicionales basándose en la spec (no en la implementación)
  - `doc-writer`: actualiza docs/changelog basándose en la spec
- `/parallel-review` al completar implementación para review final consolidado

**Stream C — Supervisión humana:**

- Review de arquitectura y alineación con roadmap
- Cross-model review para código crítico (Opus para revisar output de Sonnet)
- Aprobación final de merge

**Coordinación de streams (Tier A con Agent Teams):**

```
Orchestrator (tu sesión principal)
├── Teammate 1: Implementación en worktree-impl
├── Teammate 2: Tests independientes en worktree-test
├── Teammate 3: Security review en worktree-review
└── Teammate 4: Docs en worktree-docs

Comunicación: Task list compartida (Ctrl+T)
Monitoreo: Shift+Up/Down para navegar teammates
```

**Coordinación de streams (Tier B con sub-agentes):**

```
Tu sesión principal: Implementación TDD
├── Background Task 1: test-writer (worktree aislado)
├── Background Task 2: doc-writer (worktree aislado)
└── Al completar: /parallel-review para review consolidado
```

**Background Stream Pattern (uso cotidiano)**

Modelo mental: tu sesión principal en consola es el hilo principal. Los background agents son workers — tareas independientes, disjuntas en archivos.

Cuándo activar:
- Estás implementando feature X y hay tareas secundarias que no bloquean tu flujo
- Las tareas secundarias no tocan los mismos archivos que tu feature activa

Tareas seguras para background (sin riesgo de conflicto):
- Actualizar archivos de localización (i18n) basados en spec ya escrita
- Sincronizar documentación post-feature (`DOCS/`)
- Auditoría de diseño (`/review-ui` — solo lectura)
- Lint + typecheck pass sobre rama estable
- Escritura de tests adicionales en directorio de tests aislado

Tareas **inseguras** para background (riesgo de conflicto):
- Modificar store, hooks o componentes compartidos que estás editando tú en paralelo
- Cambiar archivos de configuración global concurrentemente (theme, types, config)
- Dos agents editando el mismo componente o screen

Regla práctica: si el agente background puede terminar su tarea sin saber qué estás escribiendo tú → es seguro paralizar.

**4. MERGE + COMPOUND (15%)**

- Si N-of-1: comparar `RESULTS.md` de cada agente, elegir mejor implementación, merge
- Si sub-agentes: merge de worktrees (tests + docs + implementación)
- Resolución de conflictos (humano)
- Verificación final: CI verde
- **Compound Engineering:**
  - Registrar learnings en `DOCS/methodology/LEARNINGS.md` (errores corregidos, patrones, anti-patrones — persisten entre proyectos)
  - Actualizar CLAUDE.md si se descubrieron reglas aplicables al proyecto actual
  - Actualizar `.claude/rules/` si se descubrieron patrones/anti-patrones
  - Si un error ocurrió 2 veces → nueva regla
  - Si un patrón aceleró el trabajo → nuevo template
  - Actualizar `SESSION_LOG.md` con resumen del milestone (volátil — puede cambiar entre sesiones)
  - Limpiar worktrees: `git worktree prune`

### Discovery continuo

Weekly customer touchpoints, dual-track.

### Cooldown entre batches

1–2 semanas para tech debt, DX, investigación.

### Supervisión remota durante Build

Para features que requieren builds largos (>30 min), activar Remote Control:

1. Iniciar sesión: `claude remote-control`
2. Lanzar `/parallel-build` o build largo
3. Monitorear desde móvil (Claude App)
4. Aprobar/rechazar cambios desde el móvil
5. Redirigir trabajo si hay problemas

### Autonomous PR Mode ("leave-home mode")

Flujo para cuando dejas a Claude trabajar solo y revisas el resultado después.

**Cuándo usar:**
- Feature bien definida en los docs de arquitectura del proyecto (requirements, data model, API contracts)
- No requiere decisiones arquitectónicas a mitad de implementación
- CI configurado (lint + typecheck mínimo) para verificación automática

**Fuente de verdad para el agente: los docs existentes**

El agente no necesita un archivo de spec separado. Lee directamente:
- `REQUIREMENTS.md` — qué hay que construir y por qué
- `DATA_MODEL.md` — tablas, columnas, constraints, triggers
- `API_CONTRACTS.md` — endpoints existentes o que hay que crear
- `COMPONENT_SYSTEM.md` — componentes reutilizables
- `.claude/rules/design-gate.md` — reglas de diseño del proyecto

Si durante la implementación encuentra gaps o ambigüedades en estos docs, los documenta en la sección "Doc gaps found" del PR — así la documentación se mejora orgánicamente con cada PR.

**No crear archivos de spec separados** (`docs/specs/feat-xxx.md`). El issue tracker (GitHub Issues, Linear) es el lugar correcto para tareas de implementación pendientes, no el repo. En el repo solo van ADRs y documentación de referencia permanente.

**Flujo:**

```
1. Tú (antes de irte)
   - Identifica el requisito a implementar (ej. S3 de REQUIREMENTS.md)
   - Indica a Claude: "implementa S3 en modo autónomo, abre PR al terminar"
   - O usa el comando: /auto-pr S3

2. Claude (autónomo)
   a. Lee spec + docs obligatorios del proyecto (design, components, data model)
   b. Crea rama: git checkout -b feat/{name}
   c. Ejecuta Design Gate si hay UI
   d. Implementa con ciclo Tier B (TDD mínimo)
   e. Corre CI gates: lint + typecheck
      - Si falla: corrige y reintenta una vez
      - Si persiste: continúa y documenta en PR con flag ⚠️
   f. Abre PR via gh pr create con body estándar:
      Qué hace / Por qué / Design notes / Test plan / Riesgos / Preguntas para revisión
   g. Actualiza SESSION_LOG.md con link al PR y estado

3. Tú (cuando vuelves)
   - Revisa PR en GitHub: descripción + preguntas del agente
   - Aprueba / solicita cambios / merge
```

**Prerequisitos de setup (one-time, por proyecto):**

Antes de lanzar el primer agente autónomo con `isolation: "worktree"`, verificar:

1. **`.claude/settings.json` debe estar commiteado al repo.** Los worktrees son checkouts de git — solo ven archivos commiteados. `settings.local.json` está en `.gitignore` y es invisible para ellos. El archivo debe incluir permisos blanket para que los agentes puedan operar sin bloqueos:
   ```json
   { "permissions": { "allow": ["Bash", "Write", "Edit"] } }
   ```
   Permisos pattern-específicos (`"Bash(git:*)"`) no cubren todos los comandos que los agentes necesitan (ej. `cd /path && git ...`). Usar permisos blanket.

2. **Git push en Windows requiere auth explícita.** El Git Credential Manager de Windows muestra un diálogo UI para credenciales — esto bloquea agentes no-interactivos indefinidamente. Usar el patrón con `gh auth token`:
   ```bash
   GH_TOKEN=$(gh auth token) && git push https://x-access-token:${GH_TOKEN}@github.com/OWNER/REPO.git BRANCH
   ```
   Incluir este patrón siempre en los prompts de agentes auto-pr (ya está en el comando `/auto-pr`).

**Límites del modo autónomo (invariables):**
- **NO hace merge** — siempre decisión humana
- **NO toma decisiones arquitectónicas** — si encuentra ambigüedad en la spec, la documenta en el PR y para
- **NO modifica infraestructura compartida** sin aprobación explícita en la spec
- Si CI falla 2 veces → abre PR con título `⚠️ CI failing: feat/{name}` para revisión humana

**Template PR body (el agente lo genera automáticamente):**

```markdown
## Qué hace
[1-3 bullet points]

## Por qué
[motivación o referencia a la spec]

## Design notes
[checks del Design Gate: componentes y tokens usados]

## Test plan
- [ ] Acceptance criteria cumplidos
- [ ] Edge cases considerados

## Riesgos / limitaciones
[qué no se pudo validar sin dispositivo físico o decisión humana pendiente]

## Preguntas para revisión
[ambigüedades encontradas en la spec durante la implementación]
```

### Quality Gate: Exit Criteria (por feature)

- Acceptance criteria cumplidos
- Tests pasando (incluidos los del sub-agente test-writer)
- PR revisado (humano + sub-agentes)
- CLAUDE.md actualizado (compound)
- Docs actualizadas
- Worktrees limpiados
- (AI-heavy) casos de evaluación actualizados
- (Tier A) Todas las implementaciones N-of-1 evaluadas, justificación de elección documentada

### Artifacts (por feature)

| Artifact                    | Descripción                     |
| --------------------------- | ------------------------------- |
| `docs/specs/feature-x.md`   | Spec de la feature              |
| Feature implementada        | Código + tests                  |
| PR documentado              | Qué/por qué, prueba, riesgo     |
| `RESULTS.md` (si N-of-1)    | Comparativa de implementaciones |
| CLAUDE.md actualizado       | Learnings                       |
| `SESSION_LOG.md`            | Estado del trabajo              |
| `eval/cases/feature-x.json` | (AI-heavy) casos de evaluación  |

---

## FASE 5 — INTEGRATION & HARDENING

_Testing E2E, auditorías de seguridad/performance/a11y_

### Objetivo

Auditoría final pre-producción. Aquí el paralelismo de agentes brilla: cada auditoría es independiente y puede ejecutarse simultáneamente.

### Actividades (paralelizables con sub-agentes)

1. E2E Playwright
2. Security audit (OWASP, deps, SAST, DAST si aplica)
3. Performance audit (Lighthouse CI)
4. Accessibility audit (WCAG 2.1 AA)
5. Edge cases (offline, race conditions)
6. DR testing (si Tier A)
7. Compliance verification
8. Load testing (si aplica)

**Ejecución paralela recomendada:**

```
/parallel-review pero a nivel de proyecto completo:
├── Agent 1: E2E Playwright (worktree aislado)
├── Agent 2: Security audit OWASP + deps
├── Agent 3: Performance Lighthouse + bundle analysis
├── Agent 4: Accessibility WCAG scan
└── Consolidación: AUDIT_REPORT.md unificado
```

### Añadido (AI-heavy)

9. Robustez ante adversarios (prompt injection)
10. Consistency multi-turn
11. PII leakage checks
12. Golden eval regression

### Automatización con GitHub Actions

Las auditorías de Fase 5 pueden ejecutarse como workflow nocturno o on-demand:

```yaml
# .github/workflows/claude-hardening.yml
name: Claude Hardening Audit
on:
  workflow_dispatch:
    inputs:
      audit_scope:
        description: "Scope: full, security, perf, a11y"
        default: "full"

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Run ${{ inputs.audit_scope }} audit. Generate AUDIT_REPORT.md with findings by severity."
```

### Quality Gate: Exit Criteria

- E2E OK
- 0 vuln críticas/altas
- Lighthouse > 90 (según Tier)
- WCAG verificada (según Tier)
- DR test OK (Tier A)
- (AI-heavy) eval sin regresiones severas

### Artifacts

| Artifact             | Descripción                     |
| -------------------- | ------------------------------- |
| `AUDIT_REPORT.md`    | Reporte consolidado             |
| E2E suite            | Playwright                      |
| Security findings    | Remediaciones                   |
| Compliance checklist | Evidencias                      |
| DR test results      | Resultados                      |
| `EVAL_REPORT.md`     | (AI-heavy) evaluación/regresión |

---

## FASE 6 — DEPLOYMENT & RELEASE

_Progressive delivery con feature flags_

### Objetivo

Decouple deployment de release. Progressive delivery.

### Actividades

1. Deploy detrás de flag → canary → rollout → GA
2. Monitoring + alertas
3. Analytics/telemetría
4. Release notes/changelog
5. Rollback plan + kill switch
6. Incident response plan
7. Store submission (si mobile)

### Añadido (AI-heavy)

8. Flags por modelo/proveedor
9. Kill-switch IA (modo degradado)
10. Tagging de versión de prompts + eval en release

### Monitoreo remoto post-deploy

Usar Remote Control para monitorear el deploy desde cualquier dispositivo:

- Sesión de monitoring con Claude que observa logs y métricas
- Alertas vía mobile si hay anomalías
- Rollback desde el móvil si es necesario

### Quality Gate: Exit Criteria

- Producción detrás de flags
- Dashboards y alertas verificados
- Rollback probado
- Runbook/incident plan listo
- (AI-heavy) kill-switch probado + prompts versionados en release

### Artifacts

| Artifact               | Descripción                    |
| ---------------------- | ------------------------------ |
| `RUNBOOK.md`           | Deploy/rollback/incidentes/RC  |
| `CHANGELOG.md`         | Release notes                  |
| SLO Dashboard          | Métricas                       |
| `INCIDENT_RESPONSE.md` | Plan de respuesta              |
| Feature flags          | Config                         |
| `AI_RELEASE_NOTES.md`  | (AI-heavy) modelo/prompts/eval |

---

## FASE 7 — POST-LAUNCH & ITERATION

_Métricas, feedback, tech debt, retrospectiva_

### Objetivo

Ciclo continuo de mejora del producto y del framework.

### Actividades

1. Monitoreo KPIs + DORA
2. Feedback loop
3. Bug triage + hotfix
4. Tech debt register
5. DX metrics (incluyendo métricas de agentes: tokens consumidos, tiempo de worktree, tasa de éxito N-of-1)
6. Iteration loop (volver a fases según tipo de cambio)
7. Retrospectiva del framework
8. Revisión de estrategia de agentes (¿el nivel de paralelismo es adecuado? ¿los costes de tokens son sostenibles?)

### Automatización continua

**GitHub Actions como "developer on call" nocturno:**

```yaml
# Ejecutar cada noche:
# - Review de issues abiertos
# - Triage de bugs por severidad
# - Actualización de docs si hay commits sin documentar
# - Reporte de tech debt acumulada
# - Verificación de test coverage
```

**Comando desde móvil vía GitHub Issues:**

Crear un issue con título `@claude [tarea]` para que el workflow de implementación lo ejecute automáticamente. Esto permite enviar trabajo a Claude Code desde cualquier dispositivo con acceso a GitHub (web o app móvil).

### Añadido (AI-heavy)

8. Drift + calidad de respuestas
9. Cost governance
10. Retención/log policy revalidada

### Quality Gate: Exit Criteria

No aplica (fase continua), pero cada retrospectiva produce:

- `RETROSPECTIVE.md`
- Framework actualizado con evidencia
- Tech debt register actualizado
- DORA vs targets revisadas
- Estrategia de agentes revisada (coste/beneficio)
- (AI-heavy) métricas IA revisadas

### Artifacts

| Artifact                  | Descripción                          |
| ------------------------- | ------------------------------------ |
| `RETROSPECTIVE.md`        | Learnings y action items             |
| Tech debt register        | Deuda priorizada                     |
| DORA dashboard            | Métricas                             |
| Agent metrics             | Tokens, tiempo, éxito por estrategia |
| Knowledge base            | Documentación acumulada              |
| Framework v(n+1)          | Este documento actualizado           |
| `AI_METRICS_DASHBOARD.md` | (AI-heavy) latencia/coste/calidad    |

---

## Capas Transversales

Operan en TODAS las fases.

### 1. Context Isolation

- `.claude/rules/` path-specific
- sub-agentes con tools restringidos
- worktrees aislados
- `/clear` entre tareas

### 2. Quality Gates

Gates por fase, automatizados en CI cuando sea posible.

> **Por Tier:** Tier A = hard gates, Tier B = mixto, Tier C = soft.

### 3. Security Shift-Left

Seguridad integrada desde Fase 0 a Fase 6.

### 4. Legal/Compliance (GDPR)

DPIA, privacy by design, verificación y respuesta a incidentes.

### 5. Continuous Discovery

Discovery continuo durante delivery.

### 6. Documentation as Code

Todo versionado en git junto al código.

### 7. AI Agent Rules (AGENTS.md)

Reglas globales y por fase, con ejemplos.

### 8. AI Evaluation Layer (Transversal)

- golden dataset (`eval/`)
- regression checks por feature/release
- observabilidad IA (latencia/coste/fallback)
- seguridad IA (PII redaction, prompt injection checklist)

### 9. Evolution Strategy (Versionado del Framework)

El framework se mejora con evidencia, no con impulsos.

- **SemVer:** MAJOR/MINOR/PATCH
- Cambios tras retrospectiva o fricción repetida
- Registrar en `FRAMEWORK_CHANGELOG.md`:
  - contexto
  - problema observado
  - cambio aplicado
  - impacto esperado

### 10. Context Persistence & Rehydration

Garantiza continuidad cognitiva entre sesiones humanas y sesiones de agentes IA, evitando pérdida de decisiones, patrones y contexto crítico.

#### 10.1 Tipos de contexto

**A. Contexto Estratégico (largo plazo)**  
Decisiones estructurales, principios del proyecto, trade-offs relevantes, límites del sistema.

Vive en: `ARCHITECTURE.md`, `docs/adr/`, `FRAMEWORK_CHANGELOG.md`, `RISK_MATRIX.md`

**B. Contexto Operativo (medio plazo)**  
Convenciones, restricciones prácticas, patrones exitosos, anti-patrones, errores recurrentes.

Vive en: `CLAUDE.md` (<80 líneas), `.claude/rules/`, `AGENTS.md`, `CONTRIBUTING.md`

**C. Contexto Táctico (corto plazo)**  
Estado actual del trabajo, próximos pasos, bloqueos, hipótesis en validación.

Vive en: `SESSION_LOG.md`, `TODO.md`/`TASKS.md`, PRs/Issues

> **Regla de oro:** El contexto táctico no debe volverse permanente. O se promueve a operativo/estratégico, o se elimina.

#### 10.2 Cuándo persistir contexto

- **Al cerrar una feature** (Fase 4 → COMPOUND)
- **Tras un incidente** (Fase 6 → postmortem)
- **Tras una retrospectiva** (Fase 7)
- **Cuando un error se repite 2 veces** (promociona a regla)
- **Cuando un patrón acelera el trabajo** (promociona a regla/plantilla)
- **Cuando hay una decisión que no debe reabrirse** (promociona a ADR)

#### 10.3 Reglas de formalización

- Error 2 veces → regla (CLAUDE.md o `.claude/rules/`)
- Decisión con impacto estructural → ADR
- Patrón repetido que acelera → plantilla (templates/)
- Hipótesis que cambia/falla → actualizar SPEC.md
- Workaround temporal permanente → formalizar o eliminar

#### 10.4 Protocolo de compliance en fases tempranas (0-3)

En las primeras fases de un proyecto, el agente IA debe:

1. **Leer AI_DRIVEN_DEVELOPMENT.md completo** en la primera sesión de cada fase para internalizar el flujo, artefactos requeridos y quality gates.
2. **Verificar artefactos pendientes** al inicio de cada sesión usando `/rehydrate`.
3. **Ejecutar `/compound` obligatoriamente** tras completar cada milestone — esto es un hard gate, no una sugerencia.
4. **Consultar DOCS antes de implementar:** COMPONENT_SYSTEM.md (componentes), DATA_MODEL.md (datos), design.md (UI), ARCHITECTURE.md (patrones).
5. **No avanzar de milestone** sin SESSION_LOG.md actualizado, IMPROVEMENT_LOG con deuda técnica del milestone, y LEARNINGS.md con los learnings del milestone.

> **Regla:** La deuda metodológica se acumula más rápido que la deuda técnica y es más difícil de pagar. Un LEARNINGS.md vacío tras 6 milestones no significa que no hubo errores — significa que se perdieron. SESSION_LOG.md es volátil (estado del trabajo); LEARNINGS.md es permanente (lecciones para futuros proyectos). No confundir los dos.

#### 10.5 Protocolo de rehidratación al iniciar sesión

**Automatizado con `/rehydrate`:**

El comando custom `/rehydrate` ejecuta la carga de contexto automáticamente. Para sesiones manuales, el mínimo es:

1. Leer: `PROJECT_PROFILE.md` → `CLAUDE.md` → `ARCHITECTURE.md` → último `SESSION_LOG.md`
2. Adjuntar archivos relevantes con `@path`
3. `/clear` antes de cambiar de fase o tarea
4. Si AI-heavy: `AI_SUCCESS_METRICS.md` + `EVAL_REPORT.md` + `AI_RUNBOOK.md`
5. Si hay PR/issue activo: leer descripción + checklist

#### 10.6 Límites de crecimiento y limpieza

- `CLAUDE.md` < **80 líneas**. Si crece → mover a `.claude/rules/`
- `.claude/rules/` debe ser **path-specific** y **ejemplificada**
- `SESSION_LOG.md` se **rota** por sprint/feature y se resume en retrospectiva
- Worktrees se limpian al cerrar cada feature: `git worktree prune`
- El conocimiento temporal que no se usa en 2 retrospectivas → se elimina o archiva

### 11. Multi-Agent Orchestration (NUEVA)

Define cómo, cuándo y con qué nivel de paralelismo se usan múltiples agentes IA. Es la capa que convierte a un solo developer en un equipo virtual.

#### 11.1 Niveles de orquestación

**Nivel 1 — Sesión única (Tier C default)**  
Un solo Claude Code interactivo. Máxima simplicidad, mínimo overhead. Usar para prototipos, experimentos, features triviales.

**Nivel 2 — Sub-agentes con worktree isolation (Tier B default)**  
Un agente orquestador (tu sesión principal) delega tareas a sub-agentes que trabajan en worktrees aislados. Los sub-agentes no se comunican entre sí; reportan resultados al orquestador.

Casos de uso:

- Implementación + tests independientes en paralelo
- Implementación + documentación en paralelo
- Review multi-perspectiva (seguridad + perf + a11y)

Setup:

```
# En el sub-agente, añadir al frontmatter:
isolation: worktree

# O pedir directamente:
"Usa worktrees para tus agentes"
```

**Nivel 3 — Agent Teams (Tier A para features complejas)**  
Teammates con comunicación bidireccional. Pueden compartir hallazgos, cuestionar decisiones de otros teammates y coordinarse vía task list compartida.

Casos de uso:

- Refactors cross-cutting (API + frontend + tests + docs)
- Features que tocan múltiples dominios
- Investigación + implementación coordinada

Setup:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
# Iniciar equipo desde tu sesión:
"Crea un equipo con 3 teammates: implementador, tester, reviewer"
```

Controles:

- `Shift+Up/Down`: navegar entre teammates
- `Ctrl+T`: ver task list compartida
- `Enter`: ver sesión de un teammate
- `Escape`: interrumpir teammate

**Nivel 4 — N-of-1 competitivo (Tier A para decisiones críticas)**  
Múltiples agentes implementan la misma spec de forma independiente. Se comparan resultados y se elige la mejor solución. Explota el no-determinismo de los LLM como ventaja.

Casos de uso:

- Algoritmos complejos donde hay múltiples soluciones válidas
- Features donde la calidad del código importa más que la velocidad
- Decisiones de diseño donde quieres explorar alternativas

Setup: `/parallel-build feature-x 3`

#### 11.2 Reglas de orquestación

1. **Nunca paralelizar lo que depende secuencialmente.** Si el agente B necesita el output del agente A, no son paralelizables.
2. **El plan siempre es secuencial y humano-supervisado.** El paralelismo empieza después del plan, nunca antes.
3. **Cada worktree debe tener su propio `.env` funcional.**
4. **Añadir `.claude/worktrees/` a `.gitignore`.**
5. **Limpiar worktrees al cerrar cada feature.** `git worktree prune` + eliminar ramas merged.
6. **Monitorizar costes.** N agentes paralelos = N × tokens. Establecer `--max-budget-usd` por agente.
7. **El merge es siempre humano.** Los agentes proponen, el humano decide qué merge.
8. **`.claude/settings.json` debe estar commiteado.** Los worktrees solo ven archivos en git. `settings.local.json` no existe en el worktree — sin este archivo el agente queda bloqueado en el primer `Bash`/`Write`/`Edit`. Ver prerequisitos en §10 Autonomous PR Mode.
9. **Git push no-interactivo en Windows.** Usar `GH_TOKEN=$(gh auth token) && git push https://x-access-token:${GH_TOKEN}@github.com/OWNER/REPO.git BRANCH`. Plain `git push` activa el Git Credential Manager (UI dialog) y bloquea el agente.

#### 11.3 Anti-patrones de paralelismo

- **"Más agentes = más rápido" falacia.** 3 agentes con mala spec producen 3 soluciones malas.
- **Paralelizar sin plan.** Si no hay spec escrita y plan aprobado, no lanzar agentes paralelos.
- **Ignorar conflictos de merge.** Si dos agentes tocan los mismos archivos, habrá conflictos. Diseñar las tareas para minimizar overlap.
- **No monitorizar costes.** Un Agent Team con 4 teammates puede consumir 4× tokens. Revisar en Fase 7.

### 12. Remote & Autonomous Development (NUEVA)

Define cómo el proyecto sigue recibiendo trabajo cuando el developer no está en el escritorio. Tres mecanismos complementarios, de menor a mayor autonomía.

#### 12.1 Remote Control (supervisión desde móvil)

**Qué es:** Una capa de sincronización que conecta tu sesión local de Claude Code con la app móvil de Claude o `claude.ai/code`. Tu código nunca sale de tu máquina; solo mensajes y resultados fluyen por un puente cifrado.

**Cuándo usarlo:**

- Sesiones de implementación > 30 minutos
- `/parallel-build` que necesita supervisión
- Post-deploy monitoring
- Cualquier momento que quieras desacoplarte del escritorio

**Setup:**

```bash
# Iniciar Remote Control
claude remote-control
# O dentro de sesión activa:
/rc

# Para activar por defecto en todas las sesiones:
/config → Enable Remote Control for all sessions → true

# Instalar app móvil:
/mobile
```

**Características:**

- Ver en tiempo real lo que Claude está haciendo
- Aprobar/rechazar cambios de archivos desde el móvil
- Dar instrucciones adicionales
- Monitorear múltiples sesiones simultáneamente
- Reconexión automática si el portátil se duerme

**Seguridad:** Solo conexiones HTTPS salientes. No se abren puertos entrantes. End-to-end encrypted. Tu código nunca sale de tu máquina.

#### 12.2 Headless Mode (ejecución autónoma programada)

**Qué es:** Claude Code ejecutándose como agente headless (sin interfaz interactiva) desde scripts, cron jobs o pipelines.

**Cuándo usarlo:**

- Auditorías nocturnas automatizadas
- Reportes diarios de estado del proyecto
- Limpieza y mantenimiento periódico
- Cualquier tarea repetitiva que no requiera decisiones humanas en tiempo real

**Sintaxis base:**

```bash
# Ejecución headless básica
claude -p "prompt" --allowedTools "Read" "Glob" "Grep"

# Con límites de seguridad (obligatorio para ejecución desatendida)
claude -p "prompt" \
  --allowedTools "Read" "Glob" "Grep" "Bash(npm test)" \
  --max-turns 15 \
  --max-budget-usd 1.00

# Output estructurado
claude -p "prompt" --output-format json
```

**Niveles de permisos para headless:**

```bash
# Nivel 1: Solo lectura (risk-free)
--allowedTools "Read" "Glob" "Grep"

# Nivel 2: Lectura + HTTP (puede notificar, no modificar)
--allowedTools "Read" "Glob" "Grep" "Bash(curl *)"

# Nivel 3: Lectura + escritura limitada
--allowedTools "Read" "Write" "Glob" "Grep" "Bash(npm test)" "Bash(npm run lint)"

# Nivel 4: Todo (usar con extrema precaución)
--dangerously-skip-permissions
```

**Ejemplo: cron job nocturno local:**

```bash
# crontab -e
0 3 * * * cd /path/to/project && claude -p \
  "Review logs/staging.log from the last 24h. If there are errors, create a summary in docs/audits/$(date +\%Y-\%m-\%d).md" \
  --allowedTools "Read" "Glob" "Grep" "Write" \
  --max-turns 10 \
  --max-budget-usd 0.50
```

#### 12.3 GitHub Actions (agentes asíncronos en la nube)

**Qué es:** Claude Code ejecutándose en los runners de GitHub, triggered por eventos (PRs, issues, cron, manual). El código vive en GitHub, Claude opera en un entorno efímero y seguro.

**Cuándo usarlo:**

- Review automático de PRs (siempre activo)
- Implementación de features por issues (`@claude implement`)
- Auditorías programadas (cron)
- Cualquier tarea que debe ejecutarse aunque tu máquina esté apagada

**Ventaja clave sobre headless local:** No requiere que tu máquina esté encendida. Los runners de GitHub están siempre disponibles. Esto es lo que permite trabajar "cuando no estás en casa" sin necesidad de un servidor propio.

**Workflow de implementación desde móvil:**

1. Abrir GitHub App en el móvil
2. Ir al repo del proyecto
3. Crear un issue o comentar en uno existente con `@claude implement [descripción]`
4. El workflow `claude-implement.yml` se activa automáticamente
5. Claude analiza el contexto, implementa, y crea un PR
6. Revisar el PR desde el móvil y mergear si es correcto

**Workflows recomendados:** (ver definiciones completas en Fase 2 → Infraestructura de Autonomía)

- `claude-pr-review.yml`: Review automático en cada PR
- `claude-implement.yml`: Implementación por issues/comentarios
- `claude-nightly.yml`: Auditoría nocturna programada
- `claude-hardening.yml`: Auditoría de Fase 5 on-demand

#### 12.4 Matriz de decisión: ¿qué mecanismo usar?

| Situación                                                     | Mecanismo                  | Motivo                                          |
| ------------------------------------------------------------- | -------------------------- | ----------------------------------------------- |
| Implementando una feature larga, quiero salir a pasear        | Remote Control             | Supervisión en tiempo real desde móvil          |
| Quiero que Claude revise PRs automáticamente                  | GitHub Actions             | No requiere mi máquina encendida                |
| Quiero auditoría de seguridad cada noche                      | GitHub Actions (cron)      | Ejecución sin supervisión en la nube            |
| Tengo un script de mantenimiento diario en mi servidor        | Headless (cron local)      | Control total sobre entorno y permisos          |
| Se me ocurre una feature a las 3AM y quiero que empiece       | GitHub Issues + Action     | Escribo issue desde móvil, Claude lo implementa |
| Build largo en marcha, necesito ir a una reunión              | Remote Control             | Puedo aprobar/redirigir desde el teléfono       |
| Quiero probar 3 implementaciones alternativas mientras duermo | GitHub Actions + worktrees | N-of-1 competitivo asíncrono                    |

### 13. Decisión Informada (NUEVA)

Toda decisión técnica no trivial se expone antes de ejecutarse. El objetivo es que el developer construya un modelo mental progresivo del proyecto, entienda el porqué de cada elección y pueda tomar decisiones conscientes en lugar de aceptar output a ciegas.

#### 13.1 Estructura de una decisión informada

Antes de implementar, el agente IA debe comunicar:

1. **POR QUÉ** — Qué problema resuelve este enfoque, qué constraint lo motiva.
2. **CON QUÉ** — Herramientas, librerías, patrones o técnicas que se van a usar.
3. **PROS** — Ventajas del enfoque elegido.
4. **CONTRAS** — Desventajas, limitaciones, riesgos conocidos.
5. **ALTERNATIVAS** — Si existen alternativas viables, evaluarlas con sus tradeoffs (rendimiento, complejidad, mantenibilidad, coste, madurez del ecosistema).

#### 13.2 Nivel de detalle según tipo de decisión

| Tipo de decisión | Nivel de análisis | Ejemplo |
|---|---|---|
| Trivial / convención del proyecto | Una línea: "Usamos X porque está en CLAUDE.md" | Naming convention, import order |
| Librería / dependencia nueva | Breve: 3-5 bullet points con alternativa principal | Elegir librería de animaciones |
| Patrón arquitectónico | Completo: tabla comparativa de opciones con tradeoffs | State management, navigation pattern |
| Decisión irreversible / costosa | ADR formal (Fase 1) + discusión antes de ejecutar | Base de datos, proveedor de auth |

#### 13.3 Cuándo aplicar

- **Siempre:** Al instalar una dependencia nueva, elegir un patrón de implementación, o tomar una decisión que afecte a más de un archivo.
- **Implícitamente:** Decisiones que ya están documentadas en CLAUDE.md, ADRs o `.claude/rules/` no necesitan re-justificarse, solo referenciarse.
- **Nunca bloquear:** La decisión informada no es un gate — es una comunicación. Si el developer no objeta, se ejecuta.

#### 13.4 Anti-patrones

- **Parálisis por análisis:** Presentar 8 alternativas para algo trivial. Mantener proporcionalidad.
- **Justificar lo obvio:** Si el proyecto ya decidió usar Zustand (ADR), no reevaluar Redux en cada feature.
- **Ocultar complejidad:** No simplificar excesivamente los contras para "vender" una solución.

> **Regla:** El developer debe poder responder "¿por qué se hizo así?" en cualquier parte del código, sin leer el git log. Si no puede, falta una decisión informada o un comentario en el código.

---

## Resumen Operativo: Checklist por Fase

| Fase | Foco Principal      | Herramienta Claude Code          | Artifact Clave                          | Paralelismo        |
| ---- | ------------------- | -------------------------------- | --------------------------------------- | ------------------ |
| -1   | Profiling + Tier    | Plan Mode                        | `PROJECT_PROFILE.md`                    | —                  |
| 0    | Spec formal         | opusplan + researcher            | `SPEC.md`                               | —                  |
| 1    | ADRs + design       | Seq. Thinking + Stitch MCP       | `docs/adr/` + design.md + COMPONENT_SYSTEM.md | —            |
| 2    | Scaffolding + DX    | CLAUDE.md + hooks + commands     | `.claude/` + theme.ts + Memory          | Setup infra        |
| 3    | Core mínimo         | Worktrees + TDD                  | Core + observability                    | Tier B: worktrees  |
| 3.5  | Core cognitivo IA   | ai-architect + eval              | `COGNITIVE_ARCHITECTURE.md`             | —                  |
| 4    | Features iterativas | Agent Teams + compound           | Features + learnings                    | Según Tier         |
| 5    | Auditorías          | Agent team paralelo              | `AUDIT_REPORT.md`                       | Siempre paralelo   |
| 6    | Release progresivo  | GitHub MCP + flags + RC          | `RUNBOOK.md`                            | RC para monitoring |
| 7    | Mejora continua     | Auto-memoria + ccusage           | `RETROSPECTIVE.md`                      | Review de costes   |

---

## Flujo Diario Típico (Solo Builder, Tier B)

Para hacer concreto cómo se siente trabajar con este framework en el día a día:

**Mañana (escritorio):**

1. `claude` → `/rehydrate` → confirmar contexto
2. Revisar PR creado por auditoría nocturna (si hay)
3. `/feature-cycle feature-x` → spec → plan → aprobación del plan
4. Implementación TDD con sub-agentes de tests en paralelo

**Mediodía (móvil, fuera de casa):** 5. `/rc` activo → monitorear build desde Claude App 6. Aprobar cambios de archivos desde el móvil 7. Si se me ocurre algo: crear issue en GitHub App con `@claude implement`

**Tarde (escritorio):** 8. Review del PR generado por el issue del mediodía 9. `/parallel-review` para review consolidado 10. Merge → `/compound` → actualizar CLAUDE.md + SESSION_LOG

**Noche (automático):** 11. `claude-nightly.yml` ejecuta auditoría de deps + coverage + TODOs 12. Si hay findings, crea un issue para el día siguiente

---

## EL MANTRA

**Perfila primero (Tier). Spec primero. Plan Mode obligatorio. Decisión informada antes de ejecutar. TDD como verificación. Worktrees para paralelismo. Agent Teams para coordinación. CLAUDE.md lean. /clear como disciplina. /rehydrate como inicio. Remote Control como libertad. GitHub Actions como agente nocturno. Evaluación IA o no existe "done". Persistir contexto o repetir errores.**

_Cada unidad de trabajo debe hacer que las siguientes sean más fáciles._

---

_— Documento vivo. Versionar y actualizar tras cada retrospectiva (Fase 7). —_
