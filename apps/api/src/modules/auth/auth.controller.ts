import { Controller, Post, Body, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new student, organizer, or company account',
    description:
      'Registers user with bcrypt password hashing and assigns the requested non-privileged role (defaults to STUDENT). Privileged roles (SUPER_ADMIN, ADMIN, UNIVERSITY_ADMIN) are strictly rejected.',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'User registered successfully and JWT returned',
    type: AuthResponseDto,
  })
  @SwaggerApiResponse({ status: 400, description: 'Validation failed' })
  @SwaggerApiResponse({ status: 403, description: 'Attempted to self-assign a privileged role' })
  @SwaggerApiResponse({ status: 409, description: 'Email address already registered' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and receive a JWT Bearer access token' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: AuthResponseDto,
  })
  @SwaggerApiResponse({ status: 400, description: 'Invalid login payload' })
  @SwaggerApiResponse({ status: 401, description: 'Invalid email or password' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile and roles' })
  @SwaggerApiResponse({ status: 200, description: 'Authenticated user profile' })
  @SwaggerApiResponse({ status: 401, description: 'Missing, invalid, or expired JWT' })
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
