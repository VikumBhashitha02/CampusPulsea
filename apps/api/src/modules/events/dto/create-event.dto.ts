import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { EventMode } from '@campuspulse/types';

export class CreateEventDto {
  @ApiProperty({ example: 'cl1234organization', description: 'Hosting organization ID' })
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @ApiProperty({ example: 'cl1234category', description: 'Opportunity category ID' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ example: 'cl123university', description: 'Optional host university ID' })
  @IsOptional()
  @IsString()
  universityId?: string;

  @ApiPropertyOptional({ example: 'cl123faculty', description: 'Optional host faculty ID' })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiPropertyOptional({ example: 'cl123department', description: 'Optional host department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ example: 'MoraHack 2026: National Inter-University Hackathon' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'morahack-2026' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ example: 'A 24-hour national hackathon for student innovators.' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: 'Full event markdown description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ enum: EventMode, default: EventMode.IN_PERSON })
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

  @ApiProperty({ example: '2026-10-15T09:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({ example: '2026-10-16T18:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  endDate!: Date;

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

  @ApiPropertyOptional({
    example: 'Cash prize pool of Rs. 1,000,000 and internship interview fast-tracks',
  })
  @IsOptional()
  @IsString()
  prizeInfo?: string;

  @ApiPropertyOptional({
    example: 'Certificate of Participation for all finalists; Merit awards for top 5',
  })
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

  @ApiPropertyOptional({ example: 'events@ieee.uom.lk | Telegram @morahack_support' })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ default: 'LKR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ type: [String], example: ['Hackathon', 'AI', 'Coding'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
