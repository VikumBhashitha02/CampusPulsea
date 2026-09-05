import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RejectEventDto {
  @ApiProperty({
    example: 'Event schedule conflicts with national exam period or lacks complete venue details.',
    description: 'Mandatory administrative explanation for rejecting the event submission',
  })
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required' })
  @MinLength(10, { message: 'Rejection reason must be at least 10 characters long' })
  reason!: string;
}
