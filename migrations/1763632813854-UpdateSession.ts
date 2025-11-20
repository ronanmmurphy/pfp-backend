import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSession1763632813854 implements MigrationInterface {
    name = 'UpdateSession1763632813854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "last_followed_up_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "follow_up_count" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "follow_up_count"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "last_followed_up_at"`);
    }

}
