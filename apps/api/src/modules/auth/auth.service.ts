import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, ALLOWED_REGISTRATION_ROLES } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RoleType } from '@campuspulse/types';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;
  private readonly jwtExpiration: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtExpiration =
      this.configService.get<string>('JWT_EXPIRES_IN') ||
      this.configService.get<string>('JWT_EXPIRATION', '7d');
  }

  /**
   * Registers a new user with salted bcrypt password hashing and RBAC assignment.
   * Privileged administrative roles cannot be self-assigned.
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();

    // Check if user with email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    // Role verification: Anti-privilege escalation security check
    let targetRole: RoleType = RoleType.STUDENT;

    if (dto.role) {
      const isAllowed = (ALLOWED_REGISTRATION_ROLES as readonly RoleType[]).includes(dto.role);
      if (!isAllowed) {
        throw new ForbiddenException(
          `Security violation: Role "${dto.role}" cannot be self-assigned through public registration. Public registration strictly creates STUDENT accounts.`,
        );
      }
      targetRole = dto.role;
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);
    const fullName =
      dto.name?.trim() ||
      `${(dto.firstName || '').trim()} ${(dto.lastName || '').trim()}`.trim();

    // Ensure target role exists in the database
    let roleRecord = await this.prisma.role.findUnique({
      where: { name: targetRole },
    });

    if (!roleRecord) {
      roleRecord = await this.prisma.role.create({
        data: {
          name: targetRole,
          description: `Platform role for ${targetRole}`,
        },
      });
    }

    // Transactionally create user and assign role
    const user = await this.prisma.user.create({
      data: {
        email,
        name: fullName,
        passwordHash,
        isActive: true,
        isEmailVerified: false,
        roles: {
          create: {
            roleId: roleRecord.id,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        roles: {
          select: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });

    const userRoles = user.roles.map((r) => r.role.name);
    const accessToken = await this.generateToken(user.id, user.email, userRoles);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        roles: userRoles,
      },
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtExpiration,
    };
  }

  /**
   * Authenticates user credentials and generates a signed JWT token.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();

    // Query user including roles and password hash
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare provided password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userRoles = user.roles.map((r) => r.role.name);
    const accessToken = await this.generateToken(user.id, user.email, userRoles);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        roles: userRoles,
      },
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtExpiration,
    };
  }

  /**
   * Retrieves sanitized profile of currently authenticated user.
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: { name: true, description: true },
            },
          },
        },
        studentProfile: {
          include: {
            university: { select: { id: true, name: true, slug: true } },
            faculty: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User account not found');
    }

    return {
      ...user,
      roles: user.roles.map((r) => r.role.name),
    };
  }

  /**
   * Generates a signed JWT access token.
   */
  private async generateToken(userId: string, email: string, roles: string[]): Promise<string> {
    const payload = {
      sub: userId,
      email,
      roles,
    };

    return this.jwtService.signAsync(payload);
  }
}
