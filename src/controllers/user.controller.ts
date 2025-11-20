import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersQueryDto,
  NearbyQueryDto,
  UserResponseDto,
  GetAddressSuggestionsQueryDto,
  NearbyPhotographerResponseDto,
} from '@/dtos/user.dto';
import { UserService } from '@/services/user.service';
import { IPaginatedResponse } from '@/types/shared.type';
import { plainToInstance } from 'class-transformer';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { User } from '@/guards/user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('address-suggestions')
  getAddressSuggestions(@Body() dto: GetAddressSuggestionsQueryDto) {
    return this.userService.getAddressSuggestions(dto);
  }

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/users',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async createUser(
    @Body() dto: CreateUserDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UserResponseDto> {
    const user = await this.userService.createUser(dto, files);
    return plainToInstance(UserResponseDto, user);
  }

  @Get()
  async getUsers(
    @Query() query: GetUsersQueryDto,
  ): Promise<IPaginatedResponse<UserResponseDto>> {
    const result = await this.userService.getUsers(query);
    return {
      items: result.items.map((item) => plainToInstance(UserResponseDto, item)),
      total: result.total,
    };
  }

  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.userService.getUserById(id);
    return plainToInstance(UserResponseDto, user);
  }

  @Patch(':id')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/users',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @User('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('from') from?: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(
      userId,
      id,
      dto,
      files,
      from,
    );
    return plainToInstance(UserResponseDto, user);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Get('photographers/nearby')
  async getPhotographersNear(
    @Query() query: NearbyQueryDto,
  ): Promise<NearbyPhotographerResponseDto[]> {
    const photographers = await this.userService.getPhotographersNear(
      query.latitude,
      query.longitude,
      query.radius,
    );

    return photographers.map((photographer) =>
      plainToInstance(NearbyPhotographerResponseDto, photographer, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
