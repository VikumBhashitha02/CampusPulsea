import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 4000);
  const prefix = configService.get<string>('API_PREFIX', 'api');

  // Global prefix: /api
  app.setGlobalPrefix(prefix);

  // API Versioning: /api/v1/...
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Swagger / OpenAPI specification
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CampusPulse API')
    .setDescription('Unified REST API for the CampusPulse university opportunities platform')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter your JWT token',
    })
    .addTag('Health', 'System diagnostics & connectivity check')
    .addTag('Auth', 'Authentication & user session management')
    .addTag('Users', 'User accounts & student profiles')
    .addTag('Universities', 'Institutions directory & academic structure')
    .addTag('Faculties', 'Faculties within universities')
    .addTag('Departments', 'Academic departments under faculties')
    .addTag('Organizations', 'Student clubs, societies, and partner bodies')
    .addTag('Categories', 'Opportunity categorization and tags')
    .addTag('Events', 'Opportunity catalog & event management')
    .addTag('Registrations', 'Event registrations & RSVPs')
    .addTag('Bookmarks', 'Saved opportunities & favorites')
    .addTag('Teams', 'Team finder, rosters & join requests')
    .addTag('Notifications', 'User notification center')
    .addTag('Reports', 'Content moderation & abuse reporting')
    .addTag('Verification', 'Organization & faculty credential verification')
    .addTag('Admin', 'Platform administration & system metrics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    customSiteTitle: 'CampusPulse API Docs',
  });
  // Also keep default /api alias for quick access
  SwaggerModule.setup(prefix, app, document);

  await app.listen(port);

  console.log(`🚀 CampusPulse API listening on: http://localhost:${port}/${prefix}/v1`);
  console.log(`📚 Swagger Documentation:        http://localhost:${port}/${prefix}/docs`);
}

bootstrap();
