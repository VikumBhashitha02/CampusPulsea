import { IsString, IsBoolean, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RoleType,
  EventStatus,
  VerificationStatus,
  ReportStatus,
  OpportunityCategoryType,
} from '@campuspulse/types';

export class QueryAdminUsersDto {
  @ApiPropertyOptional({ description: 'Search by user name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RoleType, description: 'Filter by role' })
  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class UpdateUserStatusDto {
  @ApiProperty({ description: 'Account active flag (false to suspend/disable)' })
  @IsBoolean()
  isActive!: boolean;
}

export class QueryAdminEventsDto {
  @ApiPropertyOptional({ enum: EventStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ description: 'Search in event title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class RejectAdminEventDto {
  @ApiProperty({ description: 'Reason for event rejection returned to organizer' })
  @IsString()
  reason!: string;
}

export class RespondVerificationDto {
  @ApiProperty({ enum: [VerificationStatus.APPROVED, VerificationStatus.REJECTED] })
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;

  @ApiPropertyOptional({ description: 'Review notes / explanation' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class ResolveReportDto {
  @ApiProperty({ enum: [ReportStatus.RESOLVED, ReportStatus.DISMISSED] })
  @IsEnum(ReportStatus)
  status!: ReportStatus;

  @ApiPropertyOptional({ description: 'Action notes recorded by moderator' })
  @IsOptional()
  @IsString()
  actionNotes?: string;
}

export class CreateAdminCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Unique category URL slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ enum: OpportunityCategoryType, default: OpportunityCategoryType.OTHER })
  @IsOptional()
  @IsEnum(OpportunityCategoryType)
  type?: OpportunityCategoryType;

  @ApiPropertyOptional({ description: 'Brief description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Lucide icon identifier' })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateAdminCategoryDto {
  @ApiPropertyOptional({ description: 'Category name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Brief description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Lucide icon identifier' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Category active state (deactivate to hide)' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
