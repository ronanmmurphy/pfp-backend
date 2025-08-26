import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  Patch,
  Delete,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';
import {
  CreateSessionDto,
  SessionItem,
  SessionPageResponse,
  SessionQueryDto,
} from '@/dtos/session.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionService.create(dto);
  }

  @Get('/recent/list')
  async recent(
    @Req() req: any,
    @Query(
      'limit',
      new ParseIntPipe({ optional: true }),
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    limit: number = 10,
  ) {
    return this.sessionService.getRecentSessions(req.user.sub, limit);
  }

  @Get()
  async getSessions(
    @Req() req: any,
    @Query() query: SessionQueryDto,
  ): Promise<SessionPageResponse<SessionItem>> {
    return this.sessionService.getSessions(req.user.sub, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: any,
  ) {
    return this.sessionService.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sessionService.remove(id);
  }
}
