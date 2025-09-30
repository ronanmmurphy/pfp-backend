import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserRepository } from './repositories/user.repository';
import { JwtStrategy } from './guards/jwt.strategy';
import { SessionController } from './controllers/session.controller';
import { SessionService } from './services/session.service';
import { SessionRepository } from './repositories/session.repository';
import { Session } from './entities/session.entity';
import { StatsController } from './controllers/stats.controller';
import { StatsService } from './services/stats.service';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Referral } from './entities/referral.entity';
import { ReferralController } from './controllers/referral.controller';
import { ReferralService } from './services/referral.service';
import { ReferralRepository } from './repositories/referral.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './services/cron.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT') ?? 5432,
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [User, Session, Referral],
        synchronize: false,
        migrations: ['dist/migrations/*.js'],
        migrationsRun: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Session, Referral]),
    JwtModule.register({}),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'), // <-- '..' because uploads is next to src
      serveRoot: '/uploads', // URL prefix
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    StatsController,
    SessionController,
    ReferralController,
  ],
  providers: [
    AppService,
    AuthService,
    UserService,
    StatsService,
    SessionService,
    ReferralService,
    CronService,
    UserRepository,
    SessionRepository,
    ReferralRepository,
    JwtStrategy,
  ],
})
export class AppModule {}
