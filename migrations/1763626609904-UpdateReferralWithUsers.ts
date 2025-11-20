import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReferralWithUsers1763626609904 implements MigrationInterface {
    name = 'UpdateReferralWithUsers1763626609904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" ALTER COLUMN "photographer_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "referrals" ALTER COLUMN "veteran_id" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_referrals_photographer_id" ON "referrals" ("photographer_id") `);
        await queryRunner.query(`CREATE INDEX "idx_referrals_veteran_id" ON "referrals" ("veteran_id") `);
        await queryRunner.query(`ALTER TABLE "referrals" ADD CONSTRAINT "FK_f3fd5a27084efa0fabd2247aa44" FOREIGN KEY ("photographer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "referrals" ADD CONSTRAINT "FK_c6b25c319d79f69d0129006d5a2" FOREIGN KEY ("veteran_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" DROP CONSTRAINT "FK_c6b25c319d79f69d0129006d5a2"`);
        await queryRunner.query(`ALTER TABLE "referrals" DROP CONSTRAINT "FK_f3fd5a27084efa0fabd2247aa44"`);
        await queryRunner.query(`DROP INDEX "public"."idx_referrals_veteran_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_referrals_photographer_id"`);
        await queryRunner.query(`ALTER TABLE "referrals" ALTER COLUMN "veteran_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "referrals" ALTER COLUMN "photographer_id" SET NOT NULL`);
    }

}
