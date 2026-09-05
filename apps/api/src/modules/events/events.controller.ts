import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { QueryEventsDto } from './dto/query-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RejectEventDto } from './dto/reject-event.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType, RegistrationStatus } from '@campuspulse/types';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ---------------------------------------------------------------------------
  // Public & Student Endpoints (Strictly PUBLISHED events only)
  // ---------------------------------------------------------------------------

  @Get()
  @ApiOperation({
    summary: 'Discover published opportunities, hackathons, and university events',
    description:
      'Public endpoint strictly returning events in PUBLISHED status with multi-criteria filters.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Filtered published events list' })
  findAll(@Query() query: QueryEventsDto) {
    return this.eventsService.findAll(query);
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Personalized rule-based event recommendations for authenticated student',
    description:
      'Scores published opportunities using university matching, skills overlap, and student interest affinities.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Personalized recommended events list' })
  getRecommendations(@CurrentUser('id') userId: string, @Query('limit') limit?: number) {
    return this.eventsService.getRecommendations(userId, limit ? Number(limit) : 6);
  }

  @Get('deadlines')
  @ApiOperation({
    summary: 'Upcoming registration deadlines',
    description: 'Returns published opportunities with nearest registration cutoff dates.',
  })
  @SwaggerApiResponse({ status: 200, description: 'List of events with impending deadlines' })
  getUpcomingDeadlines(@Query('limit') limit?: number) {
    return this.eventsService.getUpcomingDeadlines(limit ? Number(limit) : 6);
  }

  @Get('calendar')
  @ApiOperation({
    summary: 'Aggregated student calendar schedule',
    description:
      'Provides event dates, registration deadlines, and marks user saved & registered statuses for the specified month.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Calendar schedule entries' })
  getCalendar(
    @CurrentUser('id') userId?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.eventsService.getCalendar(
      userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save opportunity to personal bookmarks' })
  @SwaggerApiResponse({ status: 200, description: 'Bookmark saved' })
  @SwaggerApiResponse({ status: 404, description: 'Event not found or not published' })
  bookmark(@Param('id') eventId: string, @CurrentUser('id') userId: string) {
    return this.eventsService.bookmark(userId, eventId);
  }

  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove opportunity from personal bookmarks' })
  @SwaggerApiResponse({ status: 200, description: 'Bookmark removed' })
  unbookmark(@Param('id') eventId: string, @CurrentUser('id') userId: string) {
    return this.eventsService.unbookmark(userId, eventId);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Track event registration / external organizer link click',
    description:
      'Tracks student, event ID, status, and timestamp. Returns external URL if present for seamless redirect.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Registration click tracked' })
  trackRegistration(
    @Param('id') eventId: string,
    @CurrentUser('id') userId: string,
    @Body('notes') notes?: string,
  ) {
    return this.eventsService.trackRegistration(userId, eventId, notes);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get public event details and open teams by unique slug',
    description:
      'Drafts, pending reviews, and rejected events are strictly inaccessible to the public.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Event details' })
  @SwaggerApiResponse({ status: 404, description: 'Event not found or not published' })
  findBySlug(@Param('slug') slug: string, @CurrentUser() user?: { id: string; roles: string[] }) {
    return this.eventsService.findBySlug(slug, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get event details by ID',
    description:
      'Drafts, pending reviews, and rejected events are strictly inaccessible to unauthorized public users.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Event details' })
  @SwaggerApiResponse({ status: 404, description: 'Event not found or not published' })
  findById(@Param('id') id: string, @CurrentUser() user?: { id: string; roles: string[] }) {
    return this.eventsService.findById(id, user);
  }

  // ---------------------------------------------------------------------------
  // Organizer Endpoints
  // ---------------------------------------------------------------------------

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new opportunity in DRAFT status (Organizer/Admin only)' })
  @SwaggerApiResponse({ status: 201, description: 'Event created in DRAFT status' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(userId, userRoles, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event details (Hosting organizer or Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Event updated' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden: You do not own this event' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, userId, userRoles, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a DRAFT event (Organizer/Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Event deleted' })
  @SwaggerApiResponse({ status: 400, description: 'Bad Request: Only DRAFT events can be deleted' })
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    return this.eventsService.deleteDraft(id, userId, userRoles);
  }

  @Delete(':id/draft')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete a DRAFT event (Organizer/Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Draft deleted' })
  @SwaggerApiResponse({ status: 400, description: 'Bad Request: Only DRAFT events can be deleted' })
  deleteDraft(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    return this.eventsService.deleteDraft(id, userId, userRoles);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a DRAFT or REJECTED event for administrative moderation' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Event submitted for review (status: PENDING_REVIEW)',
  })
  @SwaggerApiResponse({ status: 400, description: 'Bad Request' })
  submit(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    return this.eventsService.submitForReview(id, userId, userRoles);
  }

  @Post(':id/submit-review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a DRAFT or REJECTED event for administrative moderation' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Event submitted for review (status: PENDING_REVIEW)',
  })
  @SwaggerApiResponse({ status: 400, description: 'Bad Request' })
  submitForReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    return this.eventsService.submitForReview(id, userId, userRoles);
  }

  @Get('organizer/my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'View all events hosted by current organizer across all statuses' })
  @SwaggerApiResponse({ status: 200, description: 'Organizer events list' })
  findOrganizerEvents(
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Query('organizationId') organizationId?: string,
  ) {
    return this.eventsService.findOrganizerEvents(userId, userRoles, organizationId);
  }

  @Get('organizer/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organizer aggregate and per-event engagement analytics' })
  @SwaggerApiResponse({ status: 200, description: 'Organizer analytics data' })
  getOrganizerAnalytics(
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Query('organizationId') organizationId?: string,
  ) {
    return this.eventsService.getOrganizerAnalytics(userId, userRoles, organizationId);
  }

  @Get(':id/registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List student registrations for an opportunity (Organizer or Admin)' })
  @SwaggerApiResponse({ status: 200, description: 'Opportunity registrations with summary' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions for this organization' })
  findEventRegistrations(
    @Param('id') eventId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Query('status') status?: RegistrationStatus,
    @Query('search') search?: string,
  ) {
    return this.eventsService.findEventRegistrations(eventId, userId, userRoles, status, search);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment opportunity page impression view count' })
  @SwaggerApiResponse({ status: 200, description: 'View count incremented' })
  incrementViewCount(@Param('id') id: string) {
    return this.eventsService.incrementViewCount(id);
  }

  // ---------------------------------------------------------------------------
  // Admin Moderation Endpoints
  // ---------------------------------------------------------------------------

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all events awaiting approval in PENDING_REVIEW status (Admin only)',
  })
  @SwaggerApiResponse({ status: 200, description: 'Pending review queue' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  findPendingEvents(@Query() query: PaginationQueryDto) {
    return this.eventsService.findPendingEvents(query);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve event submission and publish to students (Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Event approved and PUBLISHED' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  approveEvent(@Param('id') id: string) {
    return this.eventsService.approveEvent(id);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject event submission with explanation (Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Event REJECTED with recorded reason' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  rejectEvent(@Param('id') id: string, @Body() dto: RejectEventDto) {
    return this.eventsService.rejectEvent(id, dto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a published opportunity (Organizer or Admin)' })
  @SwaggerApiResponse({ status: 200, description: 'Event CANCELLED' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  cancelEvent(@Param('id') id: string) {
    return this.eventsService.cancelEvent(id);
  }
}
