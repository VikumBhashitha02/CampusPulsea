import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { OrgStatus, OrgType } from '@campuspulse/types';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'IEEE Student Branch of University of Moratuwa' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Updated club description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: OrgType })
  @IsOptional()
  @IsEnum(OrgType)
  type?: OrgType;

  @ApiPropertyOptional({ enum: OrgStatus })
  @IsOptional()
  @IsEnum(OrgStatus)
  status?: OrgStatus;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/banner.png' })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: 'contact@ieee-uom.lk' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://ieee.uom.lk' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/ieee_uom' })
  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/ieee-uom' })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;
}
