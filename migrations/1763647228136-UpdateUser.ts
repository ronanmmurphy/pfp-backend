import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1763647228136 implements MigrationInterface {
    name = 'UpdateUser1763647228136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "max_sessions_per_month"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "x_link"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "facebook_link"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "linkedin_link"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "instagram_link"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "open_to_referrals" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "social_media" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "social_media"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "open_to_referrals"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "instagram_link" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "linkedin_link" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "facebook_link" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "x_link" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "max_sessions_per_month" integer`);
    }

}
