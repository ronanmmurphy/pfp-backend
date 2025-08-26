import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { SessionStatus } from '../enums/session-status.enum';
import { User } from './user.entity';

@Entity('sessions')
export class Session extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.REQUESTED,
  })
  status: SessionStatus;

  @Column({ name: 'date', type: 'timestamptz' })
  date: Date;

  @Column({ name: 'expiration_date', type: 'timestamptz', nullable: true })
  expirationDate?: Date | null;

  // Many sessions per photographer user
  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'photographer_id' })
  @Index('idx_sessions_photographer_id')
  photographer: User;

  // Many sessions per veteran user
  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'veteran_id' })
  @Index('idx_sessions_veteran_id')
  veteran: User;
}
