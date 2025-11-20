import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import {
  Eligibility,
  MilitaryBranchAffiliation,
  UserRole,
  UserStatus,
} from '../enums/user.enum';

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

  @Column({ name: 'status', type: 'enum', enum: UserStatus })
  status: UserStatus;

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

  @Column({ name: 'city', type: 'varchar', length: 100 })
  city: string;

  @Column({ name: 'state', type: 'varchar', length: 100 })
  state: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20 })
  postalCode: string;

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

  @Column({ name: 'latitude', type: 'float8' })
  latitude: number;

  @Column({ name: 'longitude', type: 'float8' })
  longitude: number;

  @Column({
    name: 'reason_for_denying',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  reasonForDenying?: string | null;

  @Column({ name: 'open_to_referrals', type: 'boolean', default: true })
  openToReferrals: boolean;

  // Photographer Onboarding
  @Column({
    name: 'mailing_street_address1',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mailingStreetAddress1?: string | null;

  @Column({
    name: 'mailing_street_address2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mailingStreetAddress2?: string | null;

  @Column({
    name: 'mailing_city',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  mailingCity?: string | null;

  @Column({
    name: 'mailing_state',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  mailingState?: string | null;

  @Column({
    name: 'mailing_postal_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  mailingPostalCode?: string | null;

  @Column({
    name: 'closest_base',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  closestBase?: string | null;

  @Column({
    name: 'agree_to_criminal_background_check',
    type: 'boolean',
    nullable: true,
  })
  agreeToCriminalBackgroundCheck?: boolean | null;

  @Column({
    name: 'social_media',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  socialMedia?: string | null;

  @Column({ name: 'is_home_studio', type: 'boolean', nullable: true })
  isHomeStudio?: boolean | null;

  @Column({
    name: 'part_of_home_studio',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  partOfHomeStudio?: string | null;

  @Column({ name: 'is_separate_entrance', type: 'boolean', nullable: true })
  isSeparateEntrance?: boolean | null;

  @Column({
    name: 'acknowledge_home_studio_agreement',
    type: 'boolean',
    nullable: true,
  })
  acknowledgeHomeStudioAgreement?: boolean | null;

  @Column({ name: 'is_studio_ada_accessible', type: 'boolean', nullable: true })
  isStudioAdaAccessible?: boolean | null;

  @Column({
    name: 'agree_to_volunteer_agreement',
    type: 'boolean',
    nullable: true,
  })
  agreeToVolunteerAgreement?: boolean | null;

  @Column({
    name: 'studio_space_images',
    type: 'text',
    array: true,
    default: [],
  })
  studioSpaceImages: string[];

  @Column({
    name: 'proof_of_insurance_images',
    type: 'text',
    array: true,
    default: [],
  })
  proofOfInsuranceImages: string[];
}
