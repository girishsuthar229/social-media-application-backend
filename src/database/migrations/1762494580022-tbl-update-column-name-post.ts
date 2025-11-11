import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUpdateColumnNamePost1762494580022
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "posts"
            RENAME COLUMN "create_date" TO "created_date";
        `);
    await queryRunner.query(`
            ALTER TABLE "posts"
            RENAME COLUMN "update_date" TO "modified_date";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "posts"
        RENAME COLUMN "created_date" TO "create_date";
      `);
    await queryRunner.query(`
        ALTER TABLE "posts"
        RENAME COLUMN "modified_date" TO "update_date";
      `);
  }
}
