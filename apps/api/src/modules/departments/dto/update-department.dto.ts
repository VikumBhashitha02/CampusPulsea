import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Department of Computer Science & Engineering' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'CSE' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'cse' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Updated department description' })
  @IsOptional()
  @IsString()
  description?: string;
}
