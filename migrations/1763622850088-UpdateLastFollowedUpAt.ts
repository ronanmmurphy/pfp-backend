import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLastFollowedUpAt1763622850088 implements MigrationInterface {
    name = 'UpdateLastFollowedUpAt1763622850088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" DROP COLUMN "last_followed_up_at"`);
        await queryRunner.query(`ALTER TABLE "referrals" ADD "last_followed_up_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" DROP COLUMN "last_followed_up_at"`);
        await queryRunner.query(`ALTER TABLE "referrals" ADD "last_followed_up_at" TIMESTAMP DEFAULT now()`);
    }

}
