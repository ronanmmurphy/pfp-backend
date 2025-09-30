import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository';
import { SessionStatus } from '../enums/session.enum';
import {
  CreateSessionDto,
  GetSessionsQueryDto,
  UpdateSessionDto,
} from '@/dtos/session.dto';
import { UserRepository } from '@/repositories/user.repository';
import { Session } from '@/entities/session.entity';
import { IPaginatedResponse } from '@/types/shared.type';
import { Between } from 'typeorm';
import { ReferralRepository } from '@/repositories/referral.repository';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly userRepo: UserRepository,
    private readonly referralRepo: ReferralRepository,
  ) {}

  async createSession(dto: CreateSessionDto): Promise<Session> {
    const photographer = await this.userRepo.findById(dto.photographerId);

    if (!photographer) {
      throw new NotFoundException('Photographer not found');
    }

    const sessionDate = new Date(dto.date);

    if (
      photographer.maxSessionsPerMonth !== null &&
      photographer.maxSessionsPerMonth !== undefined &&
      dto.status === SessionStatus.SCHEDULED
    ) {
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      if (sessionDate >= startOfMonth && sessionDate <= endOfMonth) {
        const count = await this.sessionRepo.countBy({
          photographer: { id: dto.photographerId },
          date: Between(startOfMonth, endOfMonth),
          status: SessionStatus.SCHEDULED,
        });

        if (count >= photographer.maxSessionsPerMonth)
          throw new BadRequestException(
            `Cannot schedule session: Already has ${photographer.maxSessionsPerMonth} sessions this month. Schedule it next month or later.`,
          );
      }
    }

    if (dto.status !== SessionStatus.SCHEDULED) {
      const referral = await this.referralRepo.findByVeteranId(dto.veteranId);
      if (referral) {
        await this.referralRepo.deleteReferral(referral.id);
      }
    }

    const sessionData: Partial<Session> = {
      name: dto.name,
      note: dto?.note ?? undefined,
      status: dto?.status ?? SessionStatus.SCHEDULED,
      date: new Date(dto.date),
      outcomePhotographer: dto?.outcomePhotographer ?? undefined,
      ratePhotographer: dto?.ratePhotographer ?? undefined,
      photographerFeedback: dto?.photographerFeedback ?? undefined,
      outcomeVeteran: dto?.outcomeVeteran ?? undefined,
      rateVeteran: dto?.rateVeteran ?? undefined,
      veteranFeedback: dto?.veteranFeedback ?? undefined,
      photographer: { id: dto.photographerId } as any,
      veteran: { id: dto.veteranId } as any,
    };
    return await this.sessionRepo.createSession(sessionData);
  }

  async getSessions(
    userId: number,
    query: GetSessionsQueryDto,
  ): Promise<IPaginatedResponse<Session>> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return await this.sessionRepo.findSessions(userId, user.role, query);
  }

  async updateSession(id: number, dto: UpdateSessionDto): Promise<Session> {
    if (
      dto?.photographerId !== null &&
      dto?.photographerId !== undefined &&
      dto?.date &&
      dto?.status === SessionStatus.SCHEDULED
    ) {
      const photographer = await this.userRepo.findById(dto.photographerId);
      const sessionDate = new Date(dto.date);

      if (
        photographer &&
        photographer.maxSessionsPerMonth !== null &&
        photographer.maxSessionsPerMonth !== undefined
      ) {
        const now = new Date();
        const startOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0,
        );
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );

        if (sessionDate >= startOfMonth && sessionDate <= endOfMonth) {
          const count = await this.sessionRepo.countBy({
            photographer: { id: dto.photographerId },
            date: Between(startOfMonth, endOfMonth),
            status: SessionStatus.SCHEDULED,
          });

          if (count >= photographer.maxSessionsPerMonth)
            throw new BadRequestException(
              `Cannot schedule session: Already has ${photographer.maxSessionsPerMonth} sessions this month. Schedule it next month or later.`,
            );
        }
      }
    }

    if (
      dto?.status !== SessionStatus.SCHEDULED &&
      dto?.veteranId !== null &&
      dto?.veteranId !== undefined
    ) {
      const referral = await this.referralRepo.findByVeteranId(dto.veteranId);
      if (referral) {
        await this.referralRepo.deleteReferral(referral.id);
      }
    }

    const sessionData: Partial<Session> = {
      name: dto?.name ?? undefined,
      note: dto?.note ?? undefined,
      status: dto?.status ?? undefined,
      date: dto?.date ? new Date(dto.date) : undefined,
      outcomePhotographer: dto?.outcomePhotographer ?? undefined,
      ratePhotographer: dto?.ratePhotographer ?? undefined,
      photographerFeedback: dto?.photographerFeedback ?? undefined,
      outcomeVeteran: dto?.outcomeVeteran ?? undefined,
      rateVeteran: dto?.rateVeteran ?? undefined,
      veteranFeedback: dto?.veteranFeedback ?? undefined,
      photographer: dto?.photographerId
        ? ({ id: dto.photographerId } as any)
        : undefined,
      veteran: dto?.veteranId ? ({ id: dto.veteranId } as any) : undefined,
    };
    const session = await this.sessionRepo.updateSession(id, sessionData);
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getRecentSessions(userId: number, limit: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.sessionRepo.findRecent(userId, user.role, limit);
  }

  async findOne(id: number) {
    const session = await this.sessionRepo.findById(id);
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  remove(id: number) {
    return this.sessionRepo.removeById(id);
  }
}
