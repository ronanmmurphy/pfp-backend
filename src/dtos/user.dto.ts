import { Exclude, Type } from 'class-transformer';
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
} from 'class-validator';
import { Eligibility } from '../enums/eligibility.enum';
import { MilitaryBranchAffiliation } from '../enums/military-branch.enum';
import { UserRole } from '../enums/user-role.enum';

export class UserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be a valid UserRole value' })
  role?: UserRole;

  @IsOptional()
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'pageSize must be an integer' })
  @Min(1, { message: 'pageSize must be at least 1' })
  @Max(50, { message: 'pageSize cannot exceed 50' })
  pageSize?: number = 10;
}

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  streetAddress1: string;

  @IsOptional()
  @IsString()
  streetAddress2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  referredBy?: string;

  @IsOptional()
  @IsBoolean()
  seekingEmployment?: boolean;

  @IsOptional()
  @IsString()
  linkedinProfile?: string;

  @IsOptional()
  @IsEnum(Eligibility)
  eligibility?: Eligibility;

  @IsOptional()
  @IsEnum(MilitaryBranchAffiliation)
  militaryBranchAffiliation?: MilitaryBranchAffiliation;

  @IsOptional()
  @IsDateString()
  militaryETSDate?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  streetAddress1?: string;

  @IsOptional()
  @IsString()
  streetAddress2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  referredBy?: string;

  @IsOptional()
  @IsBoolean()
  seekingEmployment?: boolean;

  @IsOptional()
  @IsString()
  linkedinProfile?: string;

  @IsOptional()
  @IsEnum(Eligibility)
  eligibility?: Eligibility;

  @IsOptional()
  @IsEnum(MilitaryBranchAffiliation)
  militaryBranchAffiliation?: MilitaryBranchAffiliation;

  @IsOptional()
  @IsDateString()
  militaryETSDate?: string;
}

export class UserItem {
  id: number;
  email: string;
  @Exclude()
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  website?: string | null;
  referredBy?: string | null;
  seekingEmployment?: boolean | null;
  linkedinProfile?: string | null;
  eligibility?: Eligibility | null;
  militaryBranchAffiliation?: MilitaryBranchAffiliation | null;
  @Type(() => Date)
  militaryETSDate?: string | null;
}

export class UserPageResponse<T> {
  items: T[];
  total: number;
}

export class NearbyQueryDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @Min(0)
  radius: number = 100;
}
