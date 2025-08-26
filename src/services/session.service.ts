import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository';
import { SessionStatus } from '../enums/session-status.enum';
import {
  CreateSessionDto,
  SessionItem,
  SessionPageResponse,
  SessionQueryDto,
} from '@/dtos/session.dto';
import { UserRepository } from '@/repositories/user.repository';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async create(dto: CreateSessionDto) {
    return this.sessionRepo.createAndSave({
      name: dto.name,
      note: dto?.note ?? null,
      status: dto?.status ?? SessionStatus.REQUESTED,
      date: new Date(dto.date),
      expirationDate: dto?.expirationDate ? new Date(dto.expirationDate) : null,
      photographerId: dto.photographerId,
      veteranId: dto.veteranId,
    });
  }

  async update(id: number, userId: number, update: any) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.sessionRepo.updateSession(id, userId, user.role, {
      status: update.status,
      date: update.date ? new Date(update.date) : undefined,
    });
  }

  async getRecentSessions(userId: number, limit: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.sessionRepo.findRecent(userId, user.role, limit);
  }

  async getSessions(
    userId: number,
    query: SessionQueryDto,
  ): Promise<SessionPageResponse<SessionItem>> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.sessionRepo.findSessions(userId, user.role, query);
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
