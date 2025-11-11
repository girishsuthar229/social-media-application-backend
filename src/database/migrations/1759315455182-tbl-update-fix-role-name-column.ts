import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUpdateFixRoleNameColumn1759315455182
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Update existing NULL values with a default
    await queryRunner.query(
      `UPDATE "roles" SET "name" = 'default_role' WHERE "name" IS NULL`,
    );

    // Step 2: Alter column to NOT NULL
    await queryRunner.query(
      `ALTER TABLE "roles" ALTER COLUMN "name" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Allow NULLs again in case of rollback
    await queryRunner.query(
      `ALTER TABLE "roles" ALTER COLUMN "name" DROP NOT NULL`,
    );
  }
}
