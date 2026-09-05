import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { OrgStatus, OrgType } from '@campuspulse/types';

export class QueryOrganizationsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by university ID' })
  @IsOptional()
  @IsString()
  universityId?: string;

  @ApiPropertyOptional({ enum: OrgType, description: 'Filter by organization category type' })
  @IsOptional()
  @IsEnum(OrgType)
  type?: OrgType;

  @ApiPropertyOptional({ enum: OrgStatus, description: 'Filter by approval status' })
  @IsOptional()
  @IsEnum(OrgStatus)
  status?: OrgStatus;
}
