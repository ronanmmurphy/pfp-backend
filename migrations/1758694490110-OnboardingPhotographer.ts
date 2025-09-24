import { MigrationInterface, QueryRunner } from "typeorm";

export class OnboardingPhotographer1758694490110 implements MigrationInterface {
    name = 'OnboardingPhotographer1758694490110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "mailing_street_address1" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "mailing_street_address2" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "mailing_city" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "mailing_state" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "mailing_postal_code" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "closest_base" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "agree_to_criminal_background_check" boolean`);
        await queryRunner.query(`ALTER TABLE "users" ADD "x_link" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "facebook_link" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "linkedin_link" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "instagram_link" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_home_studio" boolean`);
        await queryRunner.query(`ALTER TABLE "users" ADD "part_of_home_studio" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_separate_entrance" boolean`);
        await queryRunner.query(`ALTER TABLE "users" ADD "acknowledge_home_studio_agreement" boolean`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_studio_ada_accessible" boolean`);
        await queryRunner.query(`ALTER TABLE "users" ADD "agree_to_volunteer_agreement" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "agree_to_volunteer_agreement"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_studio_ada_accessible"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "acknowledge_home_studio_agreement"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_separate_entrance"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "part_of_home_studio"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_home_studio"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "instagram_link"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "linkedin_link"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "facebook_link"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "x_link"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "agree_to_criminal_background_check"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "closest_base"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mailing_postal_code"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mailing_state"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mailing_city"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mailing_street_address2"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mailing_street_address1"`);
    }

}
