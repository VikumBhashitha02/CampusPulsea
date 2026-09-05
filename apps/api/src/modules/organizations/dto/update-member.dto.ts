import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrgMemberRole } from '@campuspulse/types';

export class UpdateOrganizationMemberDto {
  @ApiPropertyOptional({ enum: OrgMemberRole })
  @IsOptional()
  @IsEnum(OrgMemberRole)
  role?: OrgMemberRole;

  @ApiPropertyOptional({ example: 'Vice President', description: 'Updated title' })
  @IsOptional()
  @IsString()
  title?: string;
}
