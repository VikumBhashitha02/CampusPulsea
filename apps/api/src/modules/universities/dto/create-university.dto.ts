import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUniversityDto {
  @ApiProperty({ example: 'University of Colombo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'uoc' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'UOC' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Colombo' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiPropertyOptional({ example: 'https://cmb.ac.lk' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'cmb.ac.lk' })
  @IsOptional()
  @IsString()
  domain?: string;
}
