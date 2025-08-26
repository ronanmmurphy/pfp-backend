import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { StatsService } from '../services/stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  async me(@Req() req: any) {
    return this.statsService.forUser(req.user.sub);
  }

  @Get('admin')
  async admin(@Req() req: any) {
    return this.statsService.forAdmin(req.user.sub);
  }
}
