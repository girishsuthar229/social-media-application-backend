import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUserAddPrivareColumn1760436351922
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "users"
          ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "users"
          DROP COLUMN IF EXISTS is_private;
        `);
  }
}
