import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { OrgType } from '@campuspulse/types';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'IEEE Student Branch of University of Moratuwa' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ieee-uom' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ example: 'cl12345678' })
  @IsOptional()
  @IsString()
  universityId?: string;

  @ApiPropertyOptional({ enum: OrgType, default: OrgType.STUDENT_CLUB })
  @IsOptional()
  @IsEnum(OrgType)
  type?: OrgType;

  @ApiPropertyOptional({ description: 'Club description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://ieee.uom.lk' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;
}
