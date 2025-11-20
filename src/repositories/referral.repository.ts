import { GetReferralsQueryDto } from '@/dtos/referral.dto';
import { Referral } from '@/entities/referral.entity';
import { Session } from '@/entities/session.entity';
import { ReferralStatus } from '@/enums/referral.enum';
import { UserRole } from '@/enums/user.enum';
import { IPaginatedResponse } from '@/types/shared.type';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  ILike,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

@Injectable()
export class ReferralRepository {
  constructor(
    @InjectRepository(Referral) private readonly repo: Repository<Referral>,
  ) {}

  async createReferral(input: Partial<Referral>): Promise<Referral> {
    const referral = this.repo.create(input);
    return await this.repo.save(referral);
  }

  async findReferrals(
    userId: number,
    role: UserRole,
    query: GetReferralsQueryDto,
  ): Promise<IPaginatedResponse<Referral>> {
    const where: FindOptionsWhere<Referral>[] = [];

    if (role === UserRole.PHOTOGRAPHER) {
      where.push({ photographer: { id: userId } });
    } else if (role === UserRole.VETERAN) {
      where.push({ veteran: { id: userId } });
    }

    if (query?.search) {
      const searchTerm = `%${query.search.trim()}%`;
      const searchConditions: FindOptionsWhere<Referral>[] = [];

      if (role === UserRole.ADMIN) {
        searchConditions.push(
          { photographer: { firstName: ILike(searchTerm) } },
          { photographer: { lastName: ILike(searchTerm) } },
          { veteran: { firstName: ILike(searchTerm) } },
          { veteran: { lastName: ILike(searchTerm) } },
        );
      } else if (role === UserRole.PHOTOGRAPHER) {
        searchConditions.push(
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
        searchConditions.push(
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
        where.push({ createdAt: MoreThanOrEqual(dateFrom) });
      } else {
        where.forEach((condition) => {
          condition.createdAt = MoreThanOrEqual(dateFrom);
        });
      }
    }

    if (query?.dateTo) {
      const dateTo = new Date(query.dateTo);
      if (dateTo && isNaN(dateTo.getTime()))
        throw new BadRequestException('Invalid dateTo format');
      if (where.length === 0) {
        where.push({ createdAt: LessThan(dateTo) });
      } else {
        where.forEach((condition) => {
          condition.createdAt = LessThan(dateTo);
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

  async findById(id: number): Promise<Referral | null> {
    return await this.repo.findOne({
      where: { id: id },
      relations: ['photographer', 'veteran'],
    });
  }

  async findByVeteranId(veteranId: number): Promise<Referral | null> {
    return await this.repo.findOne({
      where: { veteran: { id: veteranId } },
    });
  }

  async findAllMatchedReferrals(): Promise<Referral[]> {
    return await this.repo.find({
      where: { status: ReferralStatus.MATCHED },
      relations: ['photographer', 'veteran'],
    });
  }

  async findStaleReferrals(oneWeekAgo: Date): Promise<Referral[]> {
    return await this.repo
      .createQueryBuilder('referral')
      .leftJoin(
        Session,
        'session',
        'session.photographer_id = referral.photographer_id AND session.veteran_id = referral.veteran_id',
      )
      .where('referral.created_at <= :oneWeekAgo', { oneWeekAgo })
      .andWhere('session.id IS NULL')
      .getMany();
  }

  async update(id: number, input: Partial<Referral>): Promise<Referral | null> {
    const referral = await this.repo.findOneBy({ id });
    if (!referral) return null;
    Object.assign(referral, input);
    return await this.repo.save(referral);
  }

  async deleteReferral(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
