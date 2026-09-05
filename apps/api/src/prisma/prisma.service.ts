import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@campuspulse/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL via Prisma');
    } catch {
      this.logger.warn(
        'PostgreSQL is not yet reachable. Start database container with: docker compose -f docker/docker-compose.yml up -d',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
