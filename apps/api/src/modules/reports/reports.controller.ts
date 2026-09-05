import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an abuse or moderation report' })
  @SwaggerApiResponse({ status: 201, description: 'Report filed successfully' })
  create(@Query('userId') userId: string, @Body() dto: CreateReportDto) {
    return this.reportsService.create(userId || 'seed-student-placeholder', dto);
  }

  @Get()
  @ApiOperation({ summary: 'List recent reports for admin review' })
  @SwaggerApiResponse({ status: 200, description: 'List of moderation reports' })
  findAll() {
    return this.reportsService.findAll();
  }
}
