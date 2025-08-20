import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { Eligibility } from '../enums/eligibility.enum';
import { MilitaryBranchAffiliation } from '../enums/military-branch.enum';

export class SignUpDto {
  @IsEmail()
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

  // Common
  @IsOptional() @IsString() streetAddress2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() referredBy?: string;

  // Photographer
  @IsOptional() @IsString() website?: string;

  // Veteran
  @IsOptional() @IsBoolean() seekingEmployment?: boolean;
  @IsOptional() @IsString() linkedinProfile?: string;
  @IsOptional() @IsEnum(Eligibility) eligibility?: Eligibility;
  @IsOptional()
  @IsEnum(MilitaryBranchAffiliation)
  militaryBranchAffiliation?: MilitaryBranchAffiliation;
  @IsOptional() militaryETSDate?: Date;
}
