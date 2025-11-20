import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReferral1763622750213 implements MigrationInterface {
    name = 'UpdateReferral1763622750213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" ALTER COLUMN "last_followed_up_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "referrals" ALTER COLUMN "follow_up_count" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" ALTER COLUMN "follow_up_count" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "referrals" ALTER COLUMN "last_followed_up_at" SET NOT NULL`);
    }

}
