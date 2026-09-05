import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { EventMode, EventStatus } from '@campuspulse/types';

export class QueryEventsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by university slug' })
  @IsOptional()
  @IsString()
  universitySlug?: string;

  @ApiPropertyOptional({ description: 'Filter by university ID' })
  @IsOptional()
  @IsString()
  universityId?: string;

  @ApiPropertyOptional({ description: 'Filter by faculty ID' })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ enum: EventMode, description: 'Filter by event mode' })
  @IsOptional()
  @IsEnum(EventMode)
  mode?: EventMode;

  @ApiPropertyOptional({ enum: EventStatus, description: 'Filter by event status' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ description: 'Only show featured events' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Filter events starting on or after this ISO date' })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter events starting on or before this ISO date' })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Convenience date preset filter',
    enum: ['all', 'today', 'this_week', 'this_month', 'upcoming'],
  })
  @IsOptional()
  @IsIn(['all', 'today', 'this_week', 'this_month', 'upcoming'])
  datePreset?: 'all' | 'today' | 'this_week' | 'this_month' | 'upcoming';

  @ApiPropertyOptional({
    description: 'Filter opportunities whose registration deadline has not passed',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  registrationOpenOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter by free or paid opportunities' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by required skill(s) (comma-separated or single skill)',
  })
  @IsOptional()
  @IsString()
  skills?: string;
}
