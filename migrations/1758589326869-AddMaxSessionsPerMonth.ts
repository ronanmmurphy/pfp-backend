import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaxSessionsPerMonth1758589326869 implements MigrationInterface {
    name = 'AddMaxSessionsPerMonth1758589326869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "max_sessions_per_month" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "max_sessions_per_month"`);
    }

}
