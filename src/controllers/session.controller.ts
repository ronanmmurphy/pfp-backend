import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';
import {
  CreateSessionDto,
  GetSessionsQueryDto,
  SessionResponseDto,
  UpdateSessionDto,
} from '@/dtos/session.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { IPaginatedResponse } from '@/types/shared.type';
import { User } from '@/guards/user.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async create(@Body() dto: CreateSessionDto): Promise<SessionResponseDto> {
    const session = await this.sessionService.createSession(dto);
    return plainToInstance(SessionResponseDto, session);
  }

  @Get()
  async getSessions(
    @User('sub') userId: number,
    @Query() query: GetSessionsQueryDto,
  ): Promise<IPaginatedResponse<SessionResponseDto>> {
    const result = await this.sessionService.getSessions(userId, query);
    return {
      items: result.items.map((item) =>
        plainToInstance(SessionResponseDto, item),
      ),
      total: result.total,
    };
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

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionService.updateSession(id, dto);
    return plainToInstance(SessionResponseDto, session);
  }
}
