import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType, VerificationStatus, ReportStatus } from '@campuspulse/types';
import {
  QueryAdminUsersDto,
  UpdateUserStatusDto,
  QueryAdminEventsDto,
  RejectAdminEventDto,
  RespondVerificationDto,
  ResolveReportDto,
  CreateAdminCategoryDto,
  UpdateAdminCategoryDto,
} from './dto/admin.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ---------------------------------------------------------------------------
  // 1. Stats & Overview
  // ---------------------------------------------------------------------------

  @Get('stats')
  @ApiOperation({ summary: 'Get global platform statistics (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Platform statistics' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden: requires ADMIN or SUPER_ADMIN role' })
  getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('moderation-overview')
  @ApiOperation({ summary: 'Get pending reports and verification queue (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Pending moderation queue items' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden: requires ADMIN or SUPER_ADMIN role' })
  getModerationOverview() {
    return this.adminService.getPendingModeration();
  }

  // ---------------------------------------------------------------------------
  // 2. User Management
  // ---------------------------------------------------------------------------

  @Get('users')
  @ApiOperation({ summary: 'List and filter platform users (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'User directory' })
  findAllUsers(@Query() query: QueryAdminUsersDto) {
    return this.adminService.findAllUsers(query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Enable or disable a user account (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Account status updated' })
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(id, dto.isActive);
  }

  // ---------------------------------------------------------------------------
  // 3. Event Moderation
  // ---------------------------------------------------------------------------

  @Get('events')
  @ApiOperation({ summary: 'List opportunities across all statuses (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Events list' })
  findAllEvents(@Query() query: QueryAdminEventsDto) {
    return this.adminService.findAllEvents(query);
  }

  @Post('events/:id/approve')
  @ApiOperation({ summary: 'Approve and publish a pending event (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Event approved' })
  approveEvent(@Param('id') id: string) {
    return this.adminService.approveEvent(id);
  }

  @Post('events/:id/reject')
  @ApiOperation({ summary: 'Reject a pending event with feedback (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Event rejected' })
  rejectEvent(@Param('id') id: string, @Body() dto: RejectAdminEventDto) {
    return this.adminService.rejectEvent(id, dto.reason);
  }

  @Post('events/:id/cancel')
  @ApiOperation({ summary: 'Cancel a published event (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Event cancelled' })
  cancelEvent(@Param('id') id: string) {
    return this.adminService.cancelEvent(id);
  }

  @Post('events/detect-expired')
  @ApiOperation({ summary: 'Transition past events to EXPIRED status (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Scan completed' })
  detectExpiredEvents() {
    return this.adminService.detectAndExpireEvents();
  }

  // ---------------------------------------------------------------------------
  // 4. Organization Verification
  // ---------------------------------------------------------------------------

  @Get('organizations/verifications')
  @ApiOperation({ summary: 'List organization verification requests (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Verification queue' })
  findVerifications(@Query('status') status?: VerificationStatus) {
    return this.adminService.findVerificationRequests(status);
  }

  @Post('organizations/verifications/:id/respond')
  @ApiOperation({ summary: 'Approve or reject organization verification (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Verification decision recorded' })
  respondVerification(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: RespondVerificationDto,
  ) {
    return this.adminService.respondVerificationRequest(
      id,
      reviewerId,
      dto.status,
      dto.reviewNotes,
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Reports Management
  // ---------------------------------------------------------------------------

  @Get('reports')
  @ApiOperation({ summary: 'List user-submitted reports (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Reports list' })
  findAllReports(@Query('status') status?: ReportStatus) {
    return this.adminService.findAllReports(status);
  }

  @Patch('reports/:id/resolve')
  @ApiOperation({
    summary: 'Resolve or dismiss a report with action notes (Admin/SuperAdmin only)',
  })
  @SwaggerApiResponse({ status: 200, description: 'Report resolved' })
  resolveReport(@Param('id') id: string, @Body() dto: ResolveReportDto) {
    return this.adminService.resolveReport(id, dto.status, dto.actionNotes);
  }

  // ---------------------------------------------------------------------------
  // 6. Category Management
  // ---------------------------------------------------------------------------

  @Get('categories')
  @ApiOperation({
    summary: 'List all categories with active/inactive state (Admin/SuperAdmin only)',
  })
  @SwaggerApiResponse({ status: 200, description: 'Categories list' })
  findAllCategories() {
    return this.adminService.findAllCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create new opportunity category (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 201, description: 'Category created' })
  createCategory(@Body() dto: CreateAdminCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category or toggle active state (Admin/SuperAdmin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Category updated' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateAdminCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }
}
