import { ReferralStatus } from '@/enums/referral.enum';
import { Expose, Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateReferralDto {
  @IsInt() @IsNotEmpty() photographerId: number;

  @IsInt() @IsNotEmpty() veteranId: number;
}

export class ReferralResponseDto {
  id: number;
  status: ReferralStatus;

  @Expose()
  @Transform(({ value }) => ({
    id: value?.id,
    firstName: value?.firstName,
    lastName: value?.lastName,
    email: value?.email,
    phoneNumber: value?.phoneNumber,
    streetAddress1: value?.streetAddress1,
    streetAddress2: value?.streetAddress2 ?? undefined,
    city: value?.city ?? undefined,
    state: value?.state ?? undefined,
    postalCode: value?.postalCode ?? undefined,
  }))
  photographer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress1: string;
    streetAddress2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  } | null;

  @Expose()
  @Transform(({ value }) => ({
    id: value?.id,
    firstName: value?.firstName,
    lastName: value?.lastName,
    email: value?.email,
    phoneNumber: value?.phoneNumber,
    streetAddress1: value?.streetAddress1,
    streetAddress2: value?.streetAddress2 ?? undefined,
    city: value?.city ?? undefined,
    state: value?.state ?? undefined,
    postalCode: value?.postalCode ?? undefined,
  }))
  veteran: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress1: string;
    streetAddress2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  } | null;
}

export class GetReferralsQueryDto {
  @IsOptional() @IsString() search?: string;

  @IsOptional()
  @ValidateIf((o) => o.status !== '')
  @IsEnum(ReferralStatus, {
    message: 'status must be a valid Referral Status value or an empty string',
  })
  status?: ReferralStatus;

  @IsOptional()
  @IsDateString({}, { message: 'dateFrom must be a valid ISO date string' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo must be a valid ISO date string' })
  dateTo?: string;

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
