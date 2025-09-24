import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { GetUsersQueryDto } from '../dtos/user.dto';
import { UserRole, UserStatus } from '@/enums/user.enum';
import { IPaginatedResponse } from '@/types/shared.type';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async createUser(input: Partial<User>): Promise<User> {
    const user = this.repo.create(input);
    return await this.repo.save(user);
  }

  async findUsers(query: GetUsersQueryDto): Promise<IPaginatedResponse<User>> {
    const where: FindOptionsWhere<User>[] = [];

    if (query.search) {
      const search = `%${query.search.trim()}%`;
      where.push({ firstName: ILike(search) }, { lastName: ILike(search) });
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

    if (query.status !== undefined) {
      if (where.length === 0) {
        where.push({ status: query.status });
      } else {
        where.forEach((condition) => {
          condition.status = query.status;
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

    return { items, total };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async updateUser(id: number, input: Partial<User>): Promise<User | null> {
    const user = await this.repo.findOneBy({ id });
    if (!user) return null;
    Object.assign(user, input);
    return await this.repo.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async findPhotographersNear(
    latitude: number,
    longitude: number,
    radius: number, // in miles
  ) {
    const earthRadiusMiles = 3958.8; // Earth's radius in miles

    return await this.repo
      .createQueryBuilder('user')
      .select([
        `"user"."id" AS id`,
        `"user"."email" AS email`,
        `"user"."first_name" AS "firstName"`,
        `"user"."last_name" AS "lastName"`,
        `"user"."phone_number" AS "phoneNumber"`,
        `"user"."street_address1" AS "streetAddress1"`,
        `"user"."street_address2" AS "streetAddress2"`,
        `"user"."city" AS city`,
        `"user"."state" AS state`,
        `"user"."postal_code" AS "postalCode"`,
        `"user"."latitude" AS latitude`,
        `"user"."longitude" AS longitude`,
      ])
      .addSelect(
        `(${earthRadiusMiles} * acos(
          cos(radians(:lat)) * cos(radians("user"."latitude")) *
          cos(radians("user"."longitude") - radians(:lng)) +
          sin(radians(:lat)) * sin(radians("user"."latitude"))
      ))`,
        'distance',
      )
      .where(`"user"."role" = :role`, { role: 1 }) // adjust enum
      .andWhere(`"user"."latitude" IS NOT NULL`)
      .andWhere(`"user"."longitude" IS NOT NULL`)
      .andWhere(
        `(${earthRadiusMiles} * acos(
          cos(radians(:lat)) * cos(radians("user"."latitude")) *
          cos(radians("user"."longitude") - radians(:lng)) +
          sin(radians(:lat)) * sin(radians("user"."latitude"))
      )) <= :radius`,
      )
      .orderBy('distance', 'ASC')
      .setParameters({ lat: latitude, lng: longitude, radius })
      .getRawMany();
  }

  async getUserCoordinates(
    userId: number,
  ): Promise<{ latitude: number; longitude: number } | null> {
    const user = await this.repo.findOneBy({ id: userId });
    if (!user || user.latitude == null || user.longitude == null) return null;
    return { latitude: user.latitude, longitude: user.longitude };
  }

  async countByRoleGroupedByStatus(): Promise<
    Record<UserRole, Record<UserStatus, number>>
  > {
    const qb = this.repo
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('user.status', 'status')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.role')
      .addGroupBy('user.status');

    const result = await qb.getRawMany<{
      role: string;
      status: string;
      count: string;
    }>();

    // Convert to nested object: { [role]: { [status]: count } }
    const counts: Record<UserRole, Record<UserStatus, number>> = {} as any;

    for (const { role, status, count } of result) {
      if (!counts[role]) counts[role] = {} as any;
      counts[role][status] = Number(count);
    }

    return counts;
  }
}
