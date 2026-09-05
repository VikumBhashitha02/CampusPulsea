import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryFacultiesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter faculties by university ID' })
  @IsOptional()
  @IsString()
  universityId?: string;
}
