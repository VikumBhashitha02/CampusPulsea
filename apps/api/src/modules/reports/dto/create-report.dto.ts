import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportTarget } from '@campuspulse/types';

export class CreateReportDto {
  @ApiProperty({ enum: ReportTarget, example: ReportTarget.EVENT })
  @IsEnum(ReportTarget)
  targetType!: ReportTarget;

  @ApiProperty({ example: 'cl123456target' })
  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @ApiProperty({ example: 'Misleading event information or spam' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ example: 'The date in the description does not match the banner.' })
  @IsOptional()
  @IsString()
  details?: string;
}
