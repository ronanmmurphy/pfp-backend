import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';
import {
  UpdateUserDto,
  UserItem,
  UserPageResponse,
  UserQueryDto,
} from '../dtos/user.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  countByRole(role: UserRole) {
    return this.repo.count({ where: { role } });
  }

  async findUsers(query: UserQueryDto): Promise<UserPageResponse<UserItem>> {
    const where: FindOptionsWhere<User>[] = [];

    if (query.search) {
      const search = `%${query.search.trim()}%`;
      const searchConditions: FindOptionsWhere<User>[] = [];

      searchConditions.push(
        { firstName: Like(search) },
        { lastName: Like(search) },
      );

      where.push(...searchConditions);
    }

    if (query.role !== undefined) {
      if (where.length === 0) {
        where.push({ role: query.role });
      } else {
        where.forEach((condition) => {
          condition.role = query.role;
        });
      }
    }

    // Apply pagination
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Execute query
    const [items, total] = await this.repo.findAndCount({
      where: where.length > 0 ? where : undefined,
      skip,
      take: pageSize,
    });

    // Map to UserItem
    const userItems: UserItem[] = items.map((user) =>
      plainToClass(UserItem, user),
    );

    return { items: userItems, total };
  }

  async createUser(dto: Partial<User>): Promise<User> {
    const user = this.repo.create(dto);
    return this.repo.save(user);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User | null> {
    const user = await this.repo.findOneBy({ id });
    if (!user) return null;
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async findPhotographersNear(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<User[]> {
    const earthRadiusMiles = 3958.8; // Earth's radius in miles
    return this.repo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.PHOTOGRAPHER })
      .andWhere('user.latitude IS NOT NULL AND user.longitude IS NOT NULL')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.streetAddress1',
        'user.streetAddress2',
        'user.city',
        'user.state',
        'user.postalCode',
        'user.latitude',
        'user.longitude',
        `(
          ${earthRadiusMiles} * acos(
            cos(radians(:latitude)) * cos(radians(user.latitude)) * 
            cos(radians(user.longitude) - radians(:longitude)) + 
            sin(radians(:latitude)) * sin(radians(user.latitude))
          )
        ) AS distance`,
      ])
      .setParameters({ latitude, longitude })
      .andWhere(
        `(
          ${earthRadiusMiles} * acos(
            cos(radians(:latitude)) * cos(radians(user.latitude)) * 
            cos(radians(user.longitude) - radians(:longitude)) + 
            sin(radians(:latitude)) * sin(radians(user.latitude))
          )
        ) <= :radius`,
        { radius },
      )
      .orderBy('distance', 'ASC')
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          ...result,
          // id: parseInt(result.user_id, 10),
          // latitude: parseFloat(result.user_latitude),
          // longitude: parseFloat(result.user_longitude),
          // distance: parseFloat(result.distance),
        })),
      );
  }

  async getUserCoordinates(
    userId: number,
  ): Promise<{ latitude: number; longitude: number } | null> {
    const user = await this.repo.findOneBy({ id: userId });
    if (!user) return null;

    if (user.latitude != null && user.longitude != null) {
      return { latitude: user.latitude, longitude: user.longitude };
    }

    return null;
  }
}
