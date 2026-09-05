import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrgMemberRole } from '@campuspulse/types';

export class AddOrganizationMemberDto {
  @ApiProperty({ example: 'cl12345userId', description: 'User ID of the member to add' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiPropertyOptional({ enum: OrgMemberRole, default: OrgMemberRole.MEMBER })
  @IsOptional()
  @IsEnum(OrgMemberRole)
  role?: OrgMemberRole;

  @ApiPropertyOptional({
    example: 'Lead Backend Engineer',
    description: 'Officer or committee title',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
