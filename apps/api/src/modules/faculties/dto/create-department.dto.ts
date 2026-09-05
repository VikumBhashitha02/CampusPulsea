import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'cl123facultyId' })
  @IsString()
  @IsNotEmpty()
  facultyId!: string;

  @ApiProperty({ example: 'Department of Computer Science' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'computer-science' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'DCS' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Algorithms, Software Engineering, AI' })
  @IsOptional()
  @IsString()
  description?: string;
}
