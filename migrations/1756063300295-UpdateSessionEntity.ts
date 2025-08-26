import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSessionEntity1756063300295 implements MigrationInterface {
    name = 'UpdateSessionEntity1756063300295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_421ed29dd32bd144f38a41235e8"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_8a4e0decc8b5f0be1000216e6d8"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_421ed29dd32bd144f38a41235e8" FOREIGN KEY ("photographer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_8a4e0decc8b5f0be1000216e6d8" FOREIGN KEY ("veteran_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_8a4e0decc8b5f0be1000216e6d8"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_421ed29dd32bd144f38a41235e8"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_8a4e0decc8b5f0be1000216e6d8" FOREIGN KEY ("veteran_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_421ed29dd32bd144f38a41235e8" FOREIGN KEY ("photographer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
