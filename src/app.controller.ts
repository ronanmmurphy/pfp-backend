import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CronService } from './services/cron.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private cronService: CronService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-cron')
  async testCron() {
    await this.cronService.handleDailyReminders();
  }
}
