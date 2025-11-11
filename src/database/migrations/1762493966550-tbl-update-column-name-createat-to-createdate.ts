import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUpdateColumnNameCreateatToCreatedate1762493966550
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Renaming columns in likes, shares, and follows tables
    await queryRunner.query(`
            ALTER TABLE "likes"
            RENAME COLUMN "created_at" TO "created_date";
        `);
    await queryRunner.query(`
            ALTER TABLE "shares"
            RENAME COLUMN "created_at" TO "created_date";
        `);
    await queryRunner.query(`
            ALTER TABLE "follows"
            RENAME COLUMN "created_at" TO "created_date";
        `);

    // 2. Adding new columns in likes, shares, and follows tables
    await queryRunner.query(`
            ALTER TABLE "likes"
            ADD "created_by" VARCHAR(50);
        `);
    await queryRunner.query(`
            ALTER TABLE "likes"
            ADD "modified_by" VARCHAR(50);
        `);
    await queryRunner.query(`
            ALTER TABLE "likes"
            ADD "modified_date" timestamp(3) without time zone;
        `);

    await queryRunner.query(`
            ALTER TABLE "shares"
            ADD "created_by" VARCHAR(50);
        `);
    await queryRunner.query(`
            ALTER TABLE "shares"
            ADD "modified_by" VARCHAR(50);
        `);
    await queryRunner.query(`
            ALTER TABLE "shares"
            ADD "modified_date" timestamp(3) without time zone;
        `);

    await queryRunner.query(`
            ALTER TABLE "follows"
            ADD "created_by" VARCHAR(50);
        `);
    await queryRunner.query(`
            ALTER TABLE "follows"
            ADD "modified_by" VARCHAR(50);
        `);
    await queryRunner.query(`
            ALTER TABLE "follows"
            ADD "modified_date" timestamp(3) without time zone;
        `);

    // 3. Renaming column in the users table (deleted_at -> deleted_date)
    await queryRunner.query(`
            ALTER TABLE "users"
            RENAME COLUMN "deleted_at" TO "deleted_date";
        `);

    // 4. Adding deleted_date column to the columns table
    await queryRunner.query(`
            ALTER TABLE "comments"
            ADD "deleted_date" timestamp(3) without time zone;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Reverting columns in likes, shares, and follows tables
    await queryRunner.query(`
            ALTER TABLE "likes"
            RENAME COLUMN "created_date" TO "created_at";
        `);
    await queryRunner.query(`
            ALTER TABLE "shares"
            RENAME COLUMN "created_date" TO "created_at";
        `);
    await queryRunner.query(`
            ALTER TABLE "follows"
            RENAME COLUMN "created_date" TO "created_at";
        `);

    // 2. Dropping new columns in likes, shares, and follows tables
    await queryRunner.query(`
            ALTER TABLE "likes"
            DROP COLUMN "created_by";
        `);
    await queryRunner.query(`
            ALTER TABLE "likes"
            DROP COLUMN "modified_by";
        `);
    await queryRunner.query(`
            ALTER TABLE "likes"
            DROP COLUMN "modified_date";
        `);

    await queryRunner.query(`
            ALTER TABLE "shares"
            DROP COLUMN "created_by";
        `);
    await queryRunner.query(`
            ALTER TABLE "shares"
            DROP COLUMN "modified_by";
        `);
    await queryRunner.query(`
            ALTER TABLE "shares"
            DROP COLUMN "modified_date";
        `);

    await queryRunner.query(`
            ALTER TABLE "follows"
            DROP COLUMN "created_by";
        `);
    await queryRunner.query(`
            ALTER TABLE "follows"
            DROP COLUMN "modified_by";
        `);
    await queryRunner.query(`
            ALTER TABLE "follows"
            DROP COLUMN "modified_date";
        `);

    // 3. Renaming column in the users table (deleted_date -> deleted_at)
    await queryRunner.query(`
            ALTER TABLE "users"
            RENAME COLUMN "deleted_date" TO "deleted_at";
        `);

    // 4. Dropping deleted_date column from columns table
    await queryRunner.query(`
            ALTER TABLE "comments"
            DROP COLUMN "deleted_date";
        `);
  }
}
