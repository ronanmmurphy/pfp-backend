import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { Session } from '../entities/session.entity';
import { SessionStatus } from '../enums/session-status.enum';
import { UserRepository } from './user.repository';
import { UserRole } from '../enums/user-role.enum';
import {
  SessionItem,
  SessionQueryDto,
  UpdateSession,
} from '../dtos/session.dto';
import { plainToClass } from 'class-transformer';

type CreateSession = {
  name: string;
  note?: string | null;
  status?: SessionStatus;
  date: Date;
  expirationDate?: Date | null;
  photographerId: number;
  veteranId: number;
};

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session) private readonly repo: Repository<Session>,
    private readonly userRepo: UserRepository,
  ) {}

  async createAndSave(createSession: CreateSession) {
    const { photographerId, veteranId } = createSession;

    // ensure users exist
    const [photographer, veteran] = await Promise.all([
      this.userRepo.findById(photographerId),
      this.userRepo.findById(veteranId),
    ]);

    if (!photographer)
      throw new NotFoundException('Photographer user not found');
    if (!veteran) throw new NotFoundException('Veteran user not found');

    if (photographer.role !== UserRole.PHOTOGRAPHER) {
      throw new BadRequestException(
        'photographerId must reference a PHOTOGRAPHER',
      );
    }
    if (veteran.role !== UserRole.VETERAN) {
      throw new BadRequestException('veteranId must reference a VETERAN');
    }

    // create + save
    const entity = this.repo.create({
      name: createSession.name,
      note: createSession?.note ?? null,
      status: createSession?.status ?? SessionStatus.REQUESTED,
      date: createSession.date,
      expirationDate: createSession?.expirationDate ?? null,
      photographer,
      veteran,
    });
    return this.repo.save(entity);
  }

  async updateSession(
    id: number,
    userId: number,
    role: UserRole,
    update: UpdateSession,
  ): Promise<Session> {
    const session = await this.repo.findOne({
      where: {
        id,
        ...(role === UserRole.PHOTOGRAPHER
          ? { photographer: { id: userId } }
          : { veteran: { id: userId } }),
      },
      relations: ['photographer', 'veteran'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Validate actions based on role and current status
    if (update.status) {
      if (role === UserRole.VETERAN) {
        if (
          ![
            SessionStatus.RESCHEDULE_REQUESTED,
            SessionStatus.SCHEDULED,
            SessionStatus.COMPLETED,
            SessionStatus.CANCELED,
          ].includes(update.status)
        ) {
          throw new BadRequestException('Invalid status update for veteran');
        }
      } else if (role === UserRole.PHOTOGRAPHER) {
        if (
          ![
            SessionStatus.RESCHEDULE_REQUESTED,
            SessionStatus.SCHEDULED,
            SessionStatus.COMPLETED,
            SessionStatus.CANCELED,
          ].includes(update.status)
        ) {
          throw new BadRequestException(
            'Invalid status update for photographer',
          );
        }
        if (
          update.status === SessionStatus.SCHEDULED &&
          session.status !== SessionStatus.REQUESTED &&
          session.status !== SessionStatus.RESCHEDULE_REQUESTED
        ) {
          throw new BadRequestException(
            'Can only approve REQUESTED or RESCHEDULE_REQUESTED sessions',
          );
        }
      }
    }

    if (update.date) {
      session.date = new Date(update.date);
      session.status = SessionStatus.RESCHEDULE_REQUESTED;
    } else if (update.status) {
      session.status = update.status;
    }

    return this.repo.save(session);
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: { photographer: true, veteran: true },
    });
  }

  async findAll() {
    return this.repo.find({
      relations: { photographer: true, veteran: true },
      order: { date: 'DESC' },
    });
  }

  async removeById(id: number) {
    await this.repo.delete({ id });
  }

  async countByStatus(status: SessionStatus) {
    return await this.repo.count({ where: { status } });
  }

  async countForUserByStatusAndRole(
    userId: number,
    role: UserRole,
    status: SessionStatus,
  ) {
    if (role === UserRole.PHOTOGRAPHER) {
      return this.repo.count({
        where: { status, photographer: { id: userId } },
      });
    }
    if (role === UserRole.VETERAN) {
      return this.repo.count({
        where: { status, veteran: { id: userId } },
      });
    }

    return await this.countByStatus(status);
  }

  async findSessions(userId: number, role: UserRole, query: SessionQueryDto) {
    const where: FindOptionsWhere<Session>[] = [];

    if (role === UserRole.PHOTOGRAPHER) {
      where.push({ photographer: { id: userId } });
    } else if (role === UserRole.VETERAN) {
      where.push({ veteran: { id: userId } });
    }

    if (query.search) {
      const search = `%${query.search.trim()}%`;
      const searchConditions: FindOptionsWhere<Session>[] = [];

      if (role === UserRole.ADMIN) {
        // Search session.name, photographer's names, and veteran's names
        searchConditions.push(
          { name: Like(search) },
          { photographer: { firstName: Like(search) } },
          { photographer: { lastName: Like(search) } },
          { veteran: { firstName: Like(search) } },
          { veteran: { lastName: Like(search) } },
        );
      } else if (role === UserRole.PHOTOGRAPHER) {
        // Search session.name and veteran's names
        searchConditions.push(
          { name: Like(search), photographer: { id: userId } },
          {
            veteran: { firstName: Like(search), id: Not(userId) },
            photographer: { id: userId },
          },
          {
            veteran: { lastName: Like(search), id: Not(userId) },
            photographer: { id: userId },
          },
        );
      } else if (role === UserRole.VETERAN) {
        // Search session.name and photographer's names
        searchConditions.push(
          { name: Like(search), veteran: { id: userId } },
          {
            photographer: { firstName: Like(search), id: Not(userId) },
            veteran: { id: userId },
          },
          {
            photographer: { lastName: Like(search), id: Not(userId) },
            veteran: { id: userId },
          },
        );
      }

      if (role === UserRole.ADMIN) {
        where.push(...searchConditions);
      } else {
        where[0] =
          searchConditions.length > 0
            ? { ...where[0], ...searchConditions[0] }
            : where[0];
        where.push(...searchConditions.slice(1));
      }
    }

    if (query.status !== undefined) {
      if (where.length === 0) {
        where.push({ status: query.status });
      } else {
        where.forEach((condition) => {
          condition.status = query.status;
        });
      }
    }

    if (query.dateFrom) {
      const dateFrom = new Date(query.dateFrom);
      if (isNaN(dateFrom.getTime())) {
        throw new BadRequestException('Invalid dateFrom format');
      }
      if (where.length === 0) {
        where.push({ date: MoreThanOrEqual(dateFrom) });
      } else {
        where.forEach((condition) => {
          condition.date = MoreThanOrEqual(dateFrom);
        });
      }
    }

    if (query.dateTo) {
      const dateTo = new Date(query.dateTo);
      if (isNaN(dateTo.getTime())) {
        throw new BadRequestException('Invalid dateTo format');
      }
      if (where.length === 0) {
        where.push({ date: LessThanOrEqual(dateTo) });
      } else {
        where.forEach((condition) => {
          condition.date = LessThanOrEqual(dateTo);
        });
      }
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.repo.findAndCount({
      where: where.length > 0 ? where : undefined,
      relations: ['photographer', 'veteran'],
      skip,
      take: pageSize,
    });

    const sessionItems: SessionItem[] = items.map((session) => {
      return plainToClass(SessionItem, {
        id: session.id,
        name: session.name,
        note: session?.note ?? undefined,
        status: session.status,
        date: session.date.toISOString(),
        expirationDate: session?.expirationDate
          ? session?.expirationDate.toISOString()
          : undefined,
        photographer: session.photographer,
        veteran: session.veteran,
      });
    });

    return { items: sessionItems, total };
  }

  async findRecent(userId: number, role: UserRole, limit: number) {
    if (role === UserRole.ADMIN) {
      return this.repo.find({
        relations: { photographer: true, veteran: true },
        order: { date: 'DESC' },
        take: limit,
      });
    }

    if (role === UserRole.PHOTOGRAPHER) {
      return this.repo.find({
        where: { photographer: { id: userId } },
        relations: { photographer: true, veteran: true },
        order: { date: 'DESC' },
        take: limit,
      });
    }

    if (role === UserRole.VETERAN) {
      return this.repo.find({
        where: { veteran: { id: userId } },
        relations: { photographer: true, veteran: true },
        order: { date: 'DESC' },
        take: limit,
      });
    }
  }
}
