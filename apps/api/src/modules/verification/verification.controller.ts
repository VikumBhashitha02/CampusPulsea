import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { RequestVerificationDto } from './dto/request-verification.dto';

@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('request')
  @ApiOperation({ summary: 'Submit an organization or club verification application' })
  @SwaggerApiResponse({ status: 201, description: 'Application submitted' })
  submitRequest(@Query('userId') userId: string, @Body() dto: RequestVerificationDto) {
    return this.verificationService.submitRequest(userId || 'seed-organizer-placeholder', dto);
  }

  @Get('status/:organizationId')
  @ApiOperation({ summary: 'Check verification review status for an organization' })
  @SwaggerApiResponse({ status: 200, description: 'Verification status' })
  getStatus(@Param('organizationId') organizationId: string) {
    return this.verificationService.getStatus(organizationId);
  }
}
