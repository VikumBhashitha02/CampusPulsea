# CampusPulse Development Guide

## 1. Prerequisites

Make sure the following tools are installed on your workstation:

- **Node.js**: >= 20.0.0 (`node -v`)
- **pnpm**: >= 9.0.0 (`pnpm -v`)
- **Docker**: For PostgreSQL and pgAdmin (`docker -v`)

---

## 2. Quick Start Setup

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` into `.env`:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS/Linux:
cp .env.example .env
```

Review `.env` and configure your database parameters if needed.

### Step 3: Start Local PostgreSQL (Docker)

```bash
docker compose -f docker/docker-compose.yml up -d
```

Verify PostgreSQL is healthy:

```bash
docker ps
```

_Tip: pgAdmin is available at http://localhost:5050 (login: `admin@campuspulse.dev` / `admin`)._

### Step 4: Generate Prisma Client & Push Schema

```bash
pnpm db:generate
pnpm db:push
```

### Step 5: Start Development Servers

```bash
pnpm dev
```

This runs both applications concurrently:

- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger Documentation**: [http://localhost:4000/api](http://localhost:4000/api)
- **Health Check Endpoint**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 3. Running Apps Independently

If you only want to work on one part of the stack:

### Run NestJS API only:

```bash
pnpm --filter @campuspulse/api dev
```

### Run Next.js Web only:

```bash
pnpm --filter @campuspulse/web dev
```

---

## 4. Common Commands

| Command             | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `pnpm dev`          | Starts all apps in watch/development mode       |
| `pnpm build`        | Compiles packages and builds apps via Turborepo |
| `pnpm lint`         | Runs ESLint across all workspaces               |
| `pnpm format`       | Formats all code using Prettier                 |
| `pnpm format:check` | Verifies code formatting                        |
| `pnpm db:generate`  | Regenerates Prisma Client                       |
| `pnpm db:push`      | Synchronizes Prisma schema with local database  |
| `pnpm db:migrate`   | Runs database migrations (dev)                  |
| `pnpm db:studio`    | Opens Prisma Studio visual database editor      |

---

## 5. Coding Standards & Conventions

1. **TypeScript Strict Mode**: No implicit `any`. Strict null checks are strictly enforced.
2. **Path Aliases**:
   - In `apps/web`: `@/*` maps to `apps/web/src/*`.
   - In `apps/api`: `@/*` maps to `apps/api/src/*`.
3. **Shared Code**: Put reusable models in `@campuspulse/types`, schemas in `@campuspulse/validation`, and constants in `@campuspulse/config`.
4. **Clean Commits**: Ensure `pnpm build` and `pnpm lint` succeed before committing.
