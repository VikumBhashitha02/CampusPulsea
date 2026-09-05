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
import { DepartmentsService } from './departments.service';
import { QueryDepartmentsDto } from './dto/query-departments.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleType } from '@campuspulse/types';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List and search academic departments with pagination and filters' })
  @SwaggerApiResponse({ status: 200, description: 'Departments list' })
  findAll(@Query() query: QueryDepartmentsDto) {
    return this.departmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department details by ID' })
  @SwaggerApiResponse({ status: 200, description: 'Department details' })
  @SwaggerApiResponse({ status: 404, description: 'Department not found' })
  findById(@Param('id') id: string) {
    return this.departmentsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new academic department (Admin only)' })
  @SwaggerApiResponse({ status: 201, description: 'Department created' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden: requires ADMIN role' })
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(userId, userRoles, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update department details (Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Department updated' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden: requires ADMIN role' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, userId, userRoles, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a department (Admin only)' })
  @SwaggerApiResponse({ status: 200, description: 'Department deleted' })
  @SwaggerApiResponse({ status: 403, description: 'Forbidden' })
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    return this.departmentsService.delete(id, userId, userRoles);
  }
}

