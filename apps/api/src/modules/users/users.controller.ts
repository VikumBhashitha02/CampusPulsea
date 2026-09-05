import { Controller, Get, Param, Patch, Put, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List user accounts with pagination' })
  @SwaggerApiResponse({ status: 200, description: 'Paginated user list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated student profile' })
  @SwaggerApiResponse({ status: 200, description: 'Authenticated student profile' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current authenticated student profile' })
  @SwaggerApiResponse({ status: 200, description: 'Profile updated' })
  updateMyProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Partially update current student profile' })
  @SwaggerApiResponse({ status: 200, description: 'Profile updated' })
  patchMyProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @SwaggerApiResponse({ status: 200, description: 'User profile and roles' })
  @SwaggerApiResponse({ status: 404, description: 'User not found' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update student profile information by ID' })
  @SwaggerApiResponse({ status: 200, description: 'Profile updated' })
  updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(id, dto);
  }
}
