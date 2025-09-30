import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  ILike,
  In,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Session } from '../entities/session.entity';
import { SessionStatus } from '../enums/session.enum';
import { UserRole } from '@/enums/user.enum';
import { IPaginatedResponse } from '@/types/shared.type';
import { GetSessionsQueryDto } from '@/dtos/session.dto';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session) private readonly repo: Repository<Session>,
  ) {}

  async createSession(input: Partial<Session>): Promise<Session> {
    const session = this.repo.create(input);
    return await this.repo.save(session);
  }

  async updateSession(
    id: number,
    input: Partial<Session>,
  ): Promise<Session | null> {
    const session = await this.repo.findOneBy({ id });
    if (!session) return null;
    Object.assign(session, input);
    return await this.repo.save(session);
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: { photographer: true, veteran: true },
    });
  }

  async findAll() {
    return this.repo.find({
      relations: { photographer: true, veteran: true },
      order: { date: 'DESC' },
    });
  }

  async removeById(id: number) {
    await this.repo.delete({ id });
  }

  async countByStatuses(statuses: SessionStatus[]) {
    return this.repo.count({ where: { status: In(statuses) } });
  }

  async countForUserByStatusesAndRole(
    userId: number,
    role: UserRole,
    statuses: SessionStatus[],
  ) {
    if (role === UserRole.PHOTOGRAPHER) {
      return this.repo.count({
        where: { status: In(statuses), photographer: { id: userId } },
      });
    }
    if (role === UserRole.VETERAN) {
      return this.repo.count({
        where: { status: In(statuses), veteran: { id: userId } },
      });
    }
    return this.countByStatuses(statuses);
  }

  async countBy(where: any) {
    return await this.repo.count({ where });
  }

  async findSessions(
    userId: number,
    role: UserRole,
    query: GetSessionsQueryDto,
  ): Promise<IPaginatedResponse<Session>> {
    const where: FindOptionsWhere<Session>[] = [];

    if (role === UserRole.PHOTOGRAPHER) {
      where.push({ photographer: { id: userId } });
    } else if (role === UserRole.VETERAN) {
      where.push({ veteran: { id: userId } });
    }

    if (query?.search) {
      const searchTerm = `%${query.search.trim()}%`;
      const searchConditions: FindOptionsWhere<Session>[] = [];

      if (role === UserRole.ADMIN) {
        // Search session.name, photographer's names, and veteran's names
        searchConditions.push(
          { name: ILike(searchTerm) },
          { photographer: { firstName: ILike(searchTerm) } },
          { photographer: { lastName: ILike(searchTerm) } },
          { veteran: { firstName: ILike(searchTerm) } },
          { veteran: { lastName: ILike(searchTerm) } },
        );
      } else if (role === UserRole.PHOTOGRAPHER) {
        // Search session.name and veteran's names
        searchConditions.push(
          { name: ILike(searchTerm), photographer: { id: userId } },
          {
            veteran: { firstName: ILike(searchTerm) },
            photographer: { id: userId },
          },
          {
            veteran: { lastName: ILike(searchTerm) },
            photographer: { id: userId },
          },
        );
      } else if (role === UserRole.VETERAN) {
        // Search session.name and photographer's names
        searchConditions.push(
          { name: ILike(searchTerm), veteran: { id: userId } },
          {
            photographer: { firstName: ILike(searchTerm) },
            veteran: { id: userId },
          },
          {
            photographer: { lastName: ILike(searchTerm) },
            veteran: { id: userId },
          },
        );
      }

      if (searchConditions.length > 0) {
        if (role !== UserRole.ADMIN) {
          searchConditions.forEach((condition) => {
            Object.assign(condition, where[0]);
          });
        }
        where.push(...searchConditions);
      }
    }

    if (query?.status !== null && query?.status !== undefined) {
      if (where.length === 0) {
        where.push({ status: query.status });
      } else {
        where.forEach((condition) => {
          condition.status = query.status;
        });
      }
    }

    if (query?.dateFrom) {
      const dateFrom = new Date(query.dateFrom);
      if (dateFrom && isNaN(dateFrom.getTime()))
        throw new BadRequestException('Invalid dateFrom format');
      if (where.length === 0) {
        where.push({ date: MoreThanOrEqual(dateFrom) });
      } else {
        where.forEach((condition) => {
          condition.date = MoreThanOrEqual(dateFrom);
        });
      }
    }

    if (query?.dateTo) {
      const dateTo = new Date(query.dateTo);
      if (dateTo && isNaN(dateTo.getTime()))
        throw new BadRequestException('Invalid dateTo format');
      if (where.length === 0) {
        where.push({ date: LessThan(dateTo) });
      } else {
        where.forEach((condition) => {
          condition.date = LessThan(dateTo);
        });
      }
    }

    const page = query?.page || 1;
    const pageSize = query?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.repo.findAndCount({
      where: where.length > 0 ? where : undefined,
      relations: ['photographer', 'veteran'],
      skip,
      take: pageSize,
    });

    return { items, total };
  }

  async findRecent(userId: number, role: UserRole, limit: number) {
    if (role === UserRole.ADMIN) {
      return this.repo.find({
        relations: { photographer: true, veteran: true },
        order: { date: 'DESC' },
        take: limit,
      });
    }

    if (role === UserRole.PHOTOGRAPHER) {
      return this.repo.find({
        where: { photographer: { id: userId } },
        relations: { photographer: true, veteran: true },
        order: { date: 'DESC' },
        take: limit,
      });
    }

    if (role === UserRole.VETERAN) {
      return this.repo.find({
        where: { veteran: { id: userId } },
        relations: { photographer: true, veteran: true },
        order: { date: 'DESC' },
        take: limit,
      });
    }
  }

  async findOverdueSessions(oneWeekAgo: Date): Promise<Session[]> {
    return await this.repo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.photographer', 'photographer')
      .leftJoinAndSelect('session.veteran', 'veteran')
      .where('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('session.date <= :oneWeekAgo', { oneWeekAgo })
      .select([
        'session',
        'photographer.id',
        'photographer.email',
        'photographer.firstName',
        'veteran.id',
        'veteran.email',
        'veteran.firstName',
      ])
      .getMany();
  }
}
