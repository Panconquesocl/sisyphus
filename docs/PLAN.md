# Plan — Sisyphus

Roadmap y decisiones. Este doc es la fuente de verdad del **qué falta**; el estado técnico
detallado vive en `CLAUDE.md`.

> **Estado a 2026-07-29:** app **funcionalmente completa** y en producción
> ([sisyphus-psi.vercel.app](https://sisyphus-psi.vercel.app/)), **repo público**, con README.
> Fases 0-3 sustancialmente hechas. Lo que sigue es refinamiento + features nuevas (abajo).

---

## Hecho ✅

- **Fase 0** — setup: Next.js 16 (App Router, TS), Tailwind v4 + shadcn (Base UI), Neon Postgres,
  Prisma 7, Auth.js (Google), Vercel CI/CD, GitHub Actions (lint/typecheck/test).
- **Fase 1** — CRUD de hábitos (crear/editar/archivar/**borrar**), registro diario y retroactivo,
  grilla mensual (ahora ventana móvil 1/3 meses), auth, navbar global.
- **Fase 2** — vista anual (detalle `/habits/[id]` + dashboard `/my-year`), rachas actual+máxima,
  % de cumplimiento, modo oscuro, 3 tipos de hábito, **zona horaria del usuario**.
- **Extras** — notas del día, registro rápido "Hoy" con UI optimista (`useOptimistic`),
  layout responsivo (grilla escalonada 1→2→3 columnas), estados de carga/error/404/vacíos,
  **color + ícono por hábito** (paleta curada + lucide teñido), 33 tests Vitest.
- **Infra** — **DB branching** dev/prod en Neon + `prisma migrate deploy` en el build de Vercel
  (validado en prod). Login con carácter (roca + tagline). README + repo público + `.env.example`.
  Ramas remotas mergeadas limpiadas.

---

## Exploración de diseño (artifact)

Deck interactivo con direcciones, paletas y prototipos jugables:
**https://claude.ai/code/artifact/d39f706b-326e-4353-92dd-9fd45245cd6b**
Incluye: 4 direcciones (Contributions / Almanaque / Impulso), paletas de heatmap
(verde·ámbar·índigo·coral), prototipos funcionales (§05) y bocetos de las 3 features grandes (§06).

---

## Pendiente — decidido, listo para implementar

Orden sugerido (valor/esfuerzo). **Ninguno empezado.**

### Quick wins (fixes + pulido chico)
1. **Bug: grilla de 3 meses se corta.** La `HabitGrid` del home no maneja overflow; a 3 meses se
   desborda la tarjeta de ancho fijo. Fix: envolver en `overflow-x-auto` (o achicar celda en 3m).
2. **Restaurar título de tarjeta → `/habits/[id]`.** El `<Link>` en el nombre se perdió al reagrupar
   la cabecera con el ícono. Una línea.
3. **Borde/anillo en la celda del día actual** en todas las grillas (usa el "hoy" en la tz del usuario;
   anillo con color de acento neutro, no el del hábito, para no confundir con "nivel alto").

### Decisiones de producto
4. **Tipo Cantidad vs Duración.** Hoy son idénticos (meta + unidad + entero). Dos caminos:
   (a) **fusionarlos** en un tipo numérico único, o (b) que **Duración se gane el lugar** mostrándose
   como tiempo (`90 min` → `1h 30m`). Decidir según si se quiere UX de tiempo. (Prototipo en artifact §05.)
5. **«Mi año» en tarjetas.** Encapsular cada grilla anual en una tarjeta con encabezado
   (ícono + nombre + stat) — hoy se ven planas. (Boceto en artifact §03, recomendado.)
6. **Borrar cuenta.** Acción destructiva: `deleteUser` con cascada (hábitos/entries/notas/sesiones)
   + modal de confirmación **por escritura** (tipear "BORRAR"), en una pantalla de ajustes nueva.
   (Prototipo del flujo en artifact §05.)

### Features grandes (más valor de usuario — bocetos en artifact §06)
7. **Frecuencia flexible.** El mayor gap de producto: hoy todo hábito es diario, lo que rompe
   rachas/% en días no planeados. Soportar días específicos (L/X/V) o "N veces por semana".
   Redefine rachas y cumplimiento. **Requiere cambio de modelo** (schedule por hábito).
8. **Recordatorios (email).** El driver #1 de retención. Job programado + envío diario. La gente no
   deja de querer el hábito, se olvida de registrar. Técnicamente interesante (cron, mails).
9. **Insights.** Convertir datos en autoconocimiento: mejor día de la semana, tendencia (↑/↓),
   constancia, resumen semanal. Visualmente rico. (Boceto con barras en artifact §06.)
10. **Onboarding con plantillas.** Packs ("salud", "productividad") para que el usuario nuevo no
    empiece en blanco. Mejora la activación. (Boceto en artifact §06.)
11. **Grilla pública compartible.** Como un perfil de GitHub: URL pública con tu grilla. Loop social +
    vitrina de portafolio. (Ojo privacidad.)

### Deuda técnica / cosmética
- **Notas en amarillo post-it** (ajustar `--note`). Cosmético.
- Extraer `<HomeContent>` para adelgazar `page.tsx`.
- Pasada de accesibilidad (teclado, contraste, aria).
- Export CSV/JSON (propiedad de datos, bajo esfuerzo).
- Opcional infra: apuntar el entorno **Preview** de Vercel a la rama `dev` de Neon (aislamiento total).
- Anillo de progreso para el % (descartado por ahora — el usuario no le vio valor).

---

## Ideas "v2" (post-portafolio, opcionales)

- Recordatorios push / PWA instalable.
- Reordenar hábitos (el campo `order` existe, sin usar).
- API pública.

---

## Decisiones ya tomadas (cerradas)

- Stack: Next.js + TS + Postgres (Neon) + Auth.js. **ORM: Prisma.**
- Nombre: **Sisyphus.** Paleta heatmap: verdes GitHub por defecto (`--heat-*`), + 5 hues curados
  por hábito; amarillo para notas.
- Color por hábito = **paleta curada** (no picker de hex libre: rompe contraste/dark). Ícono = **set
  curado de lucide** teñido (no librería de picker completa: rompe SSR + infla el bundle).
  A futuro: opción **emoji O ícono**.
- Git: GitHub Flow (rama `feat/...` → PR → squash merge). Pair programming (Claude guía, el usuario
  escribe; Claude escribe archivos enteros solo si se lo piden — el pegado de snippets largos se corrompe).
