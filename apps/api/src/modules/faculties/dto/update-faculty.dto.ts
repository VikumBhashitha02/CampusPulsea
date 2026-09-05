import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFacultyDto {
  @ApiPropertyOptional({ example: 'Faculty of Science' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'science' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'FOS' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Biological and Physical Sciences' })
  @IsOptional()
  @IsString()
  description?: string;
}
