import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  UserItem,
  UserPageResponse,
  UserQueryDto,
  NearbyQueryDto,
} from '@/dtos/user.dto';
import { User } from '@/entities/user.entity';
import { UserService } from '@/services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserItem> {
    return this.userService.createUser(dto);
  }

  @Get()
  async getUsers(
    @Query()
    query: UserQueryDto,
  ): Promise<UserPageResponse<UserItem>> {
    return this.userService.getUsers(query);
  }

  @Get(':id')
  async findUserById(@Param('id', ParseIntPipe) id: number): Promise<UserItem> {
    return this.userService.findUserById(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserItem> {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.deleteUser(id);
  }

  @Get('photographers/nearby')
  async getPhotographersNear(@Query() query: NearbyQueryDto): Promise<User[]> {
    const coords = await this.userService.getUserCoordinates(query.userId);
    if (!coords) throw new NotFoundException('User location not found');
    return this.userService.getPhotographersNear(
      coords.latitude,
      coords.longitude,
      query.radius,
    );
  }
}
