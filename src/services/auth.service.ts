import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AddressSuggestionsDto, SignUpDto } from '../dtos/sign-up.dto';
import { SignInDto } from '../dtos/sign-in.dto';
import { UserRepository } from '../repositories/user.repository';
import { Tokens } from '../types/token.type';
import { UserRole } from '../enums/user-role.enum';
import { Eligibility } from '../enums/eligibility.enum';
import { MilitaryBranchAffiliation } from '../enums/military-branch.enum';
import { geocodeAddress } from '../utils/geocode';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly userRepo: UserRepository,
  ) {}

  async me(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      streetAddress1: user.streetAddress1,
      streetAddress2: user.streetAddress2,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
      latitude: user.latitude,
      longitude: user.longitude,
    };
  }

  async getAddressSuggestions(dto: AddressSuggestionsDto) {
    return geocodeAddress(
      dto.streetAddress1,
      dto.streetAddress2,
      dto.city,
      dto.state,
      dto.postalCode,
    );
  }

  async signup(dto: SignUpDto): Promise<Tokens> {
    const commonRequired = [
      'email',
      'password',
      'firstName',
      'lastName',
      'role',
      'phoneNumber',
      'streetAddress1',
      'latitude',
      'longitude',
    ];

    if (dto.role === UserRole.PHOTOGRAPHER) {
      this.ensure(dto, [...commonRequired, 'website']);
    }
    if (dto.role === UserRole.VETERAN) {
      this.ensure(dto, [
        ...commonRequired,
        'seekingEmployment',
        'eligibility',
        'militaryBranchAffiliation',
        'militaryETSDate',
      ]);
    }

    const exists = await this.userRepo.findByEmail(
      dto.email.trim().toLowerCase(),
    );
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.userRepo.createUser({
      email: dto.email,
      password: passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: Number(dto.role) as UserRole,
      phoneNumber: dto.phoneNumber,
      streetAddress1: dto.streetAddress1,
      streetAddress2: dto.streetAddress2 ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      postalCode: dto.postalCode ?? null,
      latitude: dto.latitude,
      longitude: dto.longitude,
      website:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.website ?? null) : null,
      referredBy: dto.referredBy ?? null,
      seekingEmployment:
        dto.role === UserRole.VETERAN ? (dto.seekingEmployment ?? null) : null,
      linkedinProfile:
        dto.role === UserRole.VETERAN ? (dto.linkedinProfile ?? null) : null,
      eligibility:
        dto.role === UserRole.VETERAN && dto.eligibility !== undefined
          ? (Number(dto.eligibility) as Eligibility)
          : null,
      militaryBranchAffiliation:
        dto.role === UserRole.VETERAN &&
        dto.militaryBranchAffiliation !== undefined
          ? (Number(dto.militaryBranchAffiliation) as MilitaryBranchAffiliation)
          : null,
      militaryETSDate:
        dto.role === UserRole.VETERAN && dto.militaryETSDate
          ? new Date(dto.militaryETSDate)
          : null,
    });

    return this.issueTokens(user.id, user.email);
  }

  async signin(dto: SignInDto): Promise<Tokens> {
    const user = await this.userRepo.findByEmail(
      dto.email.trim().toLowerCase(),
    );
    if (!user) throw new ForbiddenException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new ForbiddenException('Invalid credentials');

    return this.issueTokens(user.id, user.email);
  }

  // Stateless refresh: verify refresh JWT signature, then mint new tokens
  async refresh(refreshToken: string): Promise<Tokens> {
    if (!refreshToken)
      throw new ForbiddenException('No refresh token provided');

    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) throw new ForbiddenException('User not found');

    return this.issueTokens(user.id, user.email);
  }

  private async issueTokens(userId: number, email: string): Promise<Tokens> {
    const p = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(p, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwt.signAsync(p, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private ensure(obj: any, keys: string[]) {
    const missing = keys.filter((k) => obj[k] === undefined || obj[k] === null);
    if (missing.length)
      throw new BadRequestException(
        `Missing required fields: ${missing.join(', ')}`,
      );
  }
}
