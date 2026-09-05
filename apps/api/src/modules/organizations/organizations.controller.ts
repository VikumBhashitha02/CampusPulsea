import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
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
import { OrganizationsService } from './organizations.service';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddOrganizationMemberDto } from './dto/add-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '@campuspulse/types';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // ---------------------------------------------------------------------------
  // Organization Endpoints
  // ---------------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'List and filter student clubs, societies, and campus organizations' })
  @SwaggerApiResponse({ status: 200, description: 'List of organizations' })
  findAll(@Query() query: QueryOrganizationsDto) {
    return this.organizationsService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get organization profile and events by slug' })
  @SwaggerApiResponse({ status: 200, description: 'Organization profile' })
  @SwaggerApiResponse({ status: 404, description: 'Organization not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.organizationsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization profile by ID' })
  @SwaggerApiResponse({ status: 200, description: 'Organization profile' })
  @SwaggerApiResponse({ status: 404, description: 'Organization not found' })
  findById(@Param('id') id: string) {
    return this.organizationsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ORGANIZER, RoleType.UNIVERSITY_ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new campus organization or club' })
  @SwaggerApiResponse({ status: 201, description: 'Organization created' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(userId, userRoles, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organization profile (Leader/Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Organization updated' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden: Cannot modify another organization' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, userId, userRoles, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete organization (Leader/Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Organization deleted' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    return this.organizationsService.delete(id, userId, userRoles);
  }

  // ---------------------------------------------------------------------------
  // Organization Member Endpoints
  // ---------------------------------------------------------------------------

  @Get(':id/members')
  @ApiOperation({ summary: 'List committee officers and members for an organization' })
  @SwaggerApiResponse({ status: 200, description: 'Member roster' })
  findMembers(@Param('id') id: string) {
    return this.organizationsService.findMembers(id);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a student or officer to the organization (Leader/Admin only)' })
  @SwaggerApiResponse({ status: 201, description: 'Member added' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  addMember(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: AddOrganizationMemberDto,
  ) {
    return this.organizationsService.addMember(id, userId, userRoles, dto);
  }

  @Patch(':id/members/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update member role or executive title (Leader/Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Member updated' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  updateMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: UpdateOrganizationMemberDto,
  ) {
    return this.organizationsService.updateMember(id, memberId, userId, userRoles, dto);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a member from the organization (Leader/Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Member removed' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    return this.organizationsService.removeMember(id, memberId, userId, userRoles);
  }
}
