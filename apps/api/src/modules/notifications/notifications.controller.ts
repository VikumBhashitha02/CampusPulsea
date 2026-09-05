import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationType } from '@campuspulse/types';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notification feed with unread count' })
  @SwaggerApiResponse({ status: 200, description: 'Notification items' })
  findForUser(
    @CurrentUser('id') userId: string,
    @Query('type') type?: NotificationType,
    @Query('isRead') isRead?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.findForUser(userId, {
      type,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications for badge indicator' })
  @SwaggerApiResponse({ status: 200, description: 'Unread notification count' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @SwaggerApiResponse({ status: 200, description: 'Notification marked read' })
  markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  @SwaggerApiResponse({ status: 200, description: 'All notifications marked read' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
