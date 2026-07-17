# Plan detallado — Habitrack

Roadmap por fases. Cada fase tiene un objetivo, entregables y **qué aprendes** (para
poder defenderlo en entrevista). Construimos en pair programming, paso a paso.

---

## Fase 0 — Planificación y setup del entorno

**Objetivo:** dejar el esqueleto corriendo en local y en la nube.

- [ ] Crear proyecto Next.js (App Router, TS, Tailwind, ESLint) con `pnpm`.
- [ ] Inicializar git + primer commit + repo en GitHub.
- [ ] Crear base de datos Postgres gratis en **Neon**.
- [ ] Instalar y configurar **Prisma**; conectar a Neon.
- [ ] Configurar **shadcn/ui**.
- [ ] Deploy inicial en **Vercel** (aunque sea la página por defecto).

**Aprendes:** estructura de un proyecto Next moderno, variables de entorno, conexión a
una DB serverless, pipeline de deploy continuo.

---

## Fase 1 — MVP funcional

**Objetivo:** poder crear hábitos, registrar días y ver la grilla mensual.

- [ ] **Esquema Prisma**: `User`, `Habit`, `HabitEntry`. Primera migración.
- [ ] **Auth** con Auth.js (Google). Proteger rutas privadas.
- [ ] **CRUD de hábitos** (crear, editar, archivar) con Server Actions + Zod.
- [ ] **Registro diario**: marcar hoy con un clic; marcar/editar cualquier celda pasada.
- [ ] **Grilla mensual** estilo GitHub con degradado de color según cumplimiento.
- [ ] Layout base: navbar, home con "lo de hoy" + grillas debajo.

**Aprendes:** modelado relacional, migraciones, autenticación/sesiones, Server Actions,
validación de formularios, y renderizar una visualización a partir de series de fechas.

**Checkpoint:** al terminar, la app ya es usable de verdad por una persona.

---

## Fase 2 — Lo que impresiona

**Objetivo:** subir el nivel visual y analítico.

- [ ] **Vista anual** (heatmap completo del año, como el perfil de GitHub).
- [ ] **Rachas**: racha actual y racha máxima por hábito.
- [ ] **% de cumplimiento** semanal/mensual con anillo de progreso.
- [ ] **Página de detalle** por hábito: grilla + stats + histórico.
- [ ] **Modo oscuro**.
- [ ] Tipos de hábito completos (binario / cantidad / duración) reflejados en el color.

**Aprendes:** algoritmos sobre series temporales (cálculo de rachas), agregaciones,
diseño de componentes reutilizables, theming.

---

## Fase 3 — Pulido de portafolio

**Objetivo:** que quien lo revise diga "wow" y quede listo para mostrar.

- [ ] **Dashboard de insights**: mejor día de la semana, tendencia, correlaciones simples.
- [ ] **Notas por día** (popover al hacer clic en una celda).
- [ ] **Onboarding** con plantillas de hábitos (no empezar en blanco).
- [ ] **Estados vacíos, loading y errores** cuidados.
- [ ] **Responsive** y accesibilidad básica (teclado, contraste, aria).
- [ ] **README** sólido: capturas, decisiones técnicas (timezones!), cómo correrlo.
- [ ] **Tests** de la lógica clave (rachas, agregaciones).

**Aprendes:** análisis de datos ligero, UX de estados, accesibilidad, testing, y a
comunicar tu trabajo — lo que más pesa en entrevistas.

---

## Ideas para "v2" (post-portafolio, opcionales)

- Recordatorios / notificaciones.
- Hábitos con frecuencia (ej. "3 veces por semana" en vez de diario).
- Compartir una grilla pública (como un perfil).
- Export a CSV / API pública.
- App PWA instalable.

---

## Decisiones pendientes

- [x] Stack: Next.js + TS + Postgres + Auth. **ORM: Prisma.**
- [ ] Nombre definitivo del proyecto (provisional: "Habitrack").
- [ ] Paleta de colores de la marca.
