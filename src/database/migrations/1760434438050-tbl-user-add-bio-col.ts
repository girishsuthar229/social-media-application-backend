import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUserAddBioCol1760434438050 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS bio TEXT;
        `);
    await queryRunner.query(`
            ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS comment TEXT;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users
            DROP COLUMN IF EXISTS bio;
        `);
    await queryRunner.query(`
            ALTER TABLE posts
            DROP COLUMN IF EXISTS comment;
        `);
  }
}
