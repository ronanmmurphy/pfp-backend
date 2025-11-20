import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository';
import { SessionStatus } from '../enums/session.enum';
import {
  CreateSessionDto,
  CreateSessionFromEmailDto,
  GetSessionsQueryDto,
  UpdateSessionDto,
} from '@/dtos/session.dto';
import { UserRepository } from '@/repositories/user.repository';
import { Session } from '@/entities/session.entity';
import { IPaginatedResponse } from '@/types/shared.type';
import { Between } from 'typeorm';
import { ReferralRepository } from '@/repositories/referral.repository';
import { UserRole } from '@/enums/user.enum';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly userRepo: UserRepository,
    private readonly referralRepo: ReferralRepository,
  ) {}

  // async createSession(dto: CreateSessionDto): Promise<Session> {
  //   const photographer = await this.userRepo.findById(dto.photographerId);

  //   if (!photographer) {
  //     throw new NotFoundException('Photographer not found');
  //   }

  //   const sessionDate = new Date(dto.date);

  //   if (
  //     photographer.maxSessionsPerMonth !== null &&
  //     photographer.maxSessionsPerMonth !== undefined &&
  //     dto.status === SessionStatus.SCHEDULED
  //   ) {
  //     const now = new Date();
  //     const startOfMonth = new Date(
  //       now.getFullYear(),
  //       now.getMonth(),
  //       1,
  //       0,
  //       0,
  //       0,
  //       0,
  //     );
  //     const endOfMonth = new Date(
  //       now.getFullYear(),
  //       now.getMonth() + 1,
  //       0,
  //       23,
  //       59,
  //       59,
  //       999,
  //     );

  //     if (sessionDate >= startOfMonth && sessionDate <= endOfMonth) {
  //       const count = await this.sessionRepo.countBy({
  //         photographer: { id: dto.photographerId },
  //         date: Between(startOfMonth, endOfMonth),
  //         status: SessionStatus.SCHEDULED,
  //       });

  //       if (count >= photographer.maxSessionsPerMonth)
  //         throw new BadRequestException(
  //           `Cannot schedule session: Already has ${photographer.maxSessionsPerMonth} sessions this month. Schedule it next month or later.`,
  //         );
  //     }
  //   }

  //   if (dto.status !== SessionStatus.SCHEDULED) {
  //     const referral = await this.referralRepo.findByVeteranId(dto.veteranId);
  //     if (referral) {
  //       await this.referralRepo.deleteReferral(referral.id);
  //     }
  //   }

  //   const sessionData: Partial<Session> = {
  //     name: dto.name,
  //     note: dto?.note ?? undefined,
  //     status: dto?.status ?? SessionStatus.SCHEDULED,
  //     date: new Date(dto.date),
  //     outcomePhotographer: dto?.outcomePhotographer ?? undefined,
  //     ratePhotographer: dto?.ratePhotographer ?? undefined,
  //     photographerFeedback: dto?.photographerFeedback ?? undefined,
  //     outcomeVeteran: dto?.outcomeVeteran ?? undefined,
  //     rateVeteran: dto?.rateVeteran ?? undefined,
  //     veteranFeedback: dto?.veteranFeedback ?? undefined,
  //     photographer: { id: dto.photographerId } as any,
  //     veteran: { id: dto.veteranId } as any,
  //   };
  //   return await this.sessionRepo.createSession(sessionData);
  // }

  async getSessions(
    userId: number,
    query: GetSessionsQueryDto,
  ): Promise<IPaginatedResponse<Session>> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return await this.sessionRepo.findSessions(userId, user.role, query);
  }

  // async updateSession(id: number, dto: UpdateSessionDto): Promise<Session> {
  //   if (
  //     dto?.photographerId !== null &&
  //     dto?.photographerId !== undefined &&
  //     dto?.date &&
  //     dto?.status === SessionStatus.SCHEDULED
  //   ) {
  //     const photographer = await this.userRepo.findById(dto.photographerId);
  //     const sessionDate = new Date(dto.date);

  //     if (
  //       photographer &&
  //       photographer.maxSessionsPerMonth !== null &&
  //       photographer.maxSessionsPerMonth !== undefined
  //     ) {
  //       const now = new Date();
  //       const startOfMonth = new Date(
  //         now.getFullYear(),
  //         now.getMonth(),
  //         1,
  //         0,
  //         0,
  //         0,
  //         0,
  //       );
  //       const endOfMonth = new Date(
  //         now.getFullYear(),
  //         now.getMonth() + 1,
  //         0,
  //         23,
  //         59,
  //         59,
  //         999,
  //       );

  //       if (sessionDate >= startOfMonth && sessionDate <= endOfMonth) {
  //         const count = await this.sessionRepo.countBy({
  //           photographer: { id: dto.photographerId },
  //           date: Between(startOfMonth, endOfMonth),
  //           status: SessionStatus.SCHEDULED,
  //         });

  //         if (count >= photographer.maxSessionsPerMonth)
  //           throw new BadRequestException(
  //             `Cannot schedule session: Already has ${photographer.maxSessionsPerMonth} sessions this month. Schedule it next month or later.`,
  //           );
  //       }
  //     }
  //   }

  //   if (
  //     dto?.status !== SessionStatus.SCHEDULED &&
  //     dto?.veteranId !== null &&
  //     dto?.veteranId !== undefined
  //   ) {
  //     const referral = await this.referralRepo.findByVeteranId(dto.veteranId);
  //     if (referral) {
  //       await this.referralRepo.deleteReferral(referral.id);
  //     }
  //   }

  //   const sessionData: Partial<Session> = {
  //     name: dto?.name ?? undefined,
  //     note: dto?.note ?? undefined,
  //     status: dto?.status ?? undefined,
  //     date: dto?.date ? new Date(dto.date) : undefined,
  //     outcomePhotographer: dto?.outcomePhotographer ?? undefined,
  //     ratePhotographer: dto?.ratePhotographer ?? undefined,
  //     photographerFeedback: dto?.photographerFeedback ?? undefined,
  //     outcomeVeteran: dto?.outcomeVeteran ?? undefined,
  //     rateVeteran: dto?.rateVeteran ?? undefined,
  //     veteranFeedback: dto?.veteranFeedback ?? undefined,
  //     photographer: dto?.photographerId
  //       ? ({ id: dto.photographerId } as any)
  //       : undefined,
  //     veteran: dto?.veteranId ? ({ id: dto.veteranId } as any) : undefined,
  //   };
  //   const session = await this.sessionRepo.updateSession(id, sessionData);
  //   if (!session) throw new NotFoundException('Session not found');
  //   return session;
  // }

  async createSessionFromEmail(dto: CreateSessionFromEmailDto) {
    const referral = await this.referralRepo.findById(dto.referralId);

    if (!referral) throw new NotFoundException('Referral not found');

    const user = await this.userRepo.findById(dto.userId);

    if (!user) throw new NotFoundException('User not found');

    let photographerId: number | null = null;
    let veteranId: number | null = null;

    if (user.role === UserRole.PHOTOGRAPHER) {
      if (dto.userId !== referral.photographer.id)
        throw new BadRequestException('Invalid User ID');

      photographerId = dto.userId;
      veteranId = referral.veteran.id;
    } else if (user.role === UserRole.VETERAN) {
      if (dto.userId !== referral.veteran.id)
        throw new BadRequestException('Invalid User ID');

      photographerId = referral.photographer.id;
      veteranId = dto.userId;
    }

    if (!photographerId || !veteranId)
      throw new BadRequestException('Invalid User ID or Role');

    const session = await this.sessionRepo.findOneBy({
      photographer: { id: photographerId },
      veteran: { id: veteranId },
    });

    if (session) {
      // Update session
      return await this.sessionRepo.updateSession(session.id, {
        date:
          user.role === UserRole.PHOTOGRAPHER
            ? new Date(dto.date)
            : session.date,
        status:
          user.role === UserRole.PHOTOGRAPHER ? dto.status : session.status,
        outcomePhotographer:
          user.role === UserRole.PHOTOGRAPHER
            ? dto.outcome
            : session.outcomePhotographer,
        otherOutcomePhotographer:
          user.role === UserRole.PHOTOGRAPHER
            ? dto?.otherOutcome
            : session.otherOutcomePhotographer,
        ratePhotographer:
          user.role === UserRole.PHOTOGRAPHER
            ? dto.rate
            : session.ratePhotographer,
        photographerFeedback:
          user.role === UserRole.PHOTOGRAPHER
            ? dto.feedback
            : session.photographerFeedback,
        outcomeVeteran:
          user.role === UserRole.VETERAN ? dto.outcome : session.outcomeVeteran,
        otherOutcomeVeteran:
          user.role === UserRole.VETERAN
            ? dto?.otherOutcome
            : session.otherOutcomeVeteran,
        rateVeteran:
          user.role === UserRole.VETERAN ? dto?.rate : session.rateVeteran,
        veteranFeedback:
          user.role === UserRole.VETERAN
            ? dto.feedback
            : session.veteranFeedback,
      });
    }

    // Create session
    return await this.sessionRepo.createSession({
      date: new Date(dto.date),
      status: dto.status,
      photographer: { id: photographerId } as any,
      veteran: { id: veteranId } as any,
      outcomePhotographer:
        user.role === UserRole.PHOTOGRAPHER ? dto.outcome : undefined,
      otherOutcomePhotographer:
        user.role === UserRole.PHOTOGRAPHER ? dto?.otherOutcome : undefined,
      ratePhotographer:
        user.role === UserRole.PHOTOGRAPHER ? dto.rate : undefined,
      photographerFeedback:
        user.role === UserRole.PHOTOGRAPHER ? dto.feedback : undefined,
      outcomeVeteran: user.role === UserRole.VETERAN ? dto.outcome : undefined,
      otherOutcomeVeteran:
        user.role === UserRole.VETERAN ? dto?.otherOutcome : undefined,
      rateVeteran: user.role === UserRole.VETERAN ? dto?.rate : undefined,
      veteranFeedback:
        user.role === UserRole.VETERAN ? dto.feedback : undefined,
    });
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
