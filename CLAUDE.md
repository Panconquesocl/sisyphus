# CLAUDE.md — Sisyphus

Guía para trabajar en este proyecto. Léela al inicio de cada sesión.

## Qué es

**Sisyphus** es una app web para seguir el estado de hábitos y rutinas. La feature central
es una **grilla mensual estilo "contributions" de GitHub**: un heatmap donde cada celda es
un día y la intensidad del color refleja el cumplimiento del hábito ese día.

Es un **proyecto de portafolio** para buscar trabajo. Las decisiones se optimizan para:
(1) demostrar buenas prácticas full-stack, (2) verse profesional, (3) ser explicable en
una entrevista.

## Cómo trabajamos (IMPORTANTE)

Pair programming, **cero vibecoding**. El usuario quiere **entender todo**.

- **El usuario escribe el código.** Claude **guía**: explica, entrega los snippets y da
  feedback. No edites archivos de feature por tu cuenta salvo que te lo pidan.
- **Explica el porqué ANTES del código**: trade-offs, patrones, gotchas.
- **Pasos pequeños**: un concepto a la vez, no volcados de muchos archivos.
- **Pausa en checkpoints** e invita preguntas.
- **Lee el repo tú mismo** (Read/Bash/Grep) en vez de pedirle al usuario que pegue
  archivos. Pide copy-paste solo para salidas de terminal.
- **Comunícate en español.**

## Stack

| Capa        | Elección                                  |
|-------------|-------------------------------------------|
| Framework   | Next.js 16 (App Router) + TypeScript      |
| Estilos     | Tailwind v4 + shadcn/ui (sobre **Base UI**) |
| DB          | PostgreSQL (Neon)                         |
| ORM         | Prisma 7                                  |
| Auth        | Auth.js (NextAuth v5) — Google            |
| Validación  | Zod                                       |
| Tests       | Vitest                                    |
| Tema        | next-themes (modo oscuro)                 |
| Deploy      | Vercel — https://sisyphus-psi.vercel.app  |

## Modelo de datos (migración `init`)

```
User ─┬─< Habit ──< HabitEntry   (date @db.Date, value Int, @@unique([habitId, date]))
      └─< DayNote                 (date @db.Date, content, @@unique([userId, date]))
```
Más los modelos que exige Auth.js: `Account`, `Session`, `VerificationToken`.

- `Habit`: name, type, unit?, target?, color, icon?, order, `archivedAt` (archivado suave), timestamps.
- `Habit.type` (enum `HabitType`): `BINARY` / `QUANTITY` (ej. 8 vasos) / `DURATION` (ej. 30 min).
  **El tipo es inmutable** al editar (los registros existentes se guardaron bajo su semántica).
- `HabitEntry.value` es **`Int`** (para decimales, usar una unidad más fina: min en vez de horas).
- **La nota es del DÍA, no del hábito**: `DayNote`, una por (usuario, día). Se edita en la
  Home (sección «Nota de hoy»).

### Timezones (decisión técnica clave)

El "día" de un hábito depende de **dónde está el usuario**, no del servidor (Vercel corre en UTC).
Patrón usado en todo el proyecto:

1. El **cliente** obtiene su fecha local con el hook `useLocalToday()` → `"2026-07-20"`.
2. El **servidor** la guarda con `new Date(\`${date}T00:00:00Z\`)` en la columna `@db.Date`.
3. Al leer, se formatea de vuelta con `date.toISOString().slice(0, 10)`.

Como el valor local depende del navegador, NO puede conocerse durante el SSR. El hook usa
**`useSyncExternalStore`** (`getServerSnapshot` → `null`, `getSnapshot` → día local): declara
la diferencia servidor/cliente como intención, evita el hydration mismatch y no dispara el
lint `react-hooks/set-state-in-effect` (que sí saltaba con el viejo `useEffect` + `setState`).
`useHydrated()` es el hook hermano para UI que depende del navegador sin ser una fecha
(lo usa `theme-toggle` con next-themes). La función pura vive en `src/lib/dates.ts`.

⚠️ Los Server Components que necesitan una fecha siguen usando el UTC del servidor
(ver «Deuda técnica acordada»).

### Prisma 7 (notas clave)

- La conexión NO va en `schema.prisma` sino en `prisma.config.ts` (usa `DIRECT_URL` para migraciones).
- El cliente se genera en `src/generated/prisma/` (gitignored). Import: `@/generated/prisma/client`.
- Runtime necesita **driver adapter**: `src/lib/prisma.ts` usa `new PrismaClient({ adapter: new PrismaNeon(...) })`
  con patrón singleton. `DATABASE_URL` = pooled (app); `DIRECT_URL` = directa (migraciones).
- `postinstall: prisma generate` para que Vercel regenere el cliente en cada deploy.
- `migrate dev` **no** siempre corre `generate`; a veces hay que ejecutarlo a mano.

### shadcn sobre Base UI (NO Radix)

Diferencia importante al usar componentes:
- **No existe `asChild`.** `PopoverTrigger` / `DialogTrigger` **ya son botones**: se les pasan
  `className`, `style`, `title`, etc. directamente.
- Para darles estilo de botón shadcn: `className={buttonVariants({ variant, size })}`.
- `open` / `onOpenChange` sí funcionan igual (componentes controlados).

## Reglas de negocio: rachas

Nivel de cada día (`src/lib/streaks.ts`):
- **PERFECT**: binario hecho, o `value >= target`.
- **SOFT**: `value >= target / 2` (solo cantidad/duración).
- **NONE**: sin registro o bajo el 50%.

Racha actual: se muestra **una sola**, con prioridad **perfecta → suave → ninguna**, y solo
si tiene **≥ 2 días**. **Regla de gracia**: se cuenta desde hoy, o desde ayer si hoy aún no
tiene registro (para no perderla). Si hoy se registró **bajo el umbral**, la racha sí se rompe.

## Convenciones

- TypeScript estricto; sin `any` salvo justificación.
- Server Components por defecto; `"use client"` solo cuando se necesita interactividad.
- Mutaciones vía **Server Actions** + validación con **Zod** (`safeParse`).
- **Toda query/mutación se filtra por el usuario logueado** (`requireUser()`), y las acciones
  verifican propiedad del recurso antes de tocarlo.
- Props que cruzan servidor→cliente deben ser **serializables** (pasar `[string, number][]`, no `Map`).
- Nombres de archivos: `kebab-case`. Componentes React: `PascalCase`. Archivos con JSX: `.tsx`.
- **Git: GitHub Flow.** Rama `feat/...` por feature → PR (`gh pr create --fill`) → `gh pr merge --squash`.
  Conventional Commits. Nunca commitear directo a `main`.

## Estructura del código

```
src/
  auth.ts                       config de Auth.js (handlers, auth, signIn, signOut)
  app/
    layout.tsx                  ThemeProvider + metadata
    page.tsx                    Home: login, form, lista de hábitos, archivados
    actions.ts                  TODAS las Server Actions
    api/auth/[...nextauth]/     route handler de Auth.js
  lib/
    prisma.ts                   cliente Prisma singleton + adapter Neon
    auth-helpers.ts             requireUser()
    grid.ts                     buildMonthGrid, intensityLevel, LEVEL_COLORS
    streaks.ts                  dayLevel, computeStreak  (+ streaks.test.ts)
    dates.ts                    localToday() — "YYYY-MM-DD" local vía locale en-CA
    use-local-today.ts          hook: día local del usuario (null en SSR)
    use-hydrated.ts             hook: false en SSR, true en el navegador
  components/
    day-note.tsx                nota del día (textarea + guardar)
    habit-form.tsx              crear hábito (campos condicionales por tipo)
    habit-today-toggle.tsx      marcar hoy (solo binarios)
    habit-grid.tsx              grilla mensual (server) + etiquetas de días
    grid-cell.tsx               celda (client): binario togglea, no-binario abre popover
    streak-badge.tsx            badge ⭐/🔥
    edit-habit-dialog.tsx       diálogo de edición
    archive-button.tsx          archivar / restaurar
    theme-provider.tsx, theme-toggle.tsx
    ui/                         componentes de shadcn
```

Server Actions disponibles en `src/app/actions.ts`: `createHabit`, `updateHabit`,
`setHabitArchived`, `toggleEntry` (binarios), `setEntry` (valores), `setDayNote`
(upsert por `userId_date`; contenido vacío borra la fila).

**Estado del cliente: derivar, no copiar.** `day-note.tsx` es el ejemplo de referencia —
guarda en estado solo el borrador del usuario (`draft`, `null` si no ha tocado nada) y deriva
lo mostrado del prop del servidor. Nada de `useEffect` copiando props a estado.

Colores del heatmap: variables CSS `--heat-0..4` en `globals.css` (`:root` y `.dark`),
referenciadas desde `LEVEL_COLORS`.

## Comandos

```bash
pnpm dev                            # desarrollo (localhost:3000)
pnpm build                          # build de producción
pnpm lint                           # linter
pnpm typecheck                      # tsc --noEmit
pnpm test                           # tests (Vitest)
pnpm prisma generate                # regenera el cliente (src/generated/prisma)
pnpm prisma migrate dev --name <n>  # crea y aplica una migración
pnpm prisma studio                  # explorador visual de la DB
```

## CI

`.github/workflows/ci.yml` corre **lint + typecheck + tests** en cada PR y push a `main`.
Gotcha: `pnpm install` dispara el `postinstall` (`prisma generate`), que carga
`prisma.config.ts` y exige `DIRECT_URL`. El workflow define una URL **falsa** — `generate`
solo lee el schema, no conecta. Nunca poner ahí la real (los logs son públicos).
`pnpm/action-setup` debe ir **antes** de `setup-node`, o el `cache: pnpm` no encuentra el store.

## Estado actual (2026-07-20)

**Fase 1 completa + extras.** Funcionando de punta a punta:
auth con Google · CRUD completo de hábitos (crear, listar, editar, archivar/restaurar) ·
3 tipos con meta y unidad · registro diario y retroactivo · grilla mensual con intensidad
por cumplimiento · rachas suave/perfecta con tests · notas del día · modo oscuro ·
diseño con shadcn · deploy con CI/CD y login funcionando en producción.

**Pendientes** (por orden sugerido):
1. **Vista anual** (toggle Mes/Año) y **página de detalle** por hábito (rutas dinámicas).
2. Racha máxima histórica + % de cumplimiento.
3. Impedir marcar **días futuros** (requiere el "hoy" local del cliente).
4. Pulido de portafolio: README con capturas y decisiones técnicas, estados de error/carga,
   responsive y accesibilidad.

### Deuda técnica acordada (2026-07-20)

**a) Zona horaria en el modelo `User`.** Hoy el "día" lo resuelve el cliente en `useEffect`
(patrón repetido ya en `habit-today-toggle`, `day-note` y `grid-cell`), y los Server
Components que necesitan una fecha usan el UTC del servidor — p. ej. `year`/`month` de la
grilla en `page.tsx`, que muestra el mes equivocado a fin de mes en zonas negativas.

Solución acordada: campo `timezone String?` en `User` (IANA, capturado en el primer login con
`Intl.DateTimeFormat().resolvedOptions().timeZone`) y hacer la matemática de fechas en el
servidor con esa zona. Desbloquea features server-side (% de cumplimiento, rachas
server-side, resúmenes, recordatorios). **Hacerlo al construir la vista anual / página de
detalle**, que es donde el problema deja de ser cosmético; retrofitearlo se encarece con cada
componente nuevo que resuelva el día en el cliente. Al hacerlo, extraer `localToday()`
(el truco `toLocaleDateString("en-CA")` → `YYYY-MM-DD`) a `src/lib/dates.ts`.

**b) Refactor `email` → `userId` en las queries.** `page.tsx` filtra con
`user: { email: session.user.email! }`. Problemas: hace un JOIN innecesario, ata las queries a
un campo mutable, y sobre todo `email` es `String?` en el schema — si llegara `undefined`,
Prisma **ignora el filtro** (`undefined` = "sin filtro", distinto de `null`) y la query
devolvería los hábitos de todos los usuarios. El `!` solo calla a TypeScript, no valida en
runtime. Solución: usar `requireUser()` en `page.tsx` y filtrar por `userId: user.id`.
**En su propio commit**, sin mezclar con una feature.

Referencia visual: wireframes low-fi en
https://claude.ai/code/artifact/ed9dbc47-3908-4a02-8bb7-072c50948a25
Roadmap por fases: `docs/PLAN.md`.
