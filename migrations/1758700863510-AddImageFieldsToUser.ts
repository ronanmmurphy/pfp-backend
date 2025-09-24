import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageFieldsToUser1758700863510 implements MigrationInterface {
    name = 'AddImageFieldsToUser1758700863510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "studio_space_images" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "proof_of_insurance_images" text array NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "proof_of_insurance_images"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "studio_space_images"`);
    }

}
