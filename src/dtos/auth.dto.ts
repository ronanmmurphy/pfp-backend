import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail() email: string;

  @IsString() @IsNotEmpty() password: string;
}

export class RefreshTokenDto {
  @IsString() @IsNotEmpty() refreshToken: string;
}

export class AuthResponseDto {
  @IsString() @IsNotEmpty() accessToken: string;
  @IsString() @IsNotEmpty() refreshToken: string;
}

export class ChangePasswordDto {
  @IsString() @IsNotEmpty() password: string;
}
