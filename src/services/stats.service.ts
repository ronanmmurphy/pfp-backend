import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';
import { SessionStatus } from '../enums/session-status.enum';
import { SessionRepository } from '@/repositories/session.repository';
import { UserRepository } from '@/repositories/user.repository';

@Injectable()
export class StatsService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepository,
  ) {}

  // Admin: totals across the system
  async forAdmin(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admins only');
    }

    const [veterans, photographers, sessionsCompleted, sessionsCanceled] =
      await Promise.all([
        this.userRepo.countByRole(UserRole.VETERAN),
        this.userRepo.countByRole(UserRole.PHOTOGRAPHER),
        this.sessionRepo.countByStatus(SessionStatus.COMPLETED),
        this.sessionRepo.countByStatus(SessionStatus.CANCELED),
      ]);

    return { veterans, photographers, sessionsCompleted, sessionsCanceled };
  }

  // Current user: totals scoped to user
  async forUser(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('Profile not found for user');

    const role = user.role;

    const [sessionsCompleted, sessionsCanceled] = await Promise.all([
      this.sessionRepo.countForUserByStatusAndRole(
        userId,
        role,
        SessionStatus.COMPLETED,
      ),
      this.sessionRepo.countForUserByStatusAndRole(
        userId,
        role,
        SessionStatus.CANCELED,
      ),
    ]);
    return { sessionsCompleted, sessionsCanceled };
  }
}
