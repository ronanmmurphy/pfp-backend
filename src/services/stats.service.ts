import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionStatus } from '../enums/session.enum';
import { SessionRepository } from '@/repositories/session.repository';
import { UserRepository } from '@/repositories/user.repository';
import { UserRole, UserStatus } from '@/enums/user.enum';

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

    const [userCounts, sessionsCompleted, sessionsCanceled, sessionsActive] =
      await Promise.all([
        this.userRepo.countByRoleGroupedByStatus(),
        this.sessionRepo.countByStatuses([SessionStatus.COMPLETED]),
        this.sessionRepo.countByStatuses([SessionStatus.CANCELED]),
        this.sessionRepo.countByStatuses([
          SessionStatus.SCHEDULED,
          SessionStatus.RESCHEDULED,
        ]),
      ]);

    return {
      veterans: Object.values(userCounts[UserRole.VETERAN] || {}).reduce(
        (a, b) => a + b,
        0,
      ),
      photographers: Object.values(
        userCounts[UserRole.PHOTOGRAPHER] || {},
      ).reduce((a, b) => a + b, 0),
      pendingPhotographers:
        userCounts[UserRole.PHOTOGRAPHER]?.[UserStatus.PENDING] || 0,
      onboardingPhotographers:
        userCounts[UserRole.PHOTOGRAPHER]?.[UserStatus.ONBOARDING] || 0,
      approvedPhotographers:
        userCounts[UserRole.PHOTOGRAPHER]?.[UserStatus.APPROVED] || 0,
      deniedPhotographers:
        userCounts[UserRole.PHOTOGRAPHER]?.[UserStatus.DENIED] || 0,
      veteransByStatus: userCounts[UserRole.VETERAN] || {},
      photographersByStatus: userCounts[UserRole.PHOTOGRAPHER] || {},
      sessionsCompleted,
      sessionsCanceled,
      sessionsActive,
    };
  }

  // Current user: totals scoped to user
  async forUser(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('Profile not found for user');

    const role = user.role;

    const [sessionsCompleted, sessionsCanceled, sessionsActive] =
      await Promise.all([
        this.sessionRepo.countForUserByStatusesAndRole(userId, role, [
          SessionStatus.COMPLETED,
        ]),
        this.sessionRepo.countForUserByStatusesAndRole(userId, role, [
          SessionStatus.CANCELED,
        ]),
        this.sessionRepo.countForUserByStatusesAndRole(userId, role, [
          SessionStatus.SCHEDULED,
          SessionStatus.RESCHEDULED,
        ]),
      ]);

    return { sessionsCompleted, sessionsCanceled, sessionsActive };
  }
}
