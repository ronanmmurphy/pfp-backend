import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('referrals')
export class Referral extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'photographer_id', type: 'int' })
  photographerId: number;

  @Column({ name: 'veteran_id', type: 'int' })
  veteranId: number;
}
