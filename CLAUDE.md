# CLAUDE.md — Sisyphus

Guía para trabajar en este proyecto. Léela al inicio de cada sesión.

## Qué es

**Sisyphus** es una app web para seguir el estado de hábitos y
rutinas. La feature central es una **grilla mensual estilo "contributions" de GitHub**:
un heatmap donde cada celda es un día y la intensidad del color refleja el cumplimiento
del hábito ese día.

Es un **proyecto de portafolio** para buscar trabajo. Las decisiones se optimizan para:
(1) demostrar buenas prácticas full-stack, (2) verse profesional, (3) ser explicable en
una entrevista.

## Cómo trabajamos (IMPORTANTE)

Este proyecto se construye en **pair programming, cero vibecoding**. El usuario quiere
**entender todo**. Por lo tanto, al escribir código:

- **Explica el porqué ANTES de escribir**, no después. Trade-offs, patrones, gotchas.
- **Pasos pequeños y digeribles**: un concepto/archivo a la vez, no volcados de muchos
  archivos de golpe.
- **Pausa en checkpoints** para confirmar entendimiento e invitar preguntas.
- **Enseña**: prioriza el razonamiento sobre la cantidad de output.
- No sobre-scaffoldees en silencio; el usuario sigue el hilo y toma decisiones.
- **Comunícate en español.**

## Stack

| Capa        | Elección                          |
|-------------|-----------------------------------|
| Framework   | Next.js (App Router) + TypeScript |
| Estilos     | Tailwind CSS + shadcn/ui          |
| DB          | PostgreSQL (Neon)                 |
| ORM         | Prisma                            |
| Auth        | Auth.js (NextAuth v5) — Google    |
| Validación  | Zod                               |
| Deploy      | Vercel                            |

## Modelo de datos (implementado — migración `init`)

```
User ─┬─< Habit ──< HabitEntry   (date @db.Date, value Int, @@unique([habitId, date]))
      └─< DayNote                 (date @db.Date, content, @@unique([userId, date]))
```
Más los modelos que exige Auth.js: `Account`, `Session`, `VerificationToken`.

- `Habit`: name, type, unit?, target?, color, icon?, order, `archivedAt` (soft-archive), timestamps.
- `Habit.type` (enum `HabitType`): `BINARY` (hecho/no) / `QUANTITY` (ej. 8 vasos) / `DURATION` (ej. 30 min).
- `HabitEntry.value` es **`Int`** (enteros; para decimales, usar una unidad más fina). Intensidad de color = `value` vs `target`.
- **La nota es del DÍA, no del hábito**: `DayNote`, una por (usuario, día). Se edita en la vista «Hoy».
- Los campos `date` usan `@db.Date` (solo día, sin hora) — ver timezones abajo.

### Timezones (decisión técnica clave)

El "día" de un hábito depende de dónde está el usuario. Guardar `date` como el día local
del usuario (columna `@db.Date`) evita que un check a las 11pm salte al día siguiente en
UTC. Este es un buen tema para el README.

### Prisma 7 (notas clave)

- La conexión NO va en `schema.prisma` sino en `prisma.config.ts` (usa `DIRECT_URL`, la directa, para migraciones).
- El cliente se genera en `src/generated/prisma/` (gitignored). Import: `@/generated/prisma/client`.
- El runtime necesita un **driver adapter**: en `src/lib/prisma.ts`, `new PrismaClient({ adapter: new PrismaNeon({ connectionString: DATABASE_URL }) })` (patrón singleton). `DATABASE_URL` = pooled (app); `DIRECT_URL` = directa (migraciones).
- `postinstall: prisma generate` para que Vercel regenere el cliente en cada deploy.

## Convenciones

- TypeScript estricto; sin `any` salvo justificación.
- Server Components por defecto; `"use client"` solo cuando se necesita interactividad.
- Mutaciones vía **Server Actions** + validación con **Zod**.
- Acceso a DB centralizado en `lib/` (no queries de Prisma sueltas en componentes).
- Nombres de archivos: `kebab-case`. Componentes React: `PascalCase`.

## Comandos

```bash
pnpm dev                            # servidor de desarrollo (localhost:3000)
pnpm build                          # build de producción
pnpm lint                           # linter
pnpm prisma generate                # regenera el cliente (src/generated/prisma)
pnpm prisma migrate dev --name <n>  # crea y aplica una migración en desarrollo
pnpm prisma studio                  # explorador visual de la DB
```

## Estado actual

**Fase 1 en curso.** Hecho: modelo de datos + migración `init` (7 tablas en Neon),
cliente Prisma con adapter de Neon (verificado con éxito), deploy en Vercel con CI/CD.
Siguiente: **Auth.js con Google**. Ver `docs/PLAN.md` para el roadmap por fases.
