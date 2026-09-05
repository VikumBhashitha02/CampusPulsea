import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class RequestVerificationDto {
  @ApiProperty({ example: 'cl12345org' })
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @ApiPropertyOptional({ example: 'https://docs.campuspulse.test/constitution.pdf' })
  @IsOptional()
  @IsUrl()
  documentUrl?: string;

  @ApiPropertyOptional({ example: 'Official letter from University Student Affairs Director' })
  @IsOptional()
  @IsString()
  notes?: string;
}
