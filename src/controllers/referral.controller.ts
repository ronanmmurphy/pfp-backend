import { CreateReferralDto, ReferralResponseDto } from '@/dtos/referral.dto';
import { ReferralService } from '@/services/referral.service';
import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post()
  async create(@Body() dto: CreateReferralDto): Promise<ReferralResponseDto> {
    const referral = await this.referralService.createReferral(dto);
    return plainToInstance(ReferralResponseDto, referral);
  }
}
