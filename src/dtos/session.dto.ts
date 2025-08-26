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
import { SessionStatus } from '../enums/session-status.enum';

export class SessionItem {
  id: number;
  name: string;
  note?: string;
  date: string;
  expirationDate?: string;
  status: SessionStatus;
  photographer: any;
  veteran: any;
}

export class UpdateSession {
  status?: SessionStatus;
  date?: Date;
}

export class SessionPageResponse<T> {
  items: T[];
  total: number;
}

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  // ISO date-time string (e.g., 2025-08-20T10:30:00Z)
  @IsDateString()
  date: string;

  // ISO date string (e.g., 2025-08-31)
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsInt()
  photographerId: number;

  @IsInt()
  veteranId: number;
}

export class SessionQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

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

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsInt()
  photographerId?: number;

  @IsOptional()
  @IsInt()
  veteranId?: number;
}
