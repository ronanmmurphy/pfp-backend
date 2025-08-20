import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { UserRole } from '../enums/user-role.enum';
import { Eligibility } from '../enums/eligibility.enum';
import { MilitaryBranchAffiliation } from '../enums/military-branch.enum';

@Entity('profiles')
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.profile, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'phone_number', type: 'varchar', length: 50, nullable: true })
  phoneNumber?: string;

  @Column({
    name: 'street_address1',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  streetAddress1?: string;

  @Column({
    name: 'street_address2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  streetAddress2?: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ name: 'website', type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ name: 'referred_by', type: 'varchar', length: 255, nullable: true })
  referredBy?: string;

  @Column({ name: 'seeking_employment', type: 'boolean', default: false })
  seekingEmployment: boolean;

  @Column({
    name: 'linkedin_profile',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  linkedinProfile: string;

  @Column({
    name: 'eligibility',
    type: 'enum',
    enum: Eligibility,
    nullable: true,
  })
  eligibility: Eligibility;

  @Column({
    name: 'military_branch_affiliation',
    type: 'enum',
    enum: MilitaryBranchAffiliation,
    nullable: true,
  })
  militaryBranchAffiliation: MilitaryBranchAffiliation;

  @Column({ name: 'military_ets_date', type: 'date', nullable: true })
  militaryETSDate: Date;
}
