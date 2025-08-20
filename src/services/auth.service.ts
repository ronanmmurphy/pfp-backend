import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { SignUpDto } from '../dtos/sign-up.dto';
import { SignInDto } from '../dtos/sign-in.dto';
import { UserRepository } from 'src/repositories/user.repository';
import { ProfileRepository } from 'src/repositories/profile.repository';
import { Tokens } from '../types/token.type';
import { UserRole } from 'src/enums/user-role.enum';
import { User } from 'src/entities/user.entity';
import { Profile } from 'src/entities/profile.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly dataSource: DataSource,
    private readonly usersRepo: UserRepository,
    private readonly profilesRepo: ProfileRepository,
  ) {}

  async signup(dto: SignUpDto): Promise<Tokens> {
    if (dto.role === UserRole.PHOTOGRAPHER) {
      this.ensure(dto, [
        'phoneNumber',
        'streetAddress1',
        'city',
        'state',
        'postalCode',
      ]);
    }
    if (dto.role === UserRole.VETERAN) {
      this.ensure(dto, [
        'phoneNumber',
        'streetAddress1',
        'city',
        'state',
        'postalCode',
        'seekingEmployment',
        'eligibility',
        'militaryBranchAffiliation',
      ]);
    }

    const exists = await this.usersRepo.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.dataSource.transaction(async (trx) => {
      const userRepo = trx.getRepository(User);
      const profileRepo = trx.getRepository(Profile);

      // create user
      const createdUser = userRepo.create({
        email: dto.email,
        password: passwordHash,
      });
      await userRepo.save(createdUser);

      // create profile
      const profile = profileRepo.create({
        user: createdUser,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        phoneNumber: dto.phoneNumber,
        streetAddress1: dto.streetAddress1,
        streetAddress2: dto.streetAddress2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        website: dto.website,
        referredBy: dto.referredBy,
        seekingEmployment: dto.seekingEmployment,
        linkedinProfile: dto.linkedinProfile,
        eligibility: dto.eligibility,
        militaryBranchAffiliation: dto.militaryBranchAffiliation,
        militaryETSDate: dto.militaryETSDate,
      });
      await profileRepo.save(profile);

      return createdUser;
    });

    return this.issueTokens(user.id, user.email);
  }

  async signin(dto: SignInDto): Promise<Tokens> {
    const user = await this.usersRepo.findByEmail(dto.email);
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

    const user = await this.usersRepo.findById(payload.sub);
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
