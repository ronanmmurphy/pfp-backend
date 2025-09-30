import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCityStatePostalCodeRequired1759114829844 implements MigrationInterface {
    name = 'MakeCityStatePostalCodeRequired1759114829844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "city" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "state" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "postal_code" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "postal_code" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "state" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "city" DROP NOT NULL`);
    }

}
