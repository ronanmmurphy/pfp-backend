import { User } from './src/entities/user.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Session } from './src/entities/session.entity';
import { Referral } from './src/entities/referral.entity';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Session, Referral],
  migrations: ['./migrations/*.ts'],
  synchronize: false,
});
