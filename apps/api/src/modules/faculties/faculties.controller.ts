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
import { FacultiesService } from './faculties.service';
import { QueryFacultiesDto } from './dto/query-faculties.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '@campuspulse/types';

@ApiTags('Faculties')
@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  // ---------------------------------------------------------------------------
  // Faculty Endpoints
  // ---------------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'List and search all faculties with pagination' })
  @SwaggerApiResponse({ status: 200, description: 'List of faculties' })
  findAll(@Query() query: QueryFacultiesDto) {
    return this.facultiesService.findAll(query);
  }

  @Get('university/:universityId')
  @ApiOperation({ summary: 'List faculties and department counters for a university' })
  @SwaggerApiResponse({ status: 200, description: 'List of faculties' })
  findByUniversity(@Param('universityId') universityId: string) {
    return this.facultiesService.findByUniversity(universityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get faculty details and departments' })
  @SwaggerApiResponse({ status: 200, description: 'Faculty details' })
  @SwaggerApiResponse({ status: 404, description: 'Faculty not found' })
  findById(@Param('id') id: string) {
    return this.facultiesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new faculty under a university (Admin only)' })
  @SwaggerApiResponse({ status: 201, description: 'Faculty created' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  createFaculty(
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: CreateFacultyDto,
  ) {
    return this.facultiesService.createFaculty(userId, userRoles, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update faculty details (Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Faculty updated' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  updateFaculty(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: UpdateFacultyDto,
  ) {
    return this.facultiesService.updateFaculty(id, userId, userRoles, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a faculty (Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Faculty deleted' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  deleteFaculty(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    return this.facultiesService.deleteFaculty(id, userId, userRoles);
  }

  // ---------------------------------------------------------------------------
  // Department Endpoints
  // ---------------------------------------------------------------------------

  @Get(':id/departments')
  @ApiOperation({ summary: 'List all departments under a faculty' })
  @SwaggerApiResponse({ status: 200, description: 'List of departments' })
  findDepartments(@Param('id') id: string) {
    return this.facultiesService.findDepartmentsByFaculty(id);
  }

  @Get('department/:id')
  @ApiOperation({ summary: 'Get department details and academic structure' })
  @SwaggerApiResponse({ status: 200, description: 'Department details' })
  @SwaggerApiResponse({ status: 404, description: 'Department not found' })
  findDepartmentById(@Param('id') id: string) {
    return this.facultiesService.findDepartmentById(id);
  }

  @Post('department')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new academic department (Admin only)' })
  @SwaggerApiResponse({ status: 201, description: 'Department created' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  createDepartment(
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.facultiesService.createDepartment(userId, userRoles, dto);
  }

  @Patch('department/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update department details (Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Department updated' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  updateDepartment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.facultiesService.updateDepartment(id, userId, userRoles, dto);
  }
}

