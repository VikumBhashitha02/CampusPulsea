import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { EventMode, EventStatus } from '@campuspulse/types';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'cl1234category' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'cl123university' })
  @IsOptional()
  @IsString()
  universityId?: string;

  @ApiPropertyOptional({ example: 'cl123faculty' })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiPropertyOptional({ example: 'cl123department' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'MoraHack 2026: National Inter-University Hackathon' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'morahack-2026' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ example: 'A 24-hour national hackathon for student innovators.' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Full event markdown description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: EventMode })
  @IsOptional()
  @IsEnum(EventMode)
  mode?: EventMode;

  @ApiPropertyOptional({ example: 'Civil Auditorium, University of Moratuwa' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Civil Auditorium' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ example: 'https://meet.campuspulse.test/morahack-2026' })
  @IsOptional()
  @IsUrl()
  meetingUrl?: string;

  @ApiPropertyOptional({ example: '2026-10-15T09:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-10-16T18:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ example: '2026-10-01T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationDeadline?: Date;

  @ApiPropertyOptional({
    example: 'Undergraduate students currently enrolled in Sri Lankan universities',
  })
  @IsOptional()
  @IsString()
  eligibility?: string;

  @ApiPropertyOptional({ example: 'Teams of 3 to 4 students' })
  @IsOptional()
  @IsString()
  teamSize?: string;

  @ApiPropertyOptional({ type: [String], example: ['AI', 'React', 'Node.js', 'Python'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ example: 'Cash prize pool of Rs. 1,000,000' })
  @IsOptional()
  @IsString()
  prizeInfo?: string;

  @ApiPropertyOptional({ example: 'Certificate of Participation' })
  @IsOptional()
  @IsString()
  certificateInfo?: string;

  @ApiPropertyOptional({ example: 'https://morahack.lk/register' })
  @IsOptional()
  @IsUrl()
  registrationUrl?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/cover.png' })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 'events@ieee.uom.lk' })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
