# CampusPulse Project Roadmap

This document outlines the phased development plan for **CampusPulse**. Each phase builds strictly on the foundations established in previous phases.

---

## Phase Status Summary

- [x] **Phase 1: Project foundation** _(Current)_
  - Monorepo structure with pnpm workspaces + Turborepo
  - Next.js 15 (App Router, Tailwind CSS 4, TypeScript strict)
  - NestJS 10 REST API with Swagger, health check, global validation
  - Shared packages: `@campuspulse/types`, `@campuspulse/validation`, `@campuspulse/config`, `@campuspulse/database`
  - Docker Compose for PostgreSQL 16 & pgAdmin
  - Documentation and developer onboarding

- [ ] **Phase 2: Database architecture**
  - Full relational PostgreSQL schema modeling
  - Universities, faculties, departments, organizations
  - User profiles (student, organizer, faculty, admin)
  - Opportunities, categories, tags, deadlines, venues
  - Prisma migrations and seed scripts

- [ ] **Phase 3: Backend foundation**
  - Standardized error handling filters and response interceptors
  - Logging middleware and correlation IDs
  - Pagination, sorting, and filtering pipes
  - Email service adapter scaffolding

- [ ] **Phase 4: Authentication and authorization**
  - JWT authentication & refresh tokens
  - Password hashing (Argon2 / bcrypt)
  - Role-based access control (RBAC) guards
  - University email verification flow

- [ ] **Phase 5: Universities, faculties, departments and organizations**
  - University directory and structural hierarchy
  - Student association and club profiles
  - Organization verification and member management

- [ ] **Phase 6: Event management**
  - Event creation, drafting, publishing, lifecycle
  - RSVP and registration workflows
  - Venue, ticketing, and capacity constraints

- [ ] **Phase 7: Public website and discovery**
  - High-converting landing page
  - Public opportunity catalog and discovery feed
  - SEO optimization and OpenGraph tags

- [ ] **Phase 8: Search and filtering**
  - Full-text search across opportunities
  - Multi-faceted filters (category, date, university, type)
  - Sorting and quick tags

- [ ] **Phase 9: Student features**
  - Student dashboard & profile customization
  - Bookmarking, saved opportunities, personalized feeds
  - Application status tracking

- [ ] **Phase 10: Calendar and notifications**
  - Academic & event calendar sync (iCal / Google Calendar)
  - In-app notification center & web push notifications

- [ ] **Phase 11: Team Finder**
  - Hackathon & project teammate discovery
  - Skill badges, team listings, and join requests

- [ ] **Phase 12: Organizer dashboard**
  - Opportunity publishing and analytics
  - Attendee roster management and CSV export

- [ ] **Phase 13: Admin dashboard and moderation**
  - Platform-wide moderation queue
  - User and organization verification approval
  - System audit logs

- [ ] **Phase 14: MVP testing and launch**
  - End-to-end testing
  - Production deployment configurations
  - Beta launch to university pilot cohorts

- [ ] **Phase 15: React Native mobile application**
  - Expo-based mobile app for iOS and Android
  - Consuming the shared NestJS API
  - Push notifications and offline caching

- [ ] **Phase 16: Research and scholarship modules**
  - Faculty research position board
  - Financial aid and grant discovery

- [ ] **Phase 17: Internship, job and company modules**
  - Verified employer accounts
  - Campus hiring and job listing feeds

- [ ] **Phase 18: Monetization**
  - Featured event placements
  - Premium organization tiers

- [ ] **Phase 19: AI and advanced recommendations**
  - Opportunity matching based on student interest vector embeddings
  - Smart deadline reminders and schedule optimization
