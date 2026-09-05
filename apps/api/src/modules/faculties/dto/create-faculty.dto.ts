import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({ example: 'cl123universityId' })
  @IsString()
  @IsNotEmpty()
  universityId!: string;

  @ApiProperty({ example: 'Faculty of Science' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'science' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'FOS' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Biological and Physical Sciences' })
  @IsOptional()
  @IsString()
  description?: string;
}
