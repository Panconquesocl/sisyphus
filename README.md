# Sisyphus

**Seguimiento de hábitos con visualización estilo GitHub.** Registra tus rutinas día a día y mira tu progreso en una grilla de contribuciones — mensual, anual y por hábito.

🔗 **Demo en vivo:** [sisyphus-psi.vercel.app](https://sisyphus-psi.vercel.app/)

> _Empuja la roca un día más._

<!-- Sugerencia: agregar una captura aquí, p. ej. docs/screenshot.png -->
<!-- ![Sisyphus](docs/screenshot.png) -->

---

## Qué es

Sisyphus es una app full-stack para trackear hábitos. La feature central es una **grilla de calor estilo _contributions_ de GitHub**: cada celda es un día y la intensidad del color refleja qué tan cerca estuviste de tu meta.

### Features

- **Tres tipos de hábito**: binario (hecho/no hecho), cantidad (ej. 8 vasos de agua) y duración (ej. 30 min de lectura).
- **Registro rápido y retroactivo**: marca el día de hoy con un clic o edita cualquier día pasado en la grilla.
- **Vistas múltiples**: ventana móvil de 1/3 meses en el home, grilla anual por hábito, y un **dashboard anual** con todas tus grillas + los días con notas.
- **Rachas**: racha actual y máxima histórica, con dos niveles (perfecta y suave).
- **Métricas por hábito**: % de cumplimiento del año, totales y racha, en una página de detalle.
- **Notas del día**: una nota por día, compartida por todos los hábitos.
- **Personalización**: paleta de colores curada y un ícono por hábito, teñido con su color.
- **Modo oscuro** y diseño responsivo.
- **Autenticación** con Google.

---

## Stack

| Capa          | Tecnología                                              |
| ------------- | ------------------------------------------------------- |
| Framework     | Next.js 16 (App Router) + TypeScript                    |
| Estilos       | Tailwind CSS v4 + shadcn/ui (sobre Base UI)             |
| Base de datos | PostgreSQL (Neon, serverless)                           |
| ORM           | Prisma 7 (driver adapter)                               |
| Auth          | Auth.js (NextAuth v5) — Google OAuth                    |
| Validación    | Zod                                                     |
| Tests         | Vitest                                                  |
| Deploy        | Vercel (CI/CD) + GitHub Actions (lint, typecheck, test) |

---

## Decisiones técnicas destacadas

Las partes del proyecto que más me interesa poder explicar:

- **Zona horaria del usuario.** El "día" de un hábito depende de dónde está el usuario, no del servidor (Vercel corre en UTC). El cliente reporta su zona IANA (`Intl`), se guarda en el modelo `User`, y toda la matemática de fechas server-side usa esa zona. El día local que necesita el cliente se resuelve con `useSyncExternalStore` para evitar mismatches de hidratación.

- **Grilla estilo GitHub con lógica pura y testeada.** La construcción del calendario (padding lunes-primero, semanas completas, años bisiestos), los niveles de intensidad, el cálculo de rachas y el % de cumplimiento son **funciones puras** en `src/lib`, cubiertas por tests de Vitest. Los componentes son casi solo presentación sobre esa lógica.

- **Paleta de color con rampas por tema.** Cada hábito elige un color de una paleta curada; su grilla se pinta con una rampa de 5 niveles definida como variables CSS afinadas para claro y oscuro. Los íconos (lucide, monocromáticos) se tiñen con el mismo color para una identidad visual coherente.

- **UI optimista.** El registro rápido usa `useOptimistic` para que el valor cambie al instante, sin esperar el round-trip al servidor.

- **Mutaciones con Server Actions + Zod.** Todas las escrituras pasan por Server Actions validadas con Zod, y cada query/mutación se filtra por el usuario autenticado (con verificación de propiedad del recurso).

- **Aislamiento de entornos con database branching.** Neon permite ramificar la base como si fueran ramas de git: desarrollo local apunta a una rama `dev`, producción a la rama principal. Las migraciones se aplican a producción con `prisma migrate deploy` en el build de Vercel, sólo en deploys de producción.

---

## Correr el proyecto localmente

### Requisitos

- [Node.js](https://nodejs.org/) 20+ (el proyecto usa 22)
- [pnpm](https://pnpm.io/) 11+
- Una base de datos PostgreSQL (recomendado: [Neon](https://neon.tech/), gratis)
- Credenciales de Google OAuth ([Google Cloud Console](https://console.cloud.google.com/))

### Pasos

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/Panconquesocl/sisyphus.git
cd sisyphus
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# …y completar los valores (ver más abajo)

# 3. Aplicar las migraciones y generar el cliente de Prisma
pnpm prisma migrate dev

# 4. Levantar el servidor de desarrollo
pnpm dev
```

La app queda en [http://localhost:3000](http://localhost:3000).

### Variables de entorno

| Variable             | Descripción                                                 |
| -------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`       | Conexión **pooled** a Postgres (la usa la app en runtime).  |
| `DIRECT_URL`         | Conexión **directa** a Postgres (la usan las migraciones).  |
| `AUTH_SECRET`        | Secreto de Auth.js. Generar con `npx auth secret`.          |
| `AUTH_GOOGLE_ID`     | Client ID de Google OAuth.                                  |
| `AUTH_GOOGLE_SECRET` | Client Secret de Google OAuth.                              |

> En Google OAuth, registrar `http://localhost:3000/api/auth/callback/google` como Authorized redirect URI para el login local.

---

## Scripts

```bash
pnpm dev            # servidor de desarrollo
pnpm build          # build de producción
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # tests (Vitest)
pnpm prisma studio  # explorador visual de la base de datos
```

---

## Estructura

```
src/
  app/          rutas (App Router): home, /habits/[id], /my-year, actions.ts (Server Actions)
  components/   componentes de UI (grillas, selectores, modales, navbar)
  lib/          lógica pura y testeada: fechas/timezones, grilla, rachas, colores
prisma/         schema y migraciones
```
