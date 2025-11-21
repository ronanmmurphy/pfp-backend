import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookingLink1763749255558 implements MigrationInterface {
    name = 'AddBookingLink1763749255558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "booking_link" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "booking_link"`);
    }

}
