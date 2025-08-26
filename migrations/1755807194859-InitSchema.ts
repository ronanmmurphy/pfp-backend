import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1755807194859 implements MigrationInterface {
  name = 'InitSchema1755807194859';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_eligibility_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_military_branch_affiliation_enum" AS ENUM('0', '1', '2', '3', '4', '5')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sessions_status_enum" AS ENUM('0', '1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "phone_number" character varying(50) NOT NULL, "street_address1" character varying(255) NOT NULL, "street_address2" character varying(255), "city" character varying(100), "state" character varying(100), "postal_code" character varying(20), "website" character varying(255), "referred_by" character varying(255), "seeking_employment" boolean, "linkedin_profile" character varying(255), "eligibility" "public"."users_eligibility_enum", "military_branch_affiliation" "public"."users_military_branch_affiliation_enum", "military_ets_date" date, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "note" text, "status" "public"."sessions_status_enum" NOT NULL DEFAULT '0', "date" TIMESTAMP WITH TIME ZONE NOT NULL, "expiration_date" date, "photographer_id" integer, "veteran_id" integer, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sessions_photographer_id" ON "sessions" ("photographer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sessions_veteran_id" ON "sessions" ("veteran_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_421ed29dd32bd144f38a41235e8" FOREIGN KEY ("photographer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_8a4e0decc8b5f0be1000216e6d8" FOREIGN KEY ("veteran_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_8a4e0decc8b5f0be1000216e6d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_421ed29dd32bd144f38a41235e8"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_sessions_veteran_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_sessions_photographer_id"`,
    );
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."sessions_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."users_military_branch_affiliation_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_eligibility_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
