import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../repositories/user.repository';
import { AuthResponseDto, SignInDto } from '@/dtos/auth.dto';
import {
  Eligibility,
  MilitaryBranchAffiliation,
  UserRole,
  UserStatus,
} from '@/enums/user.enum';
import { ensureRequiredFields } from '@/utils/validation';
import { User } from '@/entities/user.entity';
import { CreateUserDto } from '@/dtos/user.dto';
import { EmailUtil } from '@/utils/email.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) {}

  async me(userId: number): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async signup(dto: CreateUserDto): Promise<AuthResponseDto> {
    const commonRequired = [
      'email',
      'password',
      'firstName',
      'lastName',
      'role',
      'status',
      'phoneNumber',
      'streetAddress1',
      'latitude',
      'longitude',
    ];

    let result: { isValid: boolean; missingFields?: string[] } = {
      isValid: true,
    };

    switch (dto.role) {
      case UserRole.ADMIN:
        result = ensureRequiredFields(dto, [...commonRequired]);
        break;
      case UserRole.PHOTOGRAPHER:
        result = ensureRequiredFields(dto, [...commonRequired, 'website']);
        break;
      case UserRole.VETERAN:
        result = ensureRequiredFields(dto, [
          ...commonRequired,
          'seekingEmployment',
          'eligibility',
          'militaryBranchAffiliation',
          'militaryETSDate',
        ]);
        break;
    }

    if (!result.isValid) {
      throw new BadRequestException(
        `Missing required fields: ${result.missingFields!.join(', ')}`,
      );
    }

    const exists = await this.userRepo.findByEmail(
      dto.email.trim().toLowerCase(),
    );
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const userData: Partial<User> = {
      email: dto.email,
      password: passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: Number(dto.role) as UserRole,
      status:
        Number(dto.role) === UserRole.PHOTOGRAPHER
          ? UserStatus.PENDING
          : UserStatus.APPROVED,
      phoneNumber: dto.phoneNumber,
      streetAddress1: dto.streetAddress1,
      streetAddress2: dto?.streetAddress2 ?? null,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      website:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.website ?? null) : null,
      referredBy: dto?.referredBy ?? null,
      seekingEmployment:
        dto.role === UserRole.VETERAN ? (dto.seekingEmployment ?? null) : null,
      linkedinProfile:
        dto.role === UserRole.VETERAN ? (dto?.linkedinProfile ?? null) : null,
      eligibility:
        dto.role === UserRole.VETERAN &&
        dto.eligibility !== undefined &&
        dto.eligibility !== null
          ? (Number(dto.eligibility) as Eligibility)
          : null,
      militaryBranchAffiliation:
        dto.role === UserRole.VETERAN &&
        dto.militaryBranchAffiliation !== undefined &&
        dto.militaryBranchAffiliation !== null
          ? (Number(dto.militaryBranchAffiliation) as MilitaryBranchAffiliation)
          : null,
      militaryETSDate:
        dto.role === UserRole.VETERAN && dto.militaryETSDate
          ? new Date(dto.militaryETSDate)
          : null,
    };

    const user = await this.userRepo.createUser(userData);

    // Send photographer welcome email
    if (user.role === UserRole.PHOTOGRAPHER) {
      await EmailUtil.sendPendingEmail(user.email, user.firstName);
    }

    if (user.role === UserRole.VETERAN) {
      await EmailUtil.sendVeteranWelcomeEmail(user.email, user.firstName);
    }

    return await this.issueTokens(user.id, user.email);
  }

  async signin(dto: SignInDto): Promise<AuthResponseDto> {
    const user = await this.userRepo.findByEmail(
      dto.email.trim().toLowerCase(),
    );
    if (!user) throw new ForbiddenException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new ForbiddenException('Invalid credentials');

    return this.issueTokens(user.id, user.email);
  }

  async changePassword(userId: number, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepo.updateUser(userId, {
      password: passwordHash,
    });
    if (!user) throw new NotFoundException('User not found');
  }

  // Stateless refresh: verify refresh JWT signature, then mint new tokens
  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    if (!refreshToken)
      throw new ForbiddenException('No refresh token provided');

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) throw new ForbiddenException('User not found');

    return this.issueTokens(user.id, user.email);
  }

  private async issueTokens(
    userId: number,
    email: string,
  ): Promise<AuthResponseDto> {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
