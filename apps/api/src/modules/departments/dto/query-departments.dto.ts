import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryDepartmentsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter departments by faculty ID' })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiPropertyOptional({ description: 'Filter departments by university ID' })
  @IsOptional()
  @IsString()
  universityId?: string;
}
