import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { SessionOutcome, SessionStatus } from '../enums/session.enum';
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
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({ name: 'date', type: 'timestamptz' })
  date: Date;

  @Column({
    name: 'outcome_photographer',
    type: 'enum',
    enum: SessionOutcome,
    nullable: true,
  })
  outcomePhotographer?: SessionOutcome | null;

  @Column({ name: 'rate_photographer', type: 'int', nullable: true })
  ratePhotographer?: number | null;

  @Column({ name: 'photographer_feedback', type: 'text', nullable: true })
  photographerFeedback?: string | null;

  @Column({
    name: 'outcome_veteran',
    type: 'enum',
    enum: SessionOutcome,
    nullable: true,
  })
  outcomeVeteran?: SessionOutcome | null;

  @Column({ name: 'rate_veteran', type: 'int', nullable: true })
  rateVeteran?: number | null;

  @Column({ name: 'veteran_feedback', type: 'text', nullable: true })
  veteranFeedback?: string | null;

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
