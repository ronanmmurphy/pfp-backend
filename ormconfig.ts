// ormconfig.ts
import { Profile } from './src/entities/profile.entity';
import { User } from './src/entities/user.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Profile],
  migrations: ['./migrations/*.ts'],
  synchronize: false,
});
