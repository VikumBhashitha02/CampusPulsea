import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ToggleBookmarkDto {
  @ApiProperty({ example: 'cl12345event' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;
}
