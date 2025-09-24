import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReasonForDenying1757861279866 implements MigrationInterface {
    name = 'AddReasonForDenying1757861279866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "reason_for_denying" character varying(500)`);
        await queryRunner.query(`ALTER TYPE "public"."users_status_enum" RENAME TO "users_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" TYPE "public"."users_status_enum" USING "status"::"text"::"public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum_old" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" TYPE "public"."users_status_enum_old" USING "status"::"text"::"public"."users_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_status_enum_old" RENAME TO "users_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reason_for_denying"`);
    }

}
