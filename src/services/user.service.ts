import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  CreateUserDto,
  UpdateUserDto,
  UserItem,
  UserPageResponse,
  UserQueryDto,
} from '@/dtos/user.dto';
import { UserRepository } from '@/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@/enums/user-role.enum';
import { Eligibility } from '@/enums/eligibility.enum';
import { MilitaryBranchAffiliation } from '@/enums/military-branch.enum';
import { User } from '@/entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async getUsers(query: UserQueryDto): Promise<UserPageResponse<UserItem>> {
    return this.userRepo.findUsers(query);
  }

  async createUser(dto: CreateUserDto): Promise<UserItem> {
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
    return plainToClass(UserItem, user);
  }

  async findUserById(id: number): Promise<UserItem> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return plainToClass(UserItem, user);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UserItem> {
    const user = await this.userRepo.updateUser(id, dto);
    if (!user) throw new NotFoundException('User not found');
    return plainToClass(UserItem, user);
  }

  async deleteUser(id: number): Promise<void> {
    const success = await this.userRepo.deleteUser(id);
    if (!success) throw new NotFoundException('User not found');
  }

  async getPhotographersNear(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<User[]> {
    return this.userRepo.findPhotographersNear(latitude, longitude, radius);
  }

  async getUserCoordinates(
    userId: number,
  ): Promise<{ latitude: number; longitude: number } | null> {
    return this.userRepo.getUserCoordinates(userId);
  }
}
