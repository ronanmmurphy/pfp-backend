import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersQueryDto,
  GetAddressSuggestionsQueryDto,
  AddressSuggestionsResponseDto,
} from '@/dtos/user.dto';
import { UserRepository } from '@/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from '@/entities/user.entity';
import {
  Eligibility,
  MilitaryBranchAffiliation,
  UserRole,
  UserStatus,
} from '@/enums/user.enum';
import { ensureRequiredFields } from '@/utils/validation';
import { IPaginatedResponse } from '@/types/shared.type';
import { geocodeAddress } from '@/utils/geocode';
import { EmailUtil } from '@/utils/email.util';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async getAddressSuggestions(
    dto: GetAddressSuggestionsQueryDto,
  ): Promise<AddressSuggestionsResponseDto[]> {
    return geocodeAddress(
      dto.streetAddress1,
      dto.streetAddress2,
      dto.city,
      dto.state,
      dto.postalCode,
    );
  }

  async createUser(
    dto: CreateUserDto,
    files?: Express.Multer.File[],
  ): Promise<User> {
    const studioSpaceFiles =
      files?.filter((f) => f.fieldname === 'studioSpaceImages') || [];
    const insuranceFiles =
      files?.filter((f) => f.fieldname === 'proofOfInsuranceImages') || [];

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

    if (dto.status === UserStatus.DENIED) {
      throw new BadRequestException('Can not create denied user');
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
        dto.status !== null && dto.status !== undefined
          ? (Number(dto.status) as UserStatus)
          : Number(dto.role) === UserRole.PHOTOGRAPHER
            ? UserStatus.ONBOARDING
            : UserStatus.APPROVED,
      phoneNumber: dto.phoneNumber,
      streetAddress1: dto.streetAddress1,
      streetAddress2: dto?.streetAddress2 ?? null,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      referredBy: dto?.referredBy ?? null,
      // Photographer
      website:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.website ?? null) : null,
      maxSessionsPerMonth:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.maxSessionsPerMonth ?? null)
          : null,
      // Photographer Onboarding
      mailingStreetAddress1:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.mailingStreetAddress1 ?? null)
          : null,
      mailingStreetAddress2:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.mailingStreetAddress2 ?? null)
          : null,
      mailingCity:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.mailingCity ?? null) : null,
      mailingState:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.mailingState ?? null) : null,
      mailingPostalCode:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.mailingPostalCode ?? null)
          : null,
      closestBase:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.closestBase ?? null) : null,
      agreeToCriminalBackgroundCheck:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.agreeToCriminalBackgroundCheck ?? null)
          : null,
      xLink: dto.role === UserRole.PHOTOGRAPHER ? (dto.xLink ?? null) : null,
      facebookLink:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.facebookLink ?? null) : null,
      linkedinLink:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.linkedinLink ?? null) : null,
      instagramLink:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.instagramLink ?? null) : null,
      isHomeStudio:
        dto.role === UserRole.PHOTOGRAPHER ? (dto.isHomeStudio ?? null) : null,
      partOfHomeStudio:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.partOfHomeStudio ?? null)
          : null,
      isSeparateEntrance:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.isSeparateEntrance ?? null)
          : null,
      acknowledgeHomeStudioAgreement:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.acknowledgeHomeStudioAgreement ?? null)
          : null,
      isStudioAdaAccessible:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.isStudioAdaAccessible ?? null)
          : null,
      agreeToVolunteerAgreement:
        dto.role === UserRole.PHOTOGRAPHER
          ? (dto.agreeToVolunteerAgreement ?? null)
          : null,
      studioSpaceImages: studioSpaceFiles.map(
        (f) => `${process.env.APP_URL}/uploads/users/${f.filename}`,
      ),
      proofOfInsuranceImages: insuranceFiles.map(
        (f) => `${process.env.APP_URL}/uploads/users/${f.filename}`,
      ),
      // Veteran
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

    return await this.userRepo.createUser(userData);
  }

  async getUsers(query: GetUsersQueryDto): Promise<IPaginatedResponse<User>> {
    return await this.userRepo.findUsers(query);
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(
    userId: number,
    id: number,
    dto: UpdateUserDto,
    files?: Express.Multer.File[],
  ): Promise<User> {
    const studioSpaceFiles =
      files?.filter((f) => f.fieldname === 'studioSpaceImages') || [];
    const insuranceFiles =
      files?.filter((f) => f.fieldname === 'proofOfInsuranceImages') || [];

    if (dto.status === UserStatus.DENIED && !dto.reasonForDenying) {
      throw new BadRequestException('Reason for denying is required');
    }

    const userData: Partial<User> = {
      email: dto?.email ?? undefined,
      password: dto?.password ? await bcrypt.hash(dto.password, 12) : undefined,
      firstName: dto?.firstName ?? undefined,
      lastName: dto?.lastName ?? undefined,
      role: dto?.role ? (Number(dto.role) as UserRole) : undefined,
      status: dto?.status ? (Number(dto.status) as UserStatus) : undefined,
      phoneNumber: dto?.phoneNumber ?? undefined,
      streetAddress1: dto?.streetAddress1 ?? undefined,
      streetAddress2: dto?.streetAddress2 ?? undefined,
      city: dto?.city ?? undefined,
      state: dto?.state ?? undefined,
      postalCode: dto?.postalCode ?? undefined,
      latitude: dto?.latitude ?? undefined,
      longitude: dto?.longitude ?? undefined,
      referredBy: dto?.referredBy ?? undefined,
      reasonForDenying:
        dto?.status === UserStatus.DENIED
          ? (dto.reasonForDenying ?? null)
          : null,
      // Photographer
      website: dto?.website ?? undefined,
      maxSessionsPerMonth: dto?.maxSessionsPerMonth ?? undefined,
      // Photographer Onboarding
      mailingStreetAddress1: dto?.mailingStreetAddress1 ?? undefined,
      mailingStreetAddress2: dto?.mailingStreetAddress2 ?? undefined,
      mailingCity: dto?.mailingCity ?? undefined,
      mailingState: dto?.mailingState ?? undefined,
      mailingPostalCode: dto?.mailingPostalCode ?? undefined,
      closestBase: dto?.closestBase ?? undefined,
      agreeToCriminalBackgroundCheck:
        dto?.agreeToCriminalBackgroundCheck ?? undefined,
      xLink: dto?.xLink ?? undefined,
      facebookLink: dto?.facebookLink ?? undefined,
      linkedinLink: dto?.linkedinLink ?? undefined,
      instagramLink: dto?.instagramLink ?? undefined,
      isHomeStudio: dto?.isHomeStudio ?? undefined,
      partOfHomeStudio: dto?.partOfHomeStudio ?? undefined,
      isSeparateEntrance: dto?.isSeparateEntrance ?? undefined,
      acknowledgeHomeStudioAgreement:
        dto?.acknowledgeHomeStudioAgreement ?? undefined,
      isStudioAdaAccessible: dto?.isStudioAdaAccessible ?? undefined,
      agreeToVolunteerAgreement: dto?.agreeToVolunteerAgreement ?? undefined,
      // Veteran
      seekingEmployment: dto?.seekingEmployment ?? undefined,
      linkedinProfile: dto?.linkedinProfile ?? undefined,
      eligibility: dto?.eligibility
        ? (Number(dto.eligibility) as Eligibility)
        : undefined,
      militaryBranchAffiliation: dto?.militaryBranchAffiliation
        ? (Number(dto.militaryBranchAffiliation) as MilitaryBranchAffiliation)
        : undefined,
      militaryETSDate: dto?.militaryETSDate
        ? new Date(dto.militaryETSDate)
        : undefined,
    };
    if (studioSpaceFiles.length > 0) {
      userData.studioSpaceImages = studioSpaceFiles.map(
        (f) => `${process.env.APP_URL}/uploads/users/${f.filename}`,
      );
    }
    if (insuranceFiles.length > 0) {
      userData.proofOfInsuranceImages = insuranceFiles.map(
        (f) => `${process.env.APP_URL}/uploads/users/${f.filename}`,
      );
    }
    await this.userRepo.updateUser(id, userData);
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const currentUser = await this.userRepo.findById(userId);

    if (
      user.role === UserRole.PHOTOGRAPHER &&
      dto.agreeToCriminalBackgroundCheck &&
      currentUser?.role === UserRole.PHOTOGRAPHER
    ) {
      const admins = await this.userRepo.findByRole(UserRole.ADMIN);
      if (admins.length > 0) {
        for (let i = 0; i < admins.length; i++) {
          await EmailUtil.sendPhotographerOnboardingNotification(
            admins[i].email,
            admins[i].firstName,
            user.firstName,
            user.lastName,
          );
        }
      }
    }

    if (
      user.role === UserRole.PHOTOGRAPHER &&
      user.status === UserStatus.APPROVED &&
      currentUser?.role === UserRole.ADMIN
    ) {
      await EmailUtil.sendApprovalEmail(user.email, user.firstName);
    }

    if (
      user.role === UserRole.PHOTOGRAPHER &&
      user.status === UserStatus.DENIED &&
      currentUser?.role === UserRole.ADMIN
    ) {
      await EmailUtil.sendDenialEmail(user.email, user.firstName);
    }

    return user;
  }

  async deleteUser(id: number): Promise<void> {
    const success = await this.userRepo.deleteUser(id);
    if (!success) throw new NotFoundException('User not found');
  }

  async getPhotographersNear(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<any[]> {
    return await this.userRepo.findPhotographersNear(
      latitude,
      longitude,
      radius,
    );
  }

  async getUserCoordinates(
    userId: number,
  ): Promise<{ latitude: number; longitude: number } | null> {
    return await this.userRepo.getUserCoordinates(userId);
  }
}
