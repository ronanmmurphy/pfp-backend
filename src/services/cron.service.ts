import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReferralRepository } from '@/repositories/referral.repository';
import { SessionRepository } from '@/repositories/session.repository';
import { UserRepository } from '@/repositories/user.repository';
import { EmailUtil } from '@/utils/email.util';
import { ReferralStatus } from '@/enums/referral.enum';

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

    const referrals = await this.referralRepo.findAllMatchedReferrals();
    this.logger.log(`Found ${referrals.length} matched referrals`);

    const today = new Date();

    for (const referral of referrals) {
      try {
        // Get the referral's photographerId and veteranId and find the session with them
        const session = await this.sessionRepo.findOneBy({
          photographer: { id: referral.photographer.id },
          veteran: { id: referral.veteran.id },
        });

        if (session) {
          // Session exists
          let shouldSend = false;
          if (
            session.lastFollowedUpAt === null ||
            session.lastFollowedUpAt === undefined
          ) {
            const oneWeekAfterCreation = new Date(session.date);
            oneWeekAfterCreation.setDate(oneWeekAfterCreation.getDate() + 7);

            if (today >= oneWeekAfterCreation) {
              shouldSend = true;
            } else {
              shouldSend = false;
            }
          } else {
            const oneWeekAfterLastFollowUp = new Date(session.lastFollowedUpAt);
            oneWeekAfterLastFollowUp.setDate(
              oneWeekAfterLastFollowUp.getDate() + 7,
            );

            if (today >= oneWeekAfterLastFollowUp) {
              if (session.followUpCount && session.followUpCount >= 4) {
                shouldSend = false;
              } else {
                shouldSend = true;
              }
            } else {
              shouldSend = false;
            }
          }

          if (!shouldSend) {
            continue;
          }

          let isSent = false;

          // Check if session's outcomePhotographer is null or not
          if (
            session.outcomePhotographer === null ||
            session.outcomePhotographer === undefined
          ) {
            // Send follow up email to photographer to submit the feedback
            await EmailUtil.sendSessionReminderEmail(
              referral.photographer.email,
              referral.photographer.firstName,
              `${process.env.BASE_URL}/session-feedback?referralId=${referral.id}&userId=${referral.photographer.id}`,
            );
            isSent = true;
            this.logger.log(
              `Sent photographer feedback reminder for session ${session.id}`,
            );
          }

          // Check if session's outcomeVeteran is null or not
          if (
            session.outcomeVeteran === null ||
            session.outcomeVeteran === undefined
          ) {
            // Send follow up email to veteran to submit the feedback
            await EmailUtil.sendSessionReminderEmail(
              referral.veteran.email,
              referral.veteran.firstName,
              `${process.env.BASE_URL}/session-feedback?referralId=${referral.id}&userId=${referral.veteran.id}`,
            );
            isSent = true;
            this.logger.log(
              `Sent veteran feedback reminder for session ${session.id}`,
            );
          }

          // Update the lastFollowedUpAt
          if (isSent) {
            await this.sessionRepo.updateSession(session.id, {
              lastFollowedUpAt: new Date(),
              followUpCount: session.followUpCount
                ? session.followUpCount + 1
                : 1,
            });
          }
        } else {
          // Session doesn't exist
          if (
            referral.lastFollowedUpAt === null ||
            referral.lastFollowedUpAt === undefined
          ) {
            // Check if today is a week after the referral's createdAt
            const oneWeekAfterCreation = new Date(referral.createdAt);
            oneWeekAfterCreation.setDate(oneWeekAfterCreation.getDate() + 7);

            if (today >= oneWeekAfterCreation) {
              // Send initial reminder email to both photographer and veteran
              await EmailUtil.sendSessionReminderEmail(
                referral.photographer.email,
                referral.photographer.firstName,
                `${process.env.BASE_URL}/session-feedback?referralId=${referral.id}&userId=${referral.photographer.id}`,
              );

              await EmailUtil.sendSessionReminderEmail(
                referral.veteran.email,
                referral.veteran.firstName,
                `${process.env.BASE_URL}/session-feedback?referralId=${referral.id}&userId=${referral.veteran.id}`,
              );

              // Update the lastFollowedUpAt
              await this.referralRepo.update(referral.id, {
                lastFollowedUpAt: new Date(),
                followUpCount: referral.followUpCount
                  ? referral.followUpCount + 1
                  : 1,
              });

              this.logger.log(
                `Sent initial reminder for referral ${referral.id}`,
              );
            }
          } else {
            // lastFollowedUpAt is not null, check if today is after 1 week from lastFollowedUpAt
            const oneWeekAfterLastFollowUp = new Date(
              referral.lastFollowedUpAt,
            );
            oneWeekAfterLastFollowUp.setDate(
              oneWeekAfterLastFollowUp.getDate() + 7,
            );

            if (today >= oneWeekAfterLastFollowUp) {
              // Check followUpCount
              if (referral.followUpCount && referral.followUpCount >= 4) {
                // Stop sending reminders and make the referral status as canceled
                await this.referralRepo.update(referral.id, {
                  status: ReferralStatus.CANCELED,
                });

                await EmailUtil.sendStopEmail(
                  referral.photographer.email,
                  referral.photographer.firstName,
                  referral.veteran.firstName,
                  referral.veteran.lastName,
                );

                await EmailUtil.sendStopEmail(
                  referral.veteran.email,
                  referral.veteran.firstName,
                  referral.photographer.firstName,
                  referral.photographer.lastName,
                );

                this.logger.log(
                  `Canceled referral ${referral.id} after 4 follow-ups`,
                );
              } else {
                // Send reminder emails weekly based on lastFollowedUpAt
                await EmailUtil.sendSessionReminderEmail(
                  referral.photographer.email,
                  referral.photographer.firstName,
                  `${process.env.BASE_URL}/session-feedback?referralId=${referral.id}&userId=${referral.photographer.id}`,
                );

                await EmailUtil.sendSessionReminderEmail(
                  referral.veteran.email,
                  referral.veteran.firstName,
                  `${process.env.BASE_URL}/session-feedback?referralId=${referral.id}&userId=${referral.veteran.id}`,
                );

                // Update the lastFollowedUpAt and increase followUpCount
                await this.referralRepo.update(referral.id, {
                  lastFollowedUpAt: new Date(),
                  followUpCount: referral.followUpCount
                    ? referral.followUpCount + 1
                    : 1,
                });

                this.logger.log(
                  `Sent follow-up reminder ${referral.followUpCount ? referral.followUpCount + 1 : 1} for referral ${referral.id}`,
                );
              }
            }
          }
        }
      } catch (error) {
        this.logger.error(
          `Error processing referral ${referral.id}: ${error.message}`,
          error.stack,
        );
      }
    }
  }
}
