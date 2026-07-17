# CLAUDE.md — Habitrack

Guía para trabajar en este proyecto. Léela al inicio de cada sesión.

## Qué es

**Habitrack** (nombre provisional) es una app web para seguir el estado de hábitos y
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

## Modelo de datos (objetivo)

```
User        1─┐
              └─< Habit        (name, color, icon, type, target, unit, archived)
                    1─┐
                      └─< HabitEntry  (date, value, note)   @@unique([habitId, date])
```

- `Habit.type`: `BINARY` (hecho/no), `QUANTITY` (ej. 8 vasos), `DURATION` (ej. 30 min).
- La intensidad de color de la grilla = `value` relativo a `target`.
- `HabitEntry.date` es un **día** (sin hora). Guardar como fecha en la **zona horaria del
  usuario**, no UTC crudo — ver nota de timezones abajo.

### Timezones (decisión técnica clave)

El "día" de un hábito depende de dónde está el usuario. Guardar `date` como el día local
del usuario (columna `@db.Date`) evita que un check a las 11pm salte al día siguiente en
UTC. Este es un buen tema para el README.

## Convenciones

- TypeScript estricto; sin `any` salvo justificación.
- Server Components por defecto; `"use client"` solo cuando se necesita interactividad.
- Mutaciones vía **Server Actions** + validación con **Zod**.
- Acceso a DB centralizado en `lib/` (no queries de Prisma sueltas en componentes).
- Nombres de archivos: `kebab-case`. Componentes React: `PascalCase`.

## Comandos

> Se irán completando a medida que montemos el proyecto.

```bash
# pnpm dev            # servidor de desarrollo (pendiente de setup)
# pnpm build          # build de producción
# pnpm lint           # linter
# npx prisma studio   # explorar la DB
# npx prisma migrate dev  # aplicar migraciones en desarrollo
```

## Estado actual

Fase 0 — planificación. Ver `docs/PLAN.md` para el roadmap por fases.
