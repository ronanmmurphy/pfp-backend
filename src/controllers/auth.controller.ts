import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  AuthResponseDto,
  ChangePasswordDto,
  RefreshTokenDto,
  SignInDto,
} from '@/dtos/auth.dto';
import { User } from '@/guards/user.decorator';
import { CreateUserDto, UserResponseDto } from '@/dtos/user.dto';
import { plainToInstance } from 'class-transformer';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@User('sub') userId: number): Promise<UserResponseDto> {
    const user = await this.authService.me(userId);
    return plainToInstance(UserResponseDto, user);
  }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto): Promise<AuthResponseDto> {
    return await this.authService.signup(dto);
  }

  @Post('signin')
  async signin(@Body() dto: SignInDto): Promise<AuthResponseDto> {
    return await this.authService.signin(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return await this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @User('sub') userId: number,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return await this.authService.changePassword(userId, dto.password);
  }
}
