import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({ example: 'cl12345event' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiPropertyOptional({ example: 'Vegetarian meal requested' })
  @IsOptional()
  @IsString()
  notes?: string;
}
