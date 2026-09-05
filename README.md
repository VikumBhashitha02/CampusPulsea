# CampusPulse

> **"One Platform. Every University Opportunity."**  
> The comprehensive discovery, collaboration, and intelligence ecosystem for university students, campus organizations, academic faculties, and administrators.

---

## ⚡ System Architecture

CampusPulse is engineered as an enterprise-grade monorepo powered by **pnpm Workspaces** and **Turborepo**. Both the public-facing and administrative web applications consume a unified, modular **NestJS REST API** underpinned by a strongly-typed **PostgreSQL** database managed through **Prisma ORM**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CAMPUSPULSE MONOREPO                             │
├───────────────────────────────────────┬─────────────────────────────────────┤
│               APPLICATIONS            │               PACKAGES              │
│  ┌─────────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │   apps/web (Next.js 15 App)     │  │  │   @campuspulse/types          │  │
│  │   • Production SaaS UI          │  │  │   • Data contracts & enums    │  │
│  │   • Tailwind CSS 4 Design Tokens│  │  ├───────────────────────────────┤  │
│  │   • Student, Org & Admin Hubs   │  │  │   @campuspulse/validation     │  │
│  └────────────────┬────────────────┘  │  │   • class-validator DTOs      │  │
│                   │ HTTP REST         │  ├───────────────────────────────┤  │
│  ┌────────────────▼────────────────┐  │  │   @campuspulse/shared         │  │
│  │   apps/api (NestJS 10 API)      │  │  │   • Match formulas & helpers  │  │
│  │   • 15 Domain Modules           │  │  ├───────────────────────────────┤  │
│  │   • RBAC & Rate Limiting        │  │  │   @campuspulse/database       │  │
│  │   • Swagger OpenAPI Docs        │  │  │   • Prisma 18-model schema    │  │
│  └────────────────┬────────────────┘  │  │   • Database seed engine      │  │
│                   │ Prisma ORM        │  ├───────────────────────────────┤  │
│  ┌────────────────▼────────────────┐  │  │   @campuspulse/config         │  │
│  │   PostgreSQL 16 Database        │  │  │   • Environment schema        │  │
│  │   • 18 Relational Tables        │  │  └───────────────────────────────┘  │
│  └─────────────────────────────────┘  │                                     │
└───────────────────────────────────────┴─────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Domain                 | Technology           | Version   | Purpose                                                    |
| ---------------------- | -------------------- | --------- | ---------------------------------------------------------- |
| **Web Frontend**       | Next.js (App Router) | `15.5.25` | Server and client rendering with App Router architecture   |
| **UI Library**         | React                | `19.0.0`  | Declarative, component-driven user interfaces              |
| **Styling**            | Tailwind CSS         | `4.0.0`   | Modern `@theme` tokens, crisp borders, and subtle elevation|
| **Icons**              | Lucide React         | `^1.16.0` | Accessible, lightweight SVG icon system                    |
| **Backend Framework**  | NestJS               | `10.4.0`  | Modular, scalable enterprise TypeScript API architecture   |
| **Security & Headers** | Helmet               | `^8.0.0`  | HTTP security headers (XSS, clickjacking, MIME sniffing)   |
| **Rate Limiting**      | NestJS Throttler     | `^6.4.0`  | Brute force and denial-of-service prevention (100 req/min) |
| **Authentication**     | Passport.js + JWT    | `^10.2.0` | Stateless JWT token authorization with role guards         |
| **Password Hashing**   | Bcrypt.js            | `^2.4.3`  | Salted 10-round password hashing                           |
| **ORM**                | Prisma               | `5.19.0`  | Type-safe database modeling, relations, and migrations     |
| **Database**           | PostgreSQL           | `16`      | ACID-compliant relational data store with full-text search |
| **Validation**         | Class-Validator      | `^0.14.1` | Declarative runtime DTO schema enforcement                 |
| **API Documentation**  | Swagger / OpenAPI    | `^7.4.0`  | Interactive OpenAPI documentation at `/api/docs`           |
| **Monorepo Engine**    | Turborepo + pnpm     | `9.15.9`  | High-speed cached builds, linting, and dependency sharing  |

---

## 📂 Detailed File & Directory Blueprint

Below is the exhaustive inventory of the repository, detailing the responsibility and contents of each file and folder:

```
CampusPulse/
├── apps/
│   ├── api/                                → NestJS Backend REST API Application
│   │   ├── src/
│   │   │   ├── app.module.ts               → Root NestJS module; wires Config, Throttler, Common, and 15 feature modules
│   │   │   ├── main.ts                     → Application bootstrap; registers Helmet, CORS, Versioning (/v1), Swagger, and ValidationPipe
│   │   │   ├── common/                     → Shared backend infrastructure and cross-cutting concerns
│   │   │   │   ├── common.module.ts        → Exports shared guards, interceptors, and filters
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts → Custom parameter decorator extracting authenticated user context from Request
│   │   │   │   │   ├── public.decorator.ts       → Skips JWT guard checks for unauthenticated public routes
│   │   │   │   │   └── roles.decorator.ts        → Declares required RoleTypes for endpoint RBAC authorization
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts  → Standardizes HTTP and unexpected errors into uniform ApiErrorResponse JSON
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts         → Enforces valid Bearer JWT presence on protected endpoints
│   │   │   │   │   └── roles.guard.ts            → Inspects user roles against endpoint requirements (ADMIN, ORGANIZER)
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── transform.interceptor.ts  → Wraps successful controller responses into ApiResponse<T> envelope
│   │   │   │   └── strategies/
│   │   │   │       └── jwt.strategy.ts           → Passport JWT strategy validating token signatures and resolving user claims
│   │   │   ├── modules/                    → 15 Modular Feature Domains
│   │   │   │   ├── admin/                  → Central governance (user status, event review/reject, org verifications, reports, categories)
│   │   │   │   │   ├── admin.controller.ts → Endpoints for moderation queue, account suspension, and platform statistics
│   │   │   │   │   ├── admin.service.ts    → Business logic for platform metrics, report resolutions, and moderation
│   │   │   │   │   └── admin.module.ts     → Module bundling admin controllers and services
│   │   │   │   ├── auth/                   → User registration, password verification, JWT generation, and token refresh
│   │   │   │   │   ├── auth.controller.ts  → Endpoints for /auth/login, /auth/register, and /auth/me
│   │   │   │   │   ├── auth.service.ts     → User credential validation, bcrypt hashing, and JWT issuance
│   │   │   │   │   └── auth.module.ts      → Module configuring Passport, JwtModule, and auth dependencies
│   │   │   │   ├── bookmarks/              → Student opportunity bookmarks and personal saved lists
│   │   │   │   │   ├── bookmarks.controller.ts → Endpoints for toggling bookmarks and retrieving saved opportunities
│   │   │   │   │   └── bookmarks.service.ts    → Persistence logic for student bookmarked items
│   │   │   │   ├── categories/             → Opportunity taxonomy categories and discovery tags
│   │   │   │   │   ├── categories.controller.ts → Category listing and administrative category creation
│   │   │   │   │   └── categories.service.ts    → Category querying and indexing logic
│   │   │   │   ├── events/                 → Event creation, editing, status lifecycle, search, filtering, and view tracking
│   │   │   │   │   ├── events.controller.ts → Public discovery endpoints, organizer management routes, and view counter
│   │   │   │   │   └── events.service.ts    → Full-text search, status transitions (DRAFT -> PENDING_REVIEW -> PUBLISHED), and analytics
│   │   │   │   ├── faculties/              → Academic faculty and departmental structure under universities
│   │   │   │   │   ├── faculties.controller.ts → Endpoints retrieving faculties and departmental structures
│   │   │   │   │   └── faculties.service.ts    → Faculty and department querying logic
│   │   │   │   ├── health/                 → System health check and database connectivity diagnostic probes
│   │   │   │   │   ├── health.controller.ts→ Probe endpoint /health for uptime and database ping
│   │   │   │   │   └── health.service.ts   → Diagnostic checks against PostgreSQL connectivity
│   │   │   │   ├── notifications/          → Database-backed in-app notification center (7 event triggers)
│   │   │   │   │   ├── notifications.controller.ts → Feeds, unread counter, and mark-all-read actions
│   │   │   │   │   └── notifications.service.ts    → Creates event alerts, team requests, and deadline reminders
│   │   │   │   ├── organizations/          → Student clubs, societies, memberships, and leadership rosters
│   │   │   │   │   ├── organizations.controller.ts → Organization profiles, public rosters, and member roles
│   │   │   │   │   └── organizations.service.ts    → Club management, membership assignment, and status
│   │   │   │   ├── registrations/          → External registration click telemetry and RSVP tracking
│   │   │   │   │   ├── registrations.controller.ts → RSVP creation, cancellation, and ticket retrieval
│   │   │   │   │   └── registrations.service.ts    → Student registration persistence and organizer conversion math
│   │   │   │   ├── reports/                → Community safety, abuse reporting, and resolution workflow
│   │   │   │   │   ├── reports.controller.ts → Reporting endpoints for suspicious content
│   │   │   │   │   └── reports.service.ts    → Report creation, investigation status, and admin action notes
│   │   │   │   ├── teams/                  → Squad formation, vacancy roles, join requests, and deterministic matching
│   │   │   │   │   ├── teams.controller.ts → Team creation, recruitment listings, and join request actions
│   │   │   │   │   └── teams.service.ts    → Squad lifecycle and deterministic 0–100 compatibility formula
│   │   │   │   ├── universities/           → University directory, campus profiles, and domain validation
│   │   │   │   │   ├── universities.controller.ts → Directory listing and university campus profile retrieval
│   │   │   │   │   └── universities.service.ts    → Institutional hierarchy and domain matching
│   │   │   │   ├── users/                  → User account profiles, student skills, interests, and batch info
│   │   │   │   │   ├── users.controller.ts → Profile update endpoints and student details
│   │   │   │   │   └── users.service.ts    → Student academic affiliation, skills, and bio persistence
│   │   │   │   └── verification/           → Organization verification request submissions and document handling
│   │   │   │       ├── verification.controller.ts → Submission of verification credentials by student leaders
│   │   │   │       └── verification.service.ts    → Document logging and admin verification queue handling
│   │   │   └── prisma/
│   │   │       ├── prisma.module.ts        → Global Prisma service provider module
│   │   │       └── prisma.service.ts       → Extended PrismaClient managing database connection lifecycle
│   │   ├── test/                           → 9 Comprehensive Automated Test Suites (100% Pass Rate across 192 tests)
│   │   │   ├── admin-moderation-test.ts    → Tests 401/403 RBAC, account suspension, event approve/reject, and report resolution (22 tests)
│   │   │   ├── auth-test.ts                → Tests registration, password hashing, JWT claims, and login flows (32 tests)
│   │   │   ├── calendar-notifications-test.ts → Tests notification triggers, unread counters, and calendar matrix (18 tests)
│   │   │   ├── event-lifecycle-test.ts     → Tests DRAFT isolation, review transitions, and status updates (22 tests)
│   │   │   ├── event-search-filter-test.ts → Tests PostgreSQL full-text search and 9-dimension filtering (21 tests)
│   │   │   ├── organizer-dashboard-test.ts → Tests impression increments, conversion rates, and analytics (15 tests)
│   │   │   ├── student-features-test.ts    → Tests profiles, bookmarks, click tracking, and recommendation weighting (19 tests)
│   │   │   ├── team-finder-test.ts         → Tests 0–100 deterministic matching formula and squad lifecycle (25 tests)
│   │   │   └── university-org-test.ts      → Tests university hierarchy, club creation, and membership access (18 tests)
│   │   ├── package.json                    → Dependencies, build commands, and 9 test scripts
│   │   └── tsconfig.json                   → NestJS TypeScript compiler configuration
│   │
│   └── web/                                → Next.js 15 Web Application (App Router)
│       ├── src/
│       │   ├── app/                        → Next.js App Router Pages & Layouts
│       │   │   ├── layout.tsx              → Global root layout; registers Inter font, SkipLink, and AppProviders
│       │   │   ├── globals.css             → Production design system tokens, typography scales, and base utility classes
│       │   │   ├── page.tsx                → Public homepage with value headline, category showcase, and live opportunity feed
│       │   │   ├── explore/page.tsx        → Opportunity catalog with sticky filter sidebar, search bar, and mode toggles
│       │   │   ├── events/[slug]/page.tsx  → Detailed opportunity page with sticky action box, countdown, and organizer info
│       │   │   ├── universities/page.tsx   → National university directory with campus cards
│       │   │   ├── universities/[slug]/page.tsx → Campus profile showcasing affiliated faculties and student organizations
│       │   │   ├── organizations/[slug]/page.tsx → Student organization profile with upcoming opportunities and member roster
│       │   │   ├── login/page.tsx          → Dual student/organizer sign-in page with demo account autofill
│       │   │   ├── register/page.tsx       → Student registration page with accessible validation and password toggles
│       │   │   ├── forgot-password/page.tsx→ Password recovery form for account credential resets
│       │   │   ├── account/                → Authenticated Student Command Center
│       │   │   │   ├── page.tsx            → Student dashboard overview with recommendation cards and stats
│       │   │   │   ├── calendar/page.tsx   → Dual-view academic calendar (Upcoming Agenda List & Month Matrix)
│       │   │   │   ├── teams/page.tsx      → Team Finder directory with recruitment chips and squad creation modal
│       │   │   │   ├── teams/[id]/page.tsx → Squad detail page with roster, join requests, and member management
│       │   │   │   ├── saved/page.tsx      → Bookmarked opportunities grid with single-click bookmark removal
│       │   │   │   ├── registrations/page.tsx → RSVP tickets with cancellation modals and attendance status
│       │   │   │   ├── notifications/page.tsx → In-app notification center with read/unread tabs and mark-all-read
│       │   │   │   └── profile/page.tsx    → Student settings (academic affiliation, department, and account details)
│       │   │   ├── organizer/              → Authenticated Organizer Portal
│       │   │   │   ├── page.tsx            → Organizer overview with 5 KPI stat cards and verified organization banner
│       │   │   │   ├── events/page.tsx     → Event management table with status tabs, draft deletion, and reviews
│       │   │   │   ├── events/create/page.tsx → Opportunity creation wizard with eligibility, prizes, and dates
│       │   │   │   ├── events/[id]/page.tsx → Opportunity editor with moderation feedback alerts
│       │   │   │   ├── events/[id]/registrations/page.tsx → Attendee roster and registration telemetry
│       │   │   │   └── analytics/page.tsx  → Organizer engagement analytics with view-to-registration conversion
│       │   │   ├── admin/                  → Platform Governance & Moderation Console
│       │   │   │   ├── page.tsx            → Operations overview with platform statistics and moderation alerts
│       │   │   │   ├── events/page.tsx     → Moderation queue with review, approve, reject, and expiration scans
│       │   │   │   ├── organizations/page.tsx → Club verification request queue with document inspection
│       │   │   │   ├── universities/page.tsx → University hierarchy management and campus verification
│       │   │   │   ├── users/page.tsx      → User directory with search, role filters, and account suspend/enable toggle
│       │   │   │   └── reports/page.tsx    → Safety and policy abuse report resolution portal
│       │   │   └── (redirect shims)/       → Backward-compatibility redirects (/calendar, /teams, /saved, /notifications -> /account/*)
│       │   │
│       │   ├── components/                 → Modular Reusable UI Components
│       │   │   ├── layout/                 → Layout Shell & Navigation
│       │   │   │   ├── app-shell.tsx       → Root layout shell injecting sticky Header and Footer based on app area
│       │   │   │   ├── header.tsx          → 64px sticky navbar with glass backdrop, search pill, and contextual role links
│       │   │   │   ├── footer.tsx          → Multi-column institutional footer with quick links and operational status badge
│       │   │   │   ├── mobile-nav.tsx      → Responsive slide-out navigation drawer for mobile screens
│       │   │   │   ├── user-menu.tsx       → Dropdown user avatar menu with account links and sign-out action
│       │   │   │   └── subnav.tsx          → Secondary navigation strip for portal areas
│       │   │   ├── ui/                     → Base Accessible Design System Primitives
│       │   │   │   ├── button.tsx          → Accessible buttons with loading spinner support and 6 visual variants
│       │   │   │   ├── card.tsx            → Elevated card container with subtle 1px borders and hover interactions
│       │   │   │   ├── badge.tsx           → Semantic status badges (neutral, accent, success, warning, danger, info)
│       │   │   │   ├── empty-state.tsx     → Placeholder illustration with headline and actionable CTA button
│       │   │   │   ├── error-state.tsx     → Error boundary card with retry action
│       │   │   │   ├── page-header.tsx     → Standardized page title header with eyebrow and action slots
│       │   │   │   ├── modal.tsx           → Accessible modal dialog container with backdrop blur and escape dismissal
│       │   │   │   ├── drawer.tsx          → Slide-in drawer container for mobile filtering
│       │   │   │   ├── field.tsx           → Form field wrapper with label, helper text, and error indicators
│       │   │   │   ├── stat-card.tsx       → Metric counter card with icon and percentage changes
│       │   │   │   ├── skip-link.tsx       → Keyboard accessibility skip link to main content
│       │   │   │   ├── toast.tsx           → Non-intrusive feedback toast notifications
│       │   │   │   └── grid-skeleton.tsx   → Shimmer skeleton loading placeholder
│       │   │   ├── home/                   → Homepage Landing Page Sections
│       │   │   │   ├── hero.tsx            → Hero section with value headline, inline search bar, and live showcase
│       │   │   │   ├── category-section.tsx→ Taxonomy cards for Hackathons, Workshops, Conferences, and Competitions
│       │   │   │   ├── featured-events.tsx → Live curated opportunities with price tags and deadline badges
│       │   │   │   ├── value-section.tsx   → Core value proposition cards for students and organizations
│       │   │   │   └── cta-section.tsx     → Call-to-action banner driving student registration
│       │   │   ├── events/                 → Event Browsing & Discovery Components
│       │   │   │   ├── event-card.tsx      → Opportunity card with deadline badges, price tags, and institution info
│       │   │   │   ├── event-action-box.tsx→ Sticky registration card with deadline countdown and RSVP action
│       │   │   │   ├── filter-sidebar.tsx  → Desktop multi-filter sidebar with categories, modes, and dates
│       │   │   │   ├── filter-drawer.tsx   → Mobile responsive filter drawer overlay
│       │   │   │   └── active-filter-chips.tsx → Selected filter pills with single-click removal
│       │   │   ├── teams/                  → Squad Collaboration Components
│       │   │   │   ├── team-card.tsx       → Squad card showing seeking roles, required skills, and slots available
│       │   │   │   ├── create-team-modal.tsx → Modal dialog for creating competition teams and seeking roles
│       │   │   │   └── join-team-modal.tsx → Modal dialog for submitting applicant join requests to team leaders
│       │   │   ├── university-card.tsx     → Campus card displaying institution logo, location, and faculty count
│       │   │   └── providers.tsx           → Global React Context providers (AuthContext, ToastProvider)
│       │   │
│       │   ├── services/                   → Typed API Client Services (Fetch Wrapper)
│       │   │   ├── admin.service.ts        → Client calls for governance, platform moderation, and statistics
│       │   │   ├── auth.service.ts         → Client calls for login, registration, profile updates, and JWT session
│       │   │   ├── bookmarks.service.ts    → Client calls for bookmarking opportunities and saved lists
│       │   │   ├── events.service.ts       → Client calls for opportunity catalog, search, creation, and telemetry
│       │   │   ├── notifications.service.ts→ Client calls for in-app alerts and mark-as-read actions
│       │   │   ├── organizations.service.ts→ Client calls for club profiles, verification requests, and rosters
│       │   │   ├── registrations.service.ts→ Client calls for RSVP actions, ticket retrieval, and click tracking
│       │   │   ├── teams.service.ts        → Client calls for squad listings, requests, and member management
│       │   │   └── universities.service.ts → Client calls for university directory and campus profiles
│       │   │
│       │   └── lib/                        → Frontend Utilities & Context
│       │       ├── api/client.ts           → Typed fetch wrapper with Bearer token injection and error parsing
│       │       ├── auth/auth-context.tsx   → React Auth context provider exposing user session and login/logout
│       │       ├── navigation.ts           → Route resolver detecting active portal area and navbar highlights
│       │       └── cn.ts                   → ClassName merge utility combining conditional Tailwind classes
│       │
│       ├── package.json                    → Frontend dependencies (Next.js 15, React 19, Tailwind CSS 4)
│       └── next.config.ts                  → Next.js configuration with remote image host patterns
│
├── packages/                               → Shared Monorepo Packages
│   ├── types/                              → Central TypeScript Contracts & Interfaces
│   │   ├── src/index.ts                    → Exports User, Event, Team, Verification, Notification, and Admin data models
│   │   └── package.json                    → Package manifest (`@campuspulse/types`)
│   ├── validation/                         → DTO Schemas & Validation Rules
│   │   ├── src/index.ts                    → Re-exports validation schemas and helper functions
│   │   └── package.json                    → Package manifest (`@campuspulse/validation`)
│   ├── shared/                             → Core Domain Constants & Algorithms
│   │   ├── src/
│   │   │   ├── constants/index.ts          → Platform constants (pagination bounds, defaults, rate limits)
│   │   │   ├── enums/index.ts              → Shared enums (RoleType, EventStatus, EventMode, OrgStatus, ReportStatus)
│   │   │   └── index.ts                    → Deterministic 0–100 squad compatibility matching formula
│   │   └── package.json                    → Package manifest (`@campuspulse/shared`)
│   ├── database/                           → Prisma ORM & Database Layer
│   │   ├── prisma/
│   │   │   ├── schema.prisma               → 18-model PostgreSQL relational schema with indexes and cascade rules
│   │   │   └── seed.ts                     → Comprehensive seed script populating universities, clubs, events, and users
│   │   ├── src/index.ts                    → Exports configured Prisma client instances
│   │   └── package.json                    → Scripts: db:generate, db:push, db:migrate, db:seed, db:studio
│   ├── config/                             → Environment Configuration Utilities
│   │   ├── src/index.ts                    → Typed environment configuration loader and parser
│   │   └── package.json                    → Package manifest (`@campuspulse/config`)
│   ├── eslint-config/                      → Shared ESLint configurations across Next.js and NestJS
│   └── typescript-config/                  → Shared tsconfig.json presets (base, next, nest)
│
├── docs/                                   → Technical Documentation Library
│   ├── architecture.md                     → System architecture, data flow, RBAC, and telemetry specifications
│   ├── database.md                         → Complete entity-relationship documentation, tables, and constraints
│   ├── development.md                      → Local development quickstart, tools, and developer workflows
│   ├── deployment.md                       → Production deployment runbook for Docker, PostgreSQL, API, and Web
│   ├── mvp-readiness-report.md             → Official MVP Beta Readiness Report with security & technical debt audit
│   └── roadmap.md                          → Long-term platform roadmap (mobile apps, ML recommendations, payments)
│
├── docker/                                 → Docker Infrastructure
│   └── docker-compose.yml                  → Local PostgreSQL 16 container definitions with health checks
│
├── .env.example                            → Environment variable template with documentation
├── .gitignore                              → Git ignore rules for node_modules, build outputs, and secrets
├── .prettierrc                             → Prettier formatting rules
├── package.json                            → Monorepo workspace root package.json with Turbo pipeline scripts
├── pnpm-workspace.yaml                     → pnpm workspace member directory definitions
└── turbo.json                              → Turborepo build, lint, and test pipeline configuration
```

---

## 🗄️ Database Architecture (Prisma ORM)

The PostgreSQL database encompasses **18 strongly-typed relational models** designed for performance, referential integrity, and cascading lifecycle management:

```mermaid
erDiagram
    User ||--o{ UserRole : has
    Role ||--o{ UserRole : defines
    User ||--o| StudentProfile : owns
    University ||--o{ Faculty : contains
    Faculty ||--o{ Department : contains
    University ||--o{ Organization : hosts
    Organization ||--o{ OrganizationMember : rosters
    User ||--o{ OrganizationMember : joins
    Organization ||--o{ Event : organizes
    Category ||--o{ Event : classifies
    Event ||--o{ EventRegistration : logs
    User ||--o{ EventRegistration : registers
    Event ||--o{ Bookmark : tracks
    User ||--o{ Bookmark : saves
    Event ||--o{ Team : hosts
    Team ||--o{ TeamMember : rosters
    User ||--o{ TeamMember : participates
    Team ||--o{ TeamJoinRequest : receives
    User ||--o{ TeamJoinRequest : requests
    User ||--o{ Notification : receives
    Organization ||--o{ Verification : requests
    User ||--o{ Report : submits
```

### Relational Entity Overview

| Model                | Purpose                                                                                     | Key Relations & Cascades                                                    |
| -------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `User`               | Platform account credentials, email verification, and suspension status                     | Has many `roles`, `bookmarks`, `registrations`, `notifications`             |
| `Role` / `UserRole`  | RBAC assignment (`STUDENT`, `ORGANIZER`, `ADMIN`, `SUPER_ADMIN`, etc.)                      | Join table linking `User` and `Role` (`onDelete: Cascade`)                  |
| `StudentProfile`     | Extended student profile (university, faculty, department, batch, skills, career interests) | Belongs to `User` (`onDelete: Cascade`)                                     |
| `University`         | Verified higher educational institutions                                                    | Has many `faculties`, `organizations`, and students                         |
| `Faculty`            | Academic faculties within universities (e.g., Faculty of Engineering)                       | Belongs to `University` (`onDelete: Cascade`)                               |
| `Department`         | Academic departments under faculties (e.g., Computer Science & Engineering)                 | Belongs to `Faculty` (`onDelete: Cascade`)                                  |
| `Organization`       | Student clubs, academic societies, and corporate partner bodies                             | Belongs to `University`, has many `events`, `members`, `verifications`      |
| `OrganizationMember` | Member and leadership rosters (`LEADER`, `MANAGER`, `MEMBER`)                               | Links `Organization` and `User` (`onDelete: Cascade`)                       |
| `Category`           | Opportunity categories (`HACKATHON`, `WORKSHOP`, `CONFERENCE`, etc.) with `isActive` toggle | Classifies opportunities                                                    |
| `Event`              | Central opportunity record (title, slug, mode, dates, prizes, view count, status)           | Belongs to `Organization` and `Category`, has many `registrations`, `teams` |
| `EventRegistration`  | External registration click tracking and attendance logs                                    | Links `Event` and `User` (`onDelete: Cascade`)                              |
| `Bookmark`           | Student saved opportunities with unique compound indexes                                    | Links `Event` and `User` (`onDelete: Cascade`)                              |
| `Team`               | Hackathon/competition squads with vacancy roles and capacity bounds                         | Belongs to `Event`, has many `members`, `joinRequests`                      |
| `TeamMember`         | Active members in a squad with assigned roles (`LEADER`, `MEMBER`)                          | Links `Team` and `User` (`onDelete: Cascade`)                               |
| `TeamJoinRequest`    | Applicant submissions to squads with `PENDING`, `ACCEPTED`, `REJECTED` states               | Links `Team` and `User` (`onDelete: Cascade`)                               |
| `Notification`       | Database-backed student alerts (7 notification triggers)                                    | Belongs to `User` (`onDelete: Cascade`)                                     |
| `Verification`       | Organization credential verification documents and approvals                                | Belongs to `Organization`, reviewed by admin `User`                         |
| `Report`             | Abuse and safety reports submitted by community members                                     | Relates to `Event` or `Organization`, reviewed by admin                     |

---

## 🧠 Core Algorithms & Business Logic

### 1. Deterministic Team Compatibility Matching (0–100 Score)

Rather than relying on unpredictable AI models, CampusPulse calculates teammate compatibility deterministically using a weighted multi-factor formula implemented in `apps/api/src/modules/teams`:

$$\text{Score} = \text{Event Match (30\%)} + \text{Skill Overlap (30\%)} + \text{Role Need (15\%)} + \text{Availability (10\%)} + \text{Interests (10\%)} + \text{Experience (5\%)}$$

- **Event Match (30 pts)**: Awarded when the student is registered or bookmarked for the specific competition.
- **Skill Overlap (30 pts)**: Ratio of required squad skills possessed by the student candidate.
- **Role Alignment (15 pts)**: Full points if the candidate fills a vacant required squad role (e.g. Frontend, Backend, UI/UX).
- **Availability (10 pts)**: Zero points if the candidate is already in a full squad; full points if available.
- **Interests Overlap (10 pts)**: Overlap between squad category tags and student career interests.
- **Batch / Experience (5 pts)**: Experience level matching senior/junior requirements.

### 2. Rule-Based Opportunity Recommendations

Personalized student recommendations rank opportunities by scoring:

- **University Affiliation Match**: Opportunities hosted on the student's campus receive top priority.
- **Skill Compatibility**: Matching opportunity skill tags with the student profile's skills array.
- **Career Interest Tags**: Overlap between student career interests and opportunity categories.
- **Upcoming Deadline Urgency**: Promotes opportunities with nearest closing dates to the top of the feed.

### 3. Real-Time Conversion & Impression Telemetry

- Atomic incrementation on `Event.viewCount` upon opportunity page visits (`POST /api/v1/events/:id/view`).
- Organizer conversion formula:
  $$\text{Conversion Rate} = \left( \frac{\text{Total Registration Clicks}}{\text{Total Opportunity Views}} \right) \times 100\%$$

### 4. Concluded Events Expiration Scanner

An automated database scanner transitions concluded events where `endDate < now()` from `PUBLISHED` to `EXPIRED` status, ensuring students never see outdated opportunities in public feeds.

---

## 🛡️ Security Architecture & Protections

- **Rate Limiting Protection**: `@nestjs/throttler` throttles rapid calls to 100 requests per minute per IP, preventing brute-force login attacks and web scraping.
- **HTTP Security Headers**: `helmet` enforces `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and removes `X-Powered-By`.
- **Strict DTO Validation**: NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` rejects unexpected fields, eliminating mass-assignment vulnerabilities.
- **RBAC Authorization**: Route-level `@Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)` guards enforce authorization at the controller layer. Non-admin users are strictly rejected (`403 Forbidden`).
- **Data Isolation**: Public discovery endpoints explicitly enforce `where: { status: EventStatus.PUBLISHED }`, guaranteeing unpublished drafts and rejected events are never exposed to students.
- **SQL Injection Immunization**: Prisma ORM utilizes parameterized query drivers across all database transactions.

---

## 🌐 Next.js Web App Route Map

The web client provides **comprehensive, responsive SaaS routes**:

| Route                                  | Role / Access     | Description                                                                     |
| -------------------------------------- | ----------------- | ------------------------------------------------------------------------------- |
| `/`                                    | Public            | Homepage showcasing live opportunities, categories, and university partners     |
| `/explore`                             | Public / Students | Multi-dimensional search engine with category pills, mode toggles, and filters  |
| `/events/[slug]`                       | Public / Students | Comprehensive event details, countdown, eligibility, and registration button    |
| `/universities`                        | Public            | National directory of verified Sri Lankan universities                          |
| `/universities/[slug]`                 | Public            | University campus profile, faculties, departments, and active student clubs     |
| `/organizations/[slug]`                | Public            | Student club public portal with leadership roster and hosted events             |
| `/login`                               | Public            | Authentication gateway with demo account quick-fill options                     |
| `/register`                            | Public            | New student onboarding with accessible form validation                          |
| `/forgot-password`                     | Public            | Password recovery form for account credential reset instructions                |
| `/account`                             | Student (Auth)    | Student command center with recommendations, saved opportunities, and metrics   |
| `/account/calendar`                    | Student (Auth)    | Dual-view interactive calendar (Upcoming List & Month Matrix) with deadlines    |
| `/account/teams`                       | Student (Auth)    | Team Finder hub displaying squads, compatibility scores, and join request modal |
| `/account/teams/[id]`                  | Student (Auth)    | Squad detail console with member roster, join requests, and management tools    |
| `/account/saved`                       | Student (Auth)    | Personal bookmark manager with single-click bookmark removal                    |
| `/account/registrations`               | Student (Auth)    | RSVP tickets with cancellation modals and attendance status                     |
| `/account/notifications`               | Student (Auth)    | Database-backed notifications feed with unread filters and mark-all-read        |
| `/account/profile`                     | Student (Auth)    | Student profile editor for academic affiliation, department, and account info   |
| `/organizer`                           | Organizer (Auth)  | Organizer portal with 5 KPI stat cards, verified banner, and recent events      |
| `/organizer/events`                    | Organizer (Auth)  | Organizer event catalog with status tabs, draft deletion, and reviews           |
| `/organizer/events/create`             | Organizer (Auth)  | Event creation wizard with category, dates, mode, prizes, and eligibility       |
| `/organizer/events/[id]`               | Organizer (Auth)  | Event editor with moderation feedback notices and inline update form            |
| `/organizer/events/[id]/registrations` | Organizer (Auth)  | Attendee roster and registration telemetry with student details                 |
| `/organizer/analytics`                 | Organizer (Auth)  | Engagement analytics with view counters and conversion rate charts              |
| `/admin`                               | Administrator     | Central operations console with platform stats and moderation alert banner      |
| `/admin/events`                        | Administrator     | Moderation review queue with rejection notes and past event expiration scan     |
| `/admin/organizations`                 | Administrator     | Club verification queue with official endorsement document review               |
| `/admin/universities`                  | Administrator     | Institutional hierarchy management and campus verification                      |
| `/admin/users`                         | Administrator     | User directory with search, role filters, and account suspend/enable toggle     |
| `/admin/reports`                       | Administrator     | Safety and abuse report resolution portal with moderator action notes           |

---

## 🧪 Automated Testing Suite

CampusPulse contains **9 automated backend test suites** achieving a **100% pass rate across 192 unit and integration tests**:

```bash
# Run all 9 test suites sequentially
pnpm --filter @campuspulse/api test
```

### Individual Test Suites

```bash
# 1. Authentication & RBAC Security Suite (32 tests)
pnpm --filter @campuspulse/api test:auth

# 2. Universities & Organizations Suite (18 tests)
pnpm --filter @campuspulse/api test:university-org

# 3. Core Event Lifecycle Suite (22 tests)
pnpm --filter @campuspulse/api test:event

# 4. PostgreSQL Search & Filtering Suite (21 tests)
pnpm --filter @campuspulse/api test:search

# 5. Student Features & Recommendations (19 tests)
pnpm --filter @campuspulse/api test:student

# 6. Calendar & Notifications Suite (18 tests)
pnpm --filter @campuspulse/api test:calendar-notifications

# 7. Team Finder Compatibility Matching (25 tests)
pnpm --filter @campuspulse/api test:team-finder

# 8. Organizer Dashboard & Analytics (15 tests)
pnpm --filter @campuspulse/api test:organizer

# 9. Admin Governance & Moderation (22 tests)
pnpm --filter @campuspulse/api test:admin
```

---

## 🚀 How to Run This Project (Quick Start & Setup)

Follow this step-by-step guide to clone, configure, initialize, and run CampusPulse on your local machine.

### 1. System Prerequisites

Ensure the following tools are installed on your workstation:

- **Node.js**: `v20.0.0` or higher (`node -v`)
- **pnpm**: `v9.0.0` or higher (`pnpm -v`) — Install via `npm install -g pnpm`
- **Docker Desktop**: Recommended for local PostgreSQL 16 containerization (`docker -v`)  
  _(Alternative: A local native PostgreSQL 16 installation)_
- **Git**: For source version control (`git -v`)

---

### 2. Step-by-Step Installation & Setup

#### Step 1: Clone the Repository & Enter Project Root

```bash
git clone <repo-url>
cd CampusPulse
```

#### Step 2: Install Workspace Dependencies

Install all dependencies across all monorepo applications and shared packages (`@campuspulse/types`, `@campuspulse/validation`, `@campuspulse/shared`, `@campuspulse/database`, `@campuspulse/config`):

```bash
pnpm install
```

#### Step 3: Configure Environment Variables

Create your local `.env` file from the provided `.env.example` template:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS / Linux / Git Bash:
cp .env.example .env

# On Windows Command Prompt (cmd):
copy .env.example .env
```

The pre-configured default values in `.env` work out-of-the-box for local development:

```env
DATABASE_URL=postgresql://campuspulse:campuspulse@localhost:5432/campuspulse
POSTGRES_USER=campuspulse
POSTGRES_PASSWORD=campuspulse
POSTGRES_DB=campuspulse
POSTGRES_PORT=5432
API_PORT=4000
API_PREFIX=api
NEXT_PUBLIC_API_URL=http://localhost:4000/api
JWT_SECRET=change-this-in-development
JWT_EXPIRES_IN=7d
JWT_EXPIRATION=7d
NODE_ENV=development
```

#### Step 4: Start the PostgreSQL Database

**Option A: Using Docker Compose (Recommended)**

Start the background PostgreSQL 16 container:

```bash
docker compose up -d
```

_(Or use `docker compose -f docker/docker-compose.yml up -d`)_

Verify that the database container is running and healthy:

```bash
docker compose ps
```

**Option B: Using Native Local PostgreSQL (If Not Using Docker)**

If you prefer using an existing PostgreSQL instance installed on your machine:

1. Ensure PostgreSQL is running on port `5432`.
2. Create a database named `campuspulse`:
   ```sql
   CREATE DATABASE campuspulse;
   ```
3. Update `DATABASE_URL` in your `.env` file with your local username and password.

#### Step 5: Generate Prisma Client & Push Database Schema

Generate the strongly-typed Prisma Client and synchronize the 18 relational schema models with PostgreSQL:

```bash
# 1. Generate Prisma Client
pnpm db:generate

# 2. Push schema to database (creates all 18 tables, enums, relations, and indexes)
pnpm db:push
```

_(Tip: You can also run `pnpm db:migrate` to create and apply Prisma migration files)._

#### Step 6: Populate Seed Data

Populate the database with realistic sample universities (Colombo, Moratuwa, Peradeniya), academic faculties, departments, active student organizations (IEEE, ACM, Rotaract, FOSS), categories, live flagship opportunities (MoraHack 2026, Colombo CodeSprint), squads, and notifications:

```bash
pnpm db:seed
```

#### Step 7: Start Development Servers

Start both the **NestJS REST API** and the **Next.js Web Frontend** concurrently using Turborepo:

```bash
pnpm dev
```

Turborepo will automatically launch:

- **NestJS API** on `http://localhost:4000/api/v1`
- **Next.js Web Client** on `http://localhost:3000`

---

### 3. Running Services Independently

If you wish to run only a specific part of the stack in separate terminals:

| Task                    | Command                              | Description                                              |
| :---------------------- | :----------------------------------- | :------------------------------------------------------- |
| **Run Everything**      | `pnpm dev`                           | Starts NestJS API and Next.js Web concurrently           |
| **Run API Only**        | `pnpm --filter @campuspulse/api dev` | Runs NestJS server in watch mode on port 4000            |
| **Run Web Only**        | `pnpm --filter @campuspulse/web dev` | Runs Next.js server on port 3000                         |
| **Prisma Studio (GUI)** | `pnpm db:studio`                     | Launches web database browser on `http://localhost:5555` |
| **Build All**           | `pnpm build`                         | Compiles packages and creates production builds          |
| **Lint All**            | `pnpm lint`                          | Runs ESLint across all workspaces                        |
| **Format Code**         | `pnpm format`                        | Auto-formats code with Prettier                          |
| **Format Check**        | `pnpm format:check`                  | Checks formatting without modifying files                |

---

### 4. Service Endpoints & Local URLs

Once the dev servers are running, access the services via your web browser:

| Service                      | Local URL                                                                  | Description                                             |
| :--------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------ |
| **Web Frontend (Home)**      | [http://localhost:3000](http://localhost:3000)                             | Public landing page & featured opportunities            |
| **Explore Opportunities**    | [http://localhost:3000/explore](http://localhost:3000/explore)             | Search catalog with filter sidebar and mode toggles     |
| **University Directory**     | [http://localhost:3000/universities](http://localhost:3000/universities)   | Directory of verified Sri Lankan universities           |
| **Student Command Center**   | [http://localhost:3000/account](http://localhost:3000/account)             | Student portal with opportunity metrics and quick links |
| **Academic Calendar**        | [http://localhost:3000/account/calendar](http://localhost:3000/account/calendar) | Monthly calendar with opportunity deadlines       |
| **Campus Team Finder**       | [http://localhost:3000/account/teams](http://localhost:3000/account/teams) | Squad discovery with 0–100 compatibility math           |
| **Organizer Portal**         | [http://localhost:3000/organizer](http://localhost:3000/organizer)         | Event management & impression conversion KPI cards      |
| **Admin Console**            | [http://localhost:3000/admin](http://localhost:3000/admin)                 | Platform moderation, user directory, verification queue |
| **Sign In**                  | [http://localhost:3000/login](http://localhost:3000/login)                 | Dual student/organizer authentication page              |
| **Registration**             | [http://localhost:3000/register](http://localhost:3000/register)           | Student account creation                                |
| **Password Reset**           | [http://localhost:3000/forgot-password](http://localhost:3000/forgot-password) | Password recovery form                              |
| **NestJS REST API**          | [http://localhost:4000/api/v1](http://localhost:4000/api/v1)               | Base API endpoint                                       |
| **Interactive Swagger Docs** | [http://localhost:4000/api/docs](http://localhost:4000/api/docs)           | Interactive OpenAPI testing console                     |
| **API Health Probe**         | [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health) | System and database connectivity check                  |
| **Prisma Studio (GUI)**      | [http://localhost:5555](http://localhost:5555)                             | Visual database table inspector (`pnpm db:studio`)      |

---

### 5. Demo Credentials

The database seed provides ready-to-use accounts for all roles:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Student** | `ayesha.fernando@student.uoc.test` | `StudentPass123!` | `/account`, `/account/*` |
| **Organizer** | `kasun.organizer@ieee.uom.test` | `OrganizerPass123!` | `/organizer`, `/organizer/*` |
| **Platform Administrator** | `superadmin@campuspulse.test` | `AdminPass123!` | `/admin`, `/admin/*` |

*(Tip: On the [login page](http://localhost:3000/login), clicking **"Autofill demo"** immediately populates sample student credentials).*

---

### 6. Stopping the Services & Database Reset

- **Stop Development Servers**: Press `Ctrl + C` in the terminal running `pnpm dev`.
- **Stop PostgreSQL Container**:
  ```bash
  docker compose down
  ```
- **Complete Clean Reset (Wipe Database Volume & Re-seed)**:
  ```bash
  # 1. Stop container and delete PostgreSQL volume
  docker compose down -v

  # 2. Restart fresh PostgreSQL container
  docker compose up -d

  # 3. Push schema and re-populate seed data
  pnpm db:push
  pnpm db:seed
  ```

---

### 7. 🛠️ Troubleshooting & FAQ

#### Q1: `Error: bind: address already in use` (Port 5432)

- **Cause**: Another PostgreSQL instance is already running on port 5432 on your host machine.
- **Fix (Windows)**: Stop the host PostgreSQL service via Windows Services (`services.msc`) or run:
  ```powershell
  net stop postgresql-x64-16
  # or postgresql-x64-18 depending on your installed version
  ```
- **Fix (macOS/Linux)**:
  ```bash
  sudo systemctl stop postgresql   # Linux
  brew services stop postgresql    # macOS
  ```
- **Alternative Fix**: Change `POSTGRES_PORT=5433` in `.env` and update `DATABASE_URL` to `postgresql://campuspulse:campuspulse@localhost:5433/campuspulse`.

#### Q2: `Cannot find module '@prisma/client'` or type errors

- **Cause**: Prisma Client has not been generated for your active schema.
- **Fix**: Run:
  ```bash
  pnpm db:generate
  ```

#### Q3: Database connection refused during `pnpm db:push`

- **Cause**: The PostgreSQL Docker container is still initializing or starting up.
- **Fix**: Wait a few seconds until the healthcheck turns green (`docker compose ps` shows `(healthy)`), then re-run `pnpm db:push`.

#### Q4: Next.js cannot connect to API (`Failed to fetch`)

- **Cause**: Either the NestJS API is not running or `NEXT_PUBLIC_API_URL` is misconfigured.
- **Fix**: Ensure `pnpm dev` is running and verify `NEXT_PUBLIC_API_URL=http://localhost:4000/api` exists in your `.env`.

---

## ⚙️ Environment Variables Reference

| Variable              | Description                       | Default                                                           | Production Advice                  |
| --------------------- | --------------------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string      | `postgresql://campuspulse:campuspulse@localhost:5432/campuspulse` | Use SSL and connection pooling     |
| `API_PORT`            | NestJS server port                | `4000`                                                            | Typically 4000 or 8080             |
| `API_PREFIX`          | Base REST prefix                  | `api`                                                             | Leave as `api`                     |
| `NEXT_PUBLIC_API_URL` | API URL accessible by web browser | `http://localhost:4000/api`                                       | Point to production domain         |
| `JWT_SECRET`          | Secret key for signing JWT tokens | `change-this-in-development`                                      | Use high-entropy 64-char key       |
| `JWT_EXPIRATION`      | Token validity duration           | `7d`                                                              | Configure based on security policy |
| `NODE_ENV`            | Application environment           | `development`                                                     | Set to `production`                |

---

## 📚 Technical Documentation Directory

For in-depth architectural and operational guides, consult the `docs/` library:

- **[docs/architecture.md](file:///d:/CampusPulse/docs/architecture.md)**: Architectural diagrams, RBAC hierarchies, data flow, and telemetry models.
- **[docs/database.md](file:///d:/CampusPulse/docs/database.md)**: Entity-relationship details, column dictionaries, and constraints.
- **[docs/development.md](file:///d:/CampusPulse/docs/development.md)**: Developer workflow, local scripts, and troubleshooting tips.
- **[docs/deployment.md](file:///d:/CampusPulse/docs/deployment.md)**: Docker containerization, AWS/Vercel production guide, and migration runbook.
- **[docs/mvp-readiness-report.md](file:///d:/CampusPulse/docs/mvp-readiness-report.md)**: Executive MVP Beta Readiness Report with audit findings.
- **[docs/roadmap.md](file:///d:/CampusPulse/docs/roadmap.md)**: Feature roadmap for post-MVP phases (React Native mobile apps, payments, ML).

---

## 📄 License

Private — All rights reserved. CampusPulse Core Team.
