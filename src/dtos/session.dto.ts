import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { SessionOutcome, SessionStatus } from '../enums/session.enum';
import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';

export class CreateSessionDto {
  @IsString() @IsNotEmpty() name: string;

  @IsOptional() @IsString() note?: string;

  @IsEnum(SessionStatus) status: SessionStatus;

  @IsDateString() date: string;

  @IsOptional() @IsEnum(SessionOutcome) outcomePhotographer?: SessionOutcome;

  @IsOptional() @IsInt() ratePhotographer?: number;

  @IsOptional() @IsString() photographerFeedback?: string;

  @IsOptional() @IsEnum(SessionOutcome) outcomeVeteran?: SessionOutcome;

  @IsOptional() @IsInt() rateVeteran?: number;

  @IsOptional() @IsString() veteranFeedback?: string;

  @IsInt() @IsNotEmpty() photographerId: number;

  @IsInt() @IsNotEmpty() veteranId: number;
}

export class CreateSessionFromEmailDto {
  @IsInt() @IsNotEmpty() referralId: number;

  @IsInt() @IsNotEmpty() userId: number;

  @IsEnum(SessionStatus) status: SessionStatus;

  @IsDateString() date: string;

  @IsOptional() @IsEnum(SessionOutcome) outcome: SessionOutcome;

  @IsOptional() @IsString() otherOutcome?: string;

  @IsOptional() @IsInt() rate?: number;

  @IsOptional() @IsString() feedback?: string;
}

export class GetSessionsQueryDto {
  @IsOptional() @IsString() search?: string;

  @IsOptional()
  @ValidateIf((o) => o.status !== '')
  @IsEnum(SessionStatus, {
    message: 'status must be a valid SessionStatus value or an empty string',
  })
  status?: SessionStatus;

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

export class SessionResponseDto {
  id: number;
  name?: string | null;
  note?: string | null;
  status: SessionStatus;

  @Transform(({ value }) => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString();
    }
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return value;
    }
    return null;
  })
  date: string;

  outcomePhotographer?: SessionOutcome | null;

  otherOutcomePhotographer?: string | null;

  ratePhotographer?: number | null;

  photographerFeedback?: string | null;

  outcomeVeteran?: SessionOutcome | null;

  otherOutcomeVeteran?: string | null;

  rateVeteran?: number | null;

  veteranFeedback?: string | null;

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

export class UpdateSessionDto extends PartialType(CreateSessionDto) {}
