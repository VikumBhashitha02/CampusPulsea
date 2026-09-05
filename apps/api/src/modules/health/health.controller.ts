import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerApiResponse, ApiTags } from '@nestjs/swagger';
import type { ApiResponse, HealthStatus } from '@campuspulse/types';
import { APP_CONFIG } from '@campuspulse/config';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'System diagnostics & service health check' })
  @SwaggerApiResponse({ status: 200, description: 'API health status' })
  async check(): Promise<ApiResponse<HealthStatus>> {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      // Light query to verify connection
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        version: APP_CONFIG.version,
        environment: process.env.NODE_ENV || 'development',
        services: {
          api: 'running',
          database: dbStatus,
        },
      },
    };
  }
}
