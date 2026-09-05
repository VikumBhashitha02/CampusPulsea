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
import { UniversitiesService } from './universities.service';
import { QueryUniversitiesDto } from './dto/query-universities.dto';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '@campuspulse/types';

@ApiTags('Universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List and search universities with pagination' })
  @SwaggerApiResponse({ status: 200, description: 'List of universities' })
  findAll(@Query() query: QueryUniversitiesDto) {
    return this.universitiesService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get university profile by unique slug' })
  @SwaggerApiResponse({ status: 200, description: 'University details' })
  @SwaggerApiResponse({ status: 404, description: 'University not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.universitiesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get university profile by ID' })
  @SwaggerApiResponse({ status: 200, description: 'University details' })
  @SwaggerApiResponse({ status: 404, description: 'University not found' })
  findById(@Param('id') id: string) {
    return this.universitiesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new university (SUPER_ADMIN only)' })
  @SwaggerApiResponse({ status: 201, description: 'University registered' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden: SUPER_ADMIN required' })
  create(@Body() dto: CreateUniversityDto) {
    return this.universitiesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update university information (SUPER_ADMIN or authorized UNIVERSITY_ADMIN)' })
  @SwaggerApiResponse({ status: 200, description: 'University updated' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: UpdateUniversityDto,
  ) {
    return this.universitiesService.update(id, userId, userRoles, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a university (SUPER_ADMIN only)' })
  @SwaggerApiResponse({ status: 200, description: 'University deleted' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    return this.universitiesService.delete(id, userId, userRoles);
  }
}
