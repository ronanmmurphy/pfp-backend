import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSessionEnum1758592053319 implements MigrationInterface {
    name = 'UpdateSessionEnum1758592053319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."sessions_status_enum" RENAME TO "sessions_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_status_enum" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" TYPE "public"."sessions_status_enum" USING "status"::"text"::"public"."sessions_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "public"."sessions_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sessions_status_enum_old" AS ENUM('0', '1', '2', '3', '4')`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" TYPE "public"."sessions_status_enum_old" USING "status"::"text"::"public"."sessions_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "public"."sessions_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sessions_status_enum_old" RENAME TO "sessions_status_enum"`);
    }

}
