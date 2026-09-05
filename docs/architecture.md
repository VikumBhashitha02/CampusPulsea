# CampusPulse Architecture Overview

## 1. System Vision

**CampusPulse** is a unified university opportunities platform where students discover academic, career, competitive, research, social, cultural, sports, and music events in one place.

The platform is designed around a **modular monorepo** architecture where a single high-performance REST API powers both web clients and future native mobile applications.

---

## 2. High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                          CLIENTS                              │
│                                                               │
│   ┌────────────────────────┐      ┌───────────────────────┐   │
│   │ Next.js Web App (:3000)│      │  React Native (Expo)  │   │
│   │ App Router + Tailwind  │      │  (Future Phase 15)    │   │
│   └───────────┬────────────┘      └───────────┬───────────┘   │
└───────────────┼───────────────────────────────┼───────────────┘
                │                               │
                │        HTTP REST (JSON)       │
                ▼                               ▼
┌───────────────────────────────────────────────────────────────┐
│                        SHARED BACKEND                         │
│                                                               │
│   ┌───────────────────────────────────────────────────────┐   │
│   │                NestJS REST API (:4000)                │   │
│   │   - Global Prefix (/api)                              │   │
│   │   - Global ValidationPipe (DTO transform & whitelist) │   │
│   │   - Swagger/OpenAPI Documentation                     │   │
│   │   - Role-Based Access Control Guards                  │   │
│   │   - Prisma ORM Service                                │   │
│   └───────────────────────────┬───────────────────────────┘   │
└───────────────────────────────┼───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE                       │
│                                                               │
│   ┌───────────────────────────────────────────────────────┐   │
│   │            PostgreSQL Database (Port 5432)            │   │
│   │   - Relational schema managed via Prisma migrations   │   │
│   │   - Containerized via Docker Compose for local dev    │   │
│   └───────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Monorepo Organization

We use **pnpm Workspaces** with **Turborepo** to orchestrate development, caching, and building:

```
CampusPulse/
├── apps/
│   ├── web/                     # Next.js 15 App Router frontend
│   └── api/                     # NestJS backend REST API
│
├── packages/
│   ├── types/                   # Shared TypeScript interfaces, contracts & enums
│   ├── validation/              # Shared schemas (Zod) & validation helpers
│   ├── config/                  # Constants, environment parsing, configuration
│   ├── database/                # Prisma schema, migrations, generated client
│   ├── shared/                  # Re-export facade for packages/*
│   ├── eslint-config/           # Centralized ESLint configurations
│   └── typescript-config/       # Base, Next.js, and NestJS tsconfigs
│
├── docs/                        # Architecture, development & roadmap guides
├── docker/                      # Docker Compose definitions (PostgreSQL + pgAdmin)
├── .env.example                 # Environment variables specification
└── turbo.json                   # Pipeline build and task orchestration
```

---

## 4. Shared Contract Strategy

- **Single Backend Principle**: We do **not** use separate backends for mobile and web. The NestJS API exposes consistent RESTful endpoints consumed identically by web (Next.js server/client components) and mobile (React Native fetch/axios clients).
- **Type Safety across Boundaries**:
  - `@campuspulse/types` defines the standard response wrapper `ApiResponse<T>`, pagination contracts `PaginatedResponse<T>`, error structures `ApiErrorResponse`, and domain models.
  - Changes to API contracts are checked at compile-time across the entire monorepo.
- **DTOs and Validation**:
  - NestJS uses `class-validator` and `class-transformer` alongside Zod from `@campuspulse/validation` to guarantee incoming payloads are strictly checked and sanitized before hitting business services.

---

## 5. Security & Configuration Strategy

- **Zero Hardcoded Secrets**: All sensitive values (database credentials, JWT secrets, storage keys) are read strictly from environment variables.
- **Strict Role-Based Authorization**: Fine-grained roles (`STUDENT`, `ORGANIZER`, `FACULTY`, `ADMIN`) mapped to guards and decorators.
- **CORS Protection**: Restricted to authorized web and mobile app origins.
