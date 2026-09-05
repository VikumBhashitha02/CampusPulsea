import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { UniversitiesModule } from './modules/universities/universities.module';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { EventsModule } from './modules/events/events.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { TeamsModule } from './modules/teams/teams.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { VerificationModule } from './modules/verification/verification.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Global environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // Global rate limiting (100 requests per minute per IP)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Global cross-cutting filter & interceptor module
    CommonModule,

    // Core database module
    PrismaModule,

    // Domain feature modules
    HealthModule,
    AuthModule,
    UsersModule,
    UniversitiesModule,
    FacultiesModule,
    DepartmentsModule,
    OrganizationsModule,
    CategoriesModule,
    EventsModule,
    RegistrationsModule,
    BookmarksModule,
    TeamsModule,
    NotificationsModule,
    ReportsModule,
    VerificationModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
