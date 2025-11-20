import {
  CreateReferralDto,
  GetReferralsQueryDto,
  ReferralResponseDto,
} from '@/dtos/referral.dto';
import { User } from '@/guards/user.decorator';
import { ReferralService } from '@/services/referral.service';
import { IPaginatedResponse } from '@/types/shared.type';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post()
  async create(@Body() dto: CreateReferralDto): Promise<ReferralResponseDto> {
    const referral = await this.referralService.createReferral(dto);
    return plainToInstance(ReferralResponseDto, referral);
  }

  @Get()
  async getSessions(
    @User('sub') userId: number,
    @Query() query: GetReferralsQueryDto,
  ): Promise<IPaginatedResponse<ReferralResponseDto>> {
    const result = await this.referralService.getReferrals(userId, query);
    return {
      items: result.items.map((item) =>
        plainToInstance(ReferralResponseDto, item),
      ),
      total: result.total,
    };
  }
}
