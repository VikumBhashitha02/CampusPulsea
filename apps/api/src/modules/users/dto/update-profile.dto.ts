import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Student first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Student last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Profile avatar image URL' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'University ID' })
  @IsOptional()
  @IsString()
  universityId?: string;

  @ApiPropertyOptional({ description: 'Faculty ID' })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Student ID or registration number' })
  @IsOptional()
  @IsString()
  studentIdNumber?: string;

  @ApiPropertyOptional({ description: 'Batch intake year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  batchYear?: number;

  @ApiPropertyOptional({ description: 'Short student biography' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'GitHub profile URL' })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'Personal portfolio or website URL' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Array of technical skills', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Array of student interests', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({
    description: 'Array of career interests and target roles',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  careerInterests?: string[];
}
