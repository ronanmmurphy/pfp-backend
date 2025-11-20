import {
  Eligibility,
  MilitaryBranchAffiliation,
  UserRole,
  UserStatus,
} from '@/enums/user.enum';
import { PartialType } from '@nestjs/mapped-types';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsEnum,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsArray,
} from 'class-validator';

export class GetAddressSuggestionsQueryDto {
  @IsString() @IsNotEmpty() streetAddress1: string;

  @IsOptional() @IsString() streetAddress2?: string;

  @IsOptional() @IsString() city?: string;

  @IsOptional() @IsString() state?: string;

  @IsOptional() @IsString() postalCode?: string;
}

export class AddressSuggestionsResponseDto {
  @IsString() displayName: string;

  @IsNumber() latitude: number;

  @IsNumber() longitude: number;
}

export class CreateUserDto {
  @IsEmail() email: string;

  @IsString() @IsNotEmpty() password: string;

  @IsString() @IsNotEmpty() firstName: string;

  @IsString() @IsNotEmpty() lastName: string;

  @IsEnum(UserRole) role: UserRole;

  @IsEnum(UserStatus) status: UserStatus;

  @IsString() @IsNotEmpty() phoneNumber: string;

  @IsString() @IsNotEmpty() streetAddress1: string;

  @IsOptional() @IsString() streetAddress2?: string;

  @IsString() @IsNotEmpty() city: string;

  @IsString() @IsNotEmpty() state?: string;

  @IsString() @IsNotEmpty() postalCode?: string;

  @IsNumber() latitude: number;

  @IsNumber() longitude: number;

  @IsOptional() @IsString() referredBy?: string;

  @IsOptional() @IsString() reasonForDenying?: string;

  // Photographer
  @IsOptional() @IsString() website?: string;

  @IsBoolean() openToReferrals: boolean;

  // Photographer Onboarding
  @IsOptional() @IsString() mailingStreetAddress1?: string;

  @IsOptional() @IsString() mailingStreetAddress2?: string;

  @IsOptional() @IsString() mailingCity?: string;

  @IsOptional() @IsString() mailingState?: string;

  @IsOptional() @IsString() mailingPostalCode?: string;

  @IsOptional() @IsString() closestBase?: string;

  @IsOptional() @IsBoolean() agreeToCriminalBackgroundCheck?: boolean;

  @IsOptional() @IsString() socialMedia?: string;

  @IsOptional() @IsBoolean() isHomeStudio?: boolean;

  @IsOptional() @IsString() partOfHomeStudio?: string;

  @IsOptional() @IsBoolean() isSeparateEntrance?: boolean;

  @IsOptional() @IsBoolean() acknowledgeHomeStudioAgreement?: boolean;

  @IsOptional() @IsBoolean() isStudioAdaAccessible?: boolean;

  @IsOptional() @IsBoolean() agreeToVolunteerAgreement?: boolean;

  @IsOptional() @IsArray() studioSpaceImages?: string[];

  @IsOptional() @IsArray() proofOfInsuranceImages?: string[];

  // Veteran
  @IsOptional() @IsBoolean() seekingEmployment?: boolean;

  @IsOptional() @IsString() linkedinProfile?: string;

  @IsOptional() @IsEnum(Eligibility) eligibility?: Eligibility;

  @IsOptional()
  @IsEnum(MilitaryBranchAffiliation)
  militaryBranchAffiliation?: MilitaryBranchAffiliation;

  @IsOptional() @IsDateString() militaryETSDate?: string;
}

export class GetUsersQueryDto {
  @IsOptional() @IsString() search?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid UserRole value' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be a valid UserStatus value' })
  status?: UserStatus;

  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'Page size must be an integer' })
  @Min(1, { message: 'Page size must be at least 1' })
  @Max(50, { message: 'Page size cannot exceed 50' })
  pageSize?: number = 10;
}

export class UserResponseDto {
  id: number;

  email: string;

  @Exclude() password: string;

  firstName: string;

  lastName: string;

  role: UserRole;

  status: UserStatus;

  phoneNumber: string;

  streetAddress1: string;

  streetAddress2?: string | null;

  city: string;

  state: string;

  postalCode: string;

  latitude: number;

  longitude: number;

  referredBy?: string | null;

  reasonForDenying?: string | null;

  // Photographer
  website?: string | null;

  openToReferrals: boolean;

  // Photographer Onboarding
  mailingStreetAddress1?: string | null;

  mailingStreetAddress2?: string | null;

  mailingCity?: string | null;

  mailingState?: string | null;

  mailingPostalCode?: string | null;

  closestBase?: string | null;

  agreeToCriminalBackgroundCheck?: boolean | null;

  socialMedia?: string | null;

  isHomeStudio?: boolean | null;

  partOfHomeStudio?: string | null;

  isSeparateEntrance?: boolean | null;

  acknowledgeHomeStudioAgreement?: boolean | null;

  isStudioAdaAccessible?: boolean | null;

  agreeToVolunteerAgreement?: boolean | null;

  studioSpaceImages?: string[];

  proofOfInsuranceImages?: string[];

  // Veteran
  seekingEmployment?: boolean | null;

  linkedinProfile?: string | null;

  eligibility?: Eligibility | null;

  militaryBranchAffiliation?: MilitaryBranchAffiliation | null;

  @Transform(({ value }) => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString();
    }
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return value;
    }
    return null;
  })
  militaryETSDate?: Date | null;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class NearbyQueryDto {
  @IsNumber() latitude: number;

  @IsNumber() longitude: number;

  @IsNumber() @Min(0) radius: number = 100;
}

export class NearbyPhotographerResponseDto {
  @Expose()
  id: number;

  @Expose()
  city: string;

  @Expose()
  state: string;

  @Expose()
  postalCode: string;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;

  @Expose()
  distance: number; // in miles
}
