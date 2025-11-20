import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ReferralStatus } from '../enums/referral.enum';
import { User } from './user.entity';

@Entity('referrals')
export class Referral extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ReferralStatus,
    default: ReferralStatus.MATCHED,
  })
  status: ReferralStatus;

  @Column({ name: 'last_followed_up_at', type: 'timestamptz', nullable: true })
  lastFollowedUpAt?: Date | null;

  @Column({ name: 'follow_up_count', type: 'int', nullable: true })
  followUpCount?: number | null;

  // Relations
  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'photographer_id' })
  @Index('idx_referrals_photographer_id')
  photographer: User;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'veteran_id' })
  @Index('idx_referrals_veteran_id')
  veteran: User;
}
