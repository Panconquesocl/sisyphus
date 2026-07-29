# Plan — Sisyphus

Roadmap por fases. Cada fase tiene objetivo, entregables y **qué aprendes** (para poder
defenderlo en entrevista). Construimos en pair programming, paso a paso.

> Estado a 2026-07-29: **Fases 0, 1 y 2 completas.** El núcleo de producto está funcionando de
> punta a punta y desplegado. Lo que queda es la Fase 3 (pulido de portafolio) + un par de
> features modeladas pero sin construir. Ver **Pendiente ahora** al final.

---

## Fase 0 — Setup del entorno ✅

- [x] Proyecto Next.js (App Router, TS, Tailwind, ESLint) con `pnpm`.
- [x] Git + repo en GitHub (aún **privado**).
- [x] Postgres en **Neon**.
- [x] **Prisma 7** conectado (driver adapter Neon).
- [x] **shadcn/ui** (sobre Base UI).
- [x] Deploy en **Vercel** con CI/CD.

---

## Fase 1 — MVP funcional ✅

- [x] Esquema Prisma (`User`, `Habit`, `HabitEntry`, `DayNote` + modelos Auth.js) + migración.
- [x] Auth con Auth.js (Google), rutas protegidas.
- [x] CRUD de hábitos (crear, editar, archivar, **borrar**) con Server Actions + Zod.
- [x] Registro diario y retroactivo (clic en celda / registro rápido "Hoy").
- [x] Grilla mensual (ahora ventana móvil 1/3 meses) estilo GitHub con intensidad.
- [x] Layout base: navbar global, home con "Hoy" + grillas.

---

## Fase 2 — Lo que impresiona ✅

- [x] Vista anual (heatmap completo) — página de detalle + dashboard `/my-year`.
- [x] Rachas: actual y máxima por hábito (con tests).
- [x] % de cumplimiento (número en el detalle).
- [x] Página de detalle por hábito: grilla anual + stats.
- [x] Modo oscuro (next-themes).
- [x] Tipos de hábito (binario / cantidad / duración) reflejados en color/intensidad.
- [x] Zona horaria del usuario (día correcto server-side).

Extra sobre el plan original: notas del día, dashboard anual multi-hábito con grilla de notas,
tests en Vitest (30), CI con lint+typecheck+test, layout responsivo con grilla escalonada.

---

## Fase 3 — Pulido de portafolio (EN CURSO)

- [ ] **README** sólido: capturas, decisiones técnicas (¡timezones!), cómo correrlo.
- [ ] **Repo público** (hoy privado — bloquea que alguien lo revise).
- [ ] **Estados vacíos, loading y error** cuidados.
- [ ] **Accesibilidad**: teclado, contraste, aria.
- [ ] **Login con carácter** (piedra + tagline, como el mockup) — hoy es mínimo.
- [ ] Dashboard de insights (mejor día, tendencia) — *opcional, stretch*.
- [ ] Onboarding con plantillas de hábitos — *opcional, stretch*.

---

## Features modeladas o esbozadas, aún SIN construir

- [ ] **Color + ícono por hábito.** `Habit.color` e `Habit.icon` ya existen en el schema, pero
      el form no los setea y las grillas usan verde fijo. El mockup tenía selector de color +
      ícono. Es la feature de producto más grande que queda.
- [ ] **Anillo de progreso** para el % de cumplimiento (hoy es solo número).

## Mejoras técnicas / UX pendientes

- [ ] **UI optimista** en el stepper de "Hoy" (`useOptimistic`) — hoy espera al servidor.
- [ ] **Separar DB dev/prod** en Neon (branching) + `prisma migrate deploy` en CI. Hoy `.env`
      local y Vercel apuntan a la MISMA base; una migración destructiva iría directo a prod.
- [ ] **Limpiar ramas remotas** mergeadas (hay ~20 `feat/*`/`refactor/*` en origin).

---

## Ideas "v2" (post-portafolio, opcionales)

- Recordatorios / notificaciones.
- Hábitos con frecuencia (ej. "3 veces por semana").
- Compartir una grilla pública (perfil).
- Export a CSV / API pública.
- PWA instalable.

---

## Decisiones ya tomadas

- [x] Stack: Next.js + TS + Postgres (Neon) + Auth.js. **ORM: Prisma.**
- [x] Nombre: **Sisyphus**.
- [x] Paleta: verdes estilo GitHub para el heatmap (`--heat-*`), amarillo para notas.
