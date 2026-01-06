import { MigrationInterface, QueryRunner } from 'typeorm';

export class FnUpdateAnddedStatusColumnMessageTable1767605825092 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        -- New status column (Sent, Delivered, Seen)
        ALTER TABLE "messages"
        ADD "status" VARCHAR(10) NOT NULL DEFAULT 'sent';
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "messages"
        DROP COLUMN "status";
      `);
  }
}
