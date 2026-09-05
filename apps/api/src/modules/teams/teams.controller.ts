import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamJoinRequestDto } from './dto/team-join-request.dto';
import { RespondRequestDto } from './dto/respond-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TeamRequestStatus } from '@campuspulse/types';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({
    summary: 'List teams with deterministic match score',
    description:
      'Returns open squads. When authenticated, computes rule-based 0-100 compatibility score.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Teams list with compatibility score' })
  findAll(
    @CurrentUser('id') currentUserId?: string,
    @Query('eventId') eventId?: string,
    @Query('skill') skill?: string,
    @Query('role') role?: string,
    @Query('isOpen') isOpen?: string,
  ) {
    return this.teamsService.findAll(
      {
        eventId,
        skill,
        role,
        isOpen: isOpen !== undefined ? isOpen === 'true' : undefined,
      },
      currentUserId,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user joined teams, created teams, and pending requests' })
  @SwaggerApiResponse({ status: 200, description: 'User teams and requests' })
  findMyTeams(@CurrentUser('id') userId: string) {
    return this.teamsService.findMyTeams(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team details, roster, and pending requests if leader' })
  @SwaggerApiResponse({ status: 200, description: 'Team details' })
  @SwaggerApiResponse({ status: 404, description: 'Team not found' })
  findById(@Param('id') id: string, @CurrentUser('id') currentUserId?: string) {
    return this.teamsService.findById(id, currentUserId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team for a competition or project' })
  @SwaggerApiResponse({ status: 201, description: 'Team created' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(userId, dto);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit request to join a team' })
  @SwaggerApiResponse({ status: 201, description: 'Join request sent' })
  requestToJoin(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: TeamJoinRequestDto,
  ) {
    return this.teamsService.requestToJoin(id, userId, dto);
  }

  @Patch('requests/:requestId/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to a team join request (ACCEPT or REJECT)' })
  @SwaggerApiResponse({ status: 200, description: 'Response recorded' })
  respondToRequest(
    @Param('requestId') requestId: string,
    @CurrentUser('id') leaderId: string,
    @Body() dto: RespondRequestDto,
  ) {
    return this.teamsService.respondToRequest(
      requestId,
      leaderId,
      dto.status as TeamRequestStatus.ACCEPTED | TeamRequestStatus.REJECTED,
    );
  }

  @Delete('requests/:requestId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a pending join request' })
  @SwaggerApiResponse({ status: 200, description: 'Join request cancelled' })
  cancelRequest(@Param('requestId') requestId: string, @CurrentUser('id') userId: string) {
    return this.teamsService.cancelRequest(requestId, userId);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave team or remove member (Leaders only for other members)' })
  @SwaggerApiResponse({ status: 200, description: 'Member removed or left team' })
  leaveOrRemoveMember(
    @Param('id') teamId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') callerId: string,
  ) {
    return this.teamsService.leaveOrRemoveMember(teamId, targetUserId, callerId);
  }
}
