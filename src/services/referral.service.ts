import { CreateReferralDto, GetReferralsQueryDto } from '@/dtos/referral.dto';
import { Referral } from '@/entities/referral.entity';
import { ReferralStatus } from '@/enums/referral.enum';
import { ReferralRepository } from '@/repositories/referral.repository';
import { UserRepository } from '@/repositories/user.repository';
import { IPaginatedResponse } from '@/types/shared.type';
import { EmailUtil } from '@/utils/email.util';
import { getLocationText } from '@/utils/user.helper';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ReferralService {
  constructor(
    private readonly referralRepo: ReferralRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async createReferral(dto: CreateReferralDto): Promise<Referral> {
    const photographer = await this.userRepo.findById(dto.photographerId);
    if (!photographer) {
      throw new NotFoundException('Photographer not found');
    }

    const veteran = await this.userRepo.findById(dto.veteranId);
    if (!veteran) {
      throw new NotFoundException('Client not found');
    }

    const referral = await this.referralRepo.findByVeteranId(dto.veteranId);
    if (referral && referral.status === ReferralStatus.MATCHED)
      throw new ConflictException('You already had a matched referral');

    await EmailUtil.sendInitialPhotographerReferralEmail(
      veteran.email,
      veteran.firstName,
      photographer.email,
      photographer.phoneNumber,
      photographer.firstName,
      photographer.lastName,
      getLocationText(
        photographer.streetAddress1,
        photographer.city,
        photographer.state,
        photographer.postalCode,
        photographer?.streetAddress2,
      ),
    );

    await EmailUtil.sendInitialVeteranReferralEmail(
      photographer.email,
      photographer.firstName,
      veteran.email,
      veteran.phoneNumber,
      veteran.firstName,
      veteran.lastName,
      getLocationText(
        veteran.streetAddress1,
        veteran.city,
        veteran.state,
        veteran.postalCode,
        veteran?.streetAddress2,
      ),
    );

    const referralData: Partial<Referral> = {
      photographer,
      veteran,
      status: ReferralStatus.MATCHED,
    };
    return await this.referralRepo.createReferral(referralData);
  }

  async getReferrals(
    userId: number,
    query: GetReferralsQueryDto,
  ): Promise<IPaginatedResponse<Referral>> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return await this.referralRepo.findReferrals(userId, user.role, query);
  }
}
