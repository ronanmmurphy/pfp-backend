import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1763621878035 implements MigrationInterface {
    name = 'InitSchema1763621878035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TYPE "public"."users_eligibility_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TYPE "public"."users_military_branch_affiliation_enum" AS ENUM('0', '1', '2', '3', '4', '5')`);
        await queryRunner.query(`CREATE TABLE "users" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "status" "public"."users_status_enum" NOT NULL, "phone_number" character varying(50) NOT NULL, "street_address1" character varying(255) NOT NULL, "street_address2" character varying(255), "city" character varying(100) NOT NULL, "state" character varying(100) NOT NULL, "postal_code" character varying(20) NOT NULL, "website" character varying(255), "referred_by" character varying(255), "seeking_employment" boolean, "linkedin_profile" character varying(255), "eligibility" "public"."users_eligibility_enum", "military_branch_affiliation" "public"."users_military_branch_affiliation_enum", "military_ets_date" date, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "reason_for_denying" character varying(500), "max_sessions_per_month" integer, "mailing_street_address1" character varying(255), "mailing_street_address2" character varying(255), "mailing_city" character varying(100), "mailing_state" character varying(100), "mailing_postal_code" character varying(20), "closest_base" character varying(255), "agree_to_criminal_background_check" boolean, "x_link" character varying(255), "facebook_link" character varying(255), "linkedin_link" character varying(255), "instagram_link" character varying(255), "is_home_studio" boolean, "part_of_home_studio" character varying(255), "is_separate_entrance" boolean, "acknowledge_home_studio_agreement" boolean, "is_studio_ada_accessible" boolean, "agree_to_volunteer_agreement" boolean, "studio_space_images" text array NOT NULL DEFAULT '{}', "proof_of_insurance_images" text array NOT NULL DEFAULT '{}', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."sessions_status_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_outcome_photographer_enum" AS ENUM('0', '1', '2', '3', '4')`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_outcome_veteran_enum" AS ENUM('0', '1', '2', '3', '4')`);
        await queryRunner.query(`CREATE TABLE "sessions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying(200), "note" text, "status" "public"."sessions_status_enum" NOT NULL DEFAULT '0', "date" TIMESTAMP WITH TIME ZONE NOT NULL, "outcome_photographer" "public"."sessions_outcome_photographer_enum", "other_outcome_photographer" text, "rate_photographer" integer, "photographer_feedback" text, "outcome_veteran" "public"."sessions_outcome_veteran_enum", "other_outcome_veteran" text, "rate_veteran" integer, "veteran_feedback" text, "photographer_id" integer, "veteran_id" integer, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_sessions_photographer_id" ON "sessions" ("photographer_id") `);
        await queryRunner.query(`CREATE INDEX "idx_sessions_veteran_id" ON "sessions" ("veteran_id") `);
        await queryRunner.query(`CREATE TYPE "public"."referrals_status_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "referrals" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "photographer_id" integer NOT NULL, "veteran_id" integer NOT NULL, "status" "public"."referrals_status_enum" NOT NULL DEFAULT '0', "last_followed_up_at" TIMESTAMP NOT NULL DEFAULT now(), "follow_up_count" integer NOT NULL, CONSTRAINT "PK_ea9980e34f738b6252817326c08" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_421ed29dd32bd144f38a41235e8" FOREIGN KEY ("photographer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_8a4e0decc8b5f0be1000216e6d8" FOREIGN KEY ("veteran_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_8a4e0decc8b5f0be1000216e6d8"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_421ed29dd32bd144f38a41235e8"`);
        await queryRunner.query(`DROP TABLE "referrals"`);
        await queryRunner.query(`DROP TYPE "public"."referrals_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sessions_veteran_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sessions_photographer_id"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_outcome_veteran_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_outcome_photographer_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_military_branch_affiliation_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_eligibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
