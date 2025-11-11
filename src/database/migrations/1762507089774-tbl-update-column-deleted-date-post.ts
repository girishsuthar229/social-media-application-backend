import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUpdateColumnDeletedDatePost1762507089774
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE "posts"
                RENAME COLUMN "delete_date" TO "deleted_date";
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "posts"
            RENAME COLUMN "deleted_date" TO "delete_date";
          `);
  }
}
