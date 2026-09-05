# CampusPulse Production Deployment Runbook

This document describes the recommended production deployment strategy for the **CampusPulse** platform, encompassing PostgreSQL, the NestJS API server, and the Next.js frontend.

---

## 1. Architecture Overview

```mermaid
graph TD
    Client[Browser / Mobile Client] -->|HTTPS| Cloudflare[Cloudflare CDN & WAF]
    Cloudflare -->|HTTPS / Port 443| Nginx[NGINX Reverse Proxy]
    Nginx -->|Proxy /api/*| NestAPI[NestJS API Cluster :4000]
    Nginx -->|Proxy /*| NextWeb[Next.js SSR/Static Cluster :3000]
    NestAPI -->|Pooled Connection| PgBouncer[PgBouncer Connection Pooler]
    PgBouncer -->|PostgreSQL 16| Postgres[(PostgreSQL DB + Replica)]
    NestAPI -->|Object Storage| S3[(AWS S3 / Cloudflare R2)]
```

---

## 2. Environment Variables Checklist

Ensure the following environment variables are securely populated in production via your secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, Doppler, or GitHub Secrets):

| Variable              | Type                  | Description                                      | Production Example                                                                     |
| --------------------- | --------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `NODE_ENV`            | String                | Application environment                          | `production`                                                                           |
| `DATABASE_URL`        | String                | Connection URI with connection pooling           | `postgresql://usr:pwd@db.provider.com:5432/campuspulse?sslmode=require&pgbouncer=true` |
| `API_PORT`            | Number                | Port for NestJS HTTP listener                    | `4000`                                                                                 |
| `API_PREFIX`          | String                | Base route prefix                                | `api`                                                                                  |
| `NEXT_PUBLIC_API_URL` | String                | Public API endpoint for web client               | `https://api.campuspulse.lk/api`                                                       |
| `JWT_SECRET`          | String (High Entropy) | Secret key for signing JWT tokens (min 64 chars) | `openssl rand -hex 64`                                                                 |
| `JWT_EXPIRATION`      | String                | Lifespan of session tokens                       | `7d`                                                                                   |

---

## 3. Production Build & Compilation

To build all packages, compile Prisma client artifacts, and build Next.js optimized bundles:

```bash
# 1. Install locked production dependencies
pnpm install --frozen-lockfile

# 2. Generate Prisma Client
pnpm --filter @campuspulse/database db:generate

# 3. Build shared libraries, API, and Web
pnpm build
```

---

## 4. Containerized Deployment (Docker)

### API Dockerfile (`apps/api/Dockerfile`)

```dockerfile
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @campuspulse/database db:generate
RUN pnpm --filter @campuspulse/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

### Web Dockerfile (`apps/web/Dockerfile`)

```dockerfile
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @campuspulse/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 5. Database Migration Runbook

Before deploying updated API containers, execute non-destructive database migrations:

```bash
# Run pending Prisma migrations against target production database
pnpm --filter @campuspulse/database prisma migrate deploy
```

> [!CAUTION]
> Never run `prisma db push` on production databases, as it can cause data loss. Always use `prisma migrate deploy` which checks version history against `_prisma_migrations`.

---

## 6. Security & Health Monitoring

1. **Liveness & Readiness Probes**:
   - `GET /api/v1/health`: Returns HTTP 200 with database connectivity and uptime status.
2. **Rate Limiting Protection**:
   - Built-in `ThrottlerGuard` throttles rapid calls to 100 requests / minute per IP.
3. **HTTP Security Headers**:
   - `helmet` automatically injects `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and strict transport security (HSTS).
