import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReferralRepository } from '@/repositories/referral.repository';
import { SessionRepository } from '@/repositories/session.repository';
import { UserRepository } from '@/repositories/user.repository';
import { EmailUtil } from '@/utils/email.util';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly referralRepo: ReferralRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly userRepo: UserRepository,
  ) {}

  // Runs every day at 9 AM server time
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyReminders() {
    this.logger.log('Running daily reminders...');

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const referrals = await this.referralRepo.findStaleReferrals(oneWeekAgo);
    this.logger.log(`Found ${referrals.length} stale referrals`);

    for (let i = 0; i < referrals.length; i++) {
      const referral = referrals[i];
      const photographer = await this.userRepo.findById(
        referral.photographerId,
      );
      const veteran = await this.userRepo.findById(referral.veteranId);
      if (!photographer || !veteran) continue;
      await EmailUtil.sendReferralReminderEmail(
        photographer.email,
        photographer.firstName,
        veteran.firstName,
        veteran.lastName,
      );
    }

    const sessions = await this.sessionRepo.findOverdueSessions(oneWeekAgo);
    this.logger.log(`Found ${sessions.length} overdue sessions`);
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const photographer = session.photographer;
      if (!photographer) continue;
      await EmailUtil.sendSessionReminderEmail(
        photographer.email,
        photographer.firstName,
        session.name,
      );
    }
  }
}
