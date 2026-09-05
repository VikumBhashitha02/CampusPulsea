import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TeamRequestStatus } from '@campuspulse/types';

export class RespondRequestDto {
  @ApiProperty({
    enum: [TeamRequestStatus.ACCEPTED, TeamRequestStatus.REJECTED],
    example: TeamRequestStatus.ACCEPTED,
  })
  @IsNotEmpty()
  @IsEnum(TeamRequestStatus)
  status!: TeamRequestStatus;
}
