import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUpdateUser1759314325666 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE users
          RENAME COLUMN created_at TO created_date;
        `);
    await queryRunner.query(`
          ALTER TABLE users
          RENAME COLUMN updated_at TO modified_date;
        `);
    await queryRunner.query(`
          ALTER TABLE users
          ADD COLUMN created_by VARCHAR(50),
          ADD COLUMN modified_by VARCHAR(50);
        `);
    await queryRunner.query(`
          ALTER TABLE users
          ALTER COLUMN created_date SET NOT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE users
          DROP COLUMN created_by,
          DROP COLUMN modified_by;
        `);
    await queryRunner.query(`
          ALTER TABLE users
          RENAME COLUMN created_date TO created_at;
        `);
    await queryRunner.query(`
          ALTER TABLE users
          RENAME COLUMN modified_date TO updated_at;
        `);
    await queryRunner.query(`
          ALTER TABLE users
          ALTER COLUMN created_at DROP NOT NULL;
        `);
  }
}
