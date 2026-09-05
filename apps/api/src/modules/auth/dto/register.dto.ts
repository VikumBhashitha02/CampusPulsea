import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { RoleType } from '@campuspulse/types';

/**
 * Public registration strictly creates STUDENT accounts.
 * Privileged roles (SUPER_ADMIN, UNIVERSITY_ADMIN, ORGANIZER, COMPANY, ADMIN) cannot be self-assigned.
 */
export const ALLOWED_REGISTRATION_ROLES = [RoleType.STUDENT] as const;
export type AllowedRegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];

export class RegisterDto {
  @ApiProperty({
    example: 'ayesha.fernando@student.uoc.test',
    description: 'Account email address',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Account password (minimum 8 characters, at least 1 letter and 1 number)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password!: string;

  @ApiPropertyOptional({ example: 'Ayesha Fernando', description: 'Full name' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @ApiPropertyOptional({ example: 'Ayesha', description: 'First name (if name not provided)' })
  @ValidateIf((o) => !o.name)
  @IsString()
  @IsNotEmpty({ message: 'First name is required when full name is not provided' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName?: string;

  @ApiPropertyOptional({ example: 'Fernando', description: 'Last name (if name not provided)' })
  @ValidateIf((o) => !o.name)
  @IsString()
  @IsNotEmpty({ message: 'Last name is required when full name is not provided' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName?: string;

  @ApiPropertyOptional({
    enum: [RoleType.STUDENT],
    default: RoleType.STUDENT,
    description:
      'Account role. Only STUDENT can be created through public registration. Privileged roles (SUPER_ADMIN, UNIVERSITY_ADMIN, ORGANIZER, COMPANY) are rejected.',
  })
  @IsOptional()
  @IsEnum(RoleType, { message: 'Invalid role specified' })
  role?: RoleType;
}
