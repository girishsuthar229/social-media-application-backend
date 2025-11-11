import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUpdateUserAndRole1759313407457 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles
      RENAME COLUMN created_at TO created_date;
    `);

    await queryRunner.query(`
      ALTER TABLE roles
      RENAME COLUMN updated_at TO modified_date;
    `);

    // Add created_by and modified_by columns
    await queryRunner.query(`
      ALTER TABLE roles
      ADD COLUMN created_by VARCHAR(50),
      ADD COLUMN modified_by VARCHAR(50);
    `);

    // Optional: set NOT NULL for created_date if needed
    await queryRunner.query(`
      ALTER TABLE roles
      ALTER COLUMN created_date SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert added columns
    await queryRunner.query(`
      ALTER TABLE roles
      DROP COLUMN created_by,
      DROP COLUMN modified_by;
    `);

    // Rename columns back
    await queryRunner.query(`
      ALTER TABLE roles
      RENAME COLUMN created_date TO created_at;
    `);

    await queryRunner.query(`
      ALTER TABLE roles
      RENAME COLUMN modified_date TO updated_at;
    `);

    // Optional: revert NOT NULL if it was set
    await queryRunner.query(`
      ALTER TABLE roles
      ALTER COLUMN created_at DROP NOT NULL;
    `);
  }
}
