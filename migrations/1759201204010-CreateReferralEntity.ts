import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReferralEntity1759201204010 implements MigrationInterface {
    name = 'CreateReferralEntity1759201204010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "referrals" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "photographer_id" integer NOT NULL, "veteran_id" integer NOT NULL, CONSTRAINT "PK_ea9980e34f738b6252817326c08" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "expiration_date"`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_outcome_photographer_enum" AS ENUM('0', '1', '2', '3', '4')`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "outcome_photographer" "public"."sessions_outcome_photographer_enum"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "rate_photographer" integer`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_outcome_veteran_enum" AS ENUM('0', '1', '2', '3', '4')`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "outcome_veteran" "public"."sessions_outcome_veteran_enum"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "rate_veteran" integer`);
        await queryRunner.query(`ALTER TYPE "public"."sessions_status_enum" RENAME TO "sessions_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_status_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" TYPE "public"."sessions_status_enum" USING "status"::"text"::"public"."sessions_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "public"."sessions_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sessions_status_enum_old" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" TYPE "public"."sessions_status_enum_old" USING "status"::"text"::"public"."sessions_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "public"."sessions_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sessions_status_enum_old" RENAME TO "sessions_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "rate_veteran"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "outcome_veteran"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_outcome_veteran_enum"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "rate_photographer"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "outcome_photographer"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_outcome_photographer_enum"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "expiration_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`DROP TABLE "referrals"`);
    }

}
