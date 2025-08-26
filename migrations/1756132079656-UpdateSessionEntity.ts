import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSessionEntity1756132079656 implements MigrationInterface {
    name = 'UpdateSessionEntity1756132079656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "expiration_date"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "expiration_date" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "expiration_date"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "expiration_date" date`);
    }

}
