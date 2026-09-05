import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Department of Computer Science & Engineering' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'CSE' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'cse' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'fac-uom-eng-123' })
  @IsString()
  @IsNotEmpty()
  facultyId!: string;

  @ApiPropertyOptional({
    example: 'Department specializing in software engineering, systems, and AI',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
