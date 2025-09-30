import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateReferralDto {
  @IsInt() @IsNotEmpty() photographerId: number;

  @IsInt() @IsNotEmpty() veteranId: number;
}

export class ReferralResponseDto {
  id: number;
  photographerId: number;
  veteranId: number;
}
