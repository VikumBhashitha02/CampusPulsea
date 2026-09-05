import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Registrations')
@Controller('registrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @ApiOperation({ summary: 'RSVP / Register for an opportunity or event' })
  @SwaggerApiResponse({ status: 201, description: 'Registration successful' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerApiResponse({ status: 409, description: 'Already registered' })
  register(@CurrentUser('id') userId: string, @Body() dto: CreateRegistrationDto) {
    return this.registrationsService.register(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'List opportunities registered by current authenticated student' })
  @SwaggerApiResponse({ status: 200, description: 'Registered events list' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  findMyRegistrations(@CurrentUser('id') userId: string) {
    return this.registrationsService.findUserRegistrations(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel personal event registration' })
  @SwaggerApiResponse({ status: 200, description: 'Registration cancelled' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.registrationsService.cancel(userId, id);
  }
}
