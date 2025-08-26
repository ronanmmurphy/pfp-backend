import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from '../enums/user-role.enum';
import { Eligibility } from '../enums/eligibility.enum';
import { MilitaryBranchAffiliation } from '../enums/military-branch.enum';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'phone_number', type: 'varchar', length: 50 })
  phoneNumber: string;

  @Column({ name: 'street_address1', type: 'varchar', length: 255 })
  streetAddress1: string;

  @Column({
    name: 'street_address2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  streetAddress2?: string | null;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city?: string | null;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  state?: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode?: string | null;

  @Column({ name: 'website', type: 'varchar', length: 255, nullable: true })
  website?: string | null;

  @Column({ name: 'referred_by', type: 'varchar', length: 255, nullable: true })
  referredBy?: string | null;

  @Column({ name: 'seeking_employment', type: 'boolean', nullable: true })
  seekingEmployment?: boolean | null;

  @Column({
    name: 'linkedin_profile',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  linkedinProfile?: string | null;

  @Column({
    name: 'eligibility',
    type: 'enum',
    enum: Eligibility,
    nullable: true,
  })
  eligibility?: Eligibility | null;

  @Column({
    name: 'military_branch_affiliation',
    type: 'enum',
    enum: MilitaryBranchAffiliation,
    nullable: true,
  })
  militaryBranchAffiliation?: MilitaryBranchAffiliation | null;

  @Column({ name: 'military_ets_date', type: 'date', nullable: true })
  militaryETSDate?: Date | null;

  @Column({ name: 'latitude', type: 'float8', nullable: true })
  latitude?: number;

  @Column({ name: 'longitude', type: 'float8', nullable: true })
  longitude?: number;
}
