import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeedbackFieldsToSessionEntity1758619925404 implements MigrationInterface {
    name = 'AddFeedbackFieldsToSessionEntity1758619925404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "photographer_feedback" text`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "veteran_feedback" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "veteran_feedback"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "photographer_feedback"`);
    }

}
