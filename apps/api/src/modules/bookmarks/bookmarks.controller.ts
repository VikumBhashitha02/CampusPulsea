import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { ToggleBookmarkDto } from './dto/toggle-bookmark.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Bookmarks')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Save or unsave an opportunity to personal bookmarks' })
  @SwaggerApiResponse({ status: 200, description: 'Bookmark toggled' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  toggle(@CurrentUser('id') userId: string, @Body() dto: ToggleBookmarkDto) {
    return this.bookmarksService.toggle(userId, dto.eventId);
  }

  @Get('my')
  @ApiOperation({ summary: 'List all opportunities saved by authenticated student' })
  @SwaggerApiResponse({ status: 200, description: 'List of bookmarked events' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  findMyBookmarks(@CurrentUser('id') userId: string) {
    return this.bookmarksService.findUserBookmarks(userId);
  }
}
