import { Referral } from '@/entities/referral.entity';
import { Session } from '@/entities/session.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReferralRepository {
  constructor(
    @InjectRepository(Referral) private readonly repo: Repository<Referral>,
  ) {}

  async createReferral(input: Partial<Referral>): Promise<Referral> {
    const referral = this.repo.create(input);
    return await this.repo.save(referral);
  }

  async findByVeteranId(veteranId: number): Promise<Referral | null> {
    return await this.repo.findOne({
      where: { veteranId },
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

  async deleteReferral(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
