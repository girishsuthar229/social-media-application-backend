import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUpdatePosts1762492415351 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
              ALTER TABLE "posts"
              RENAME COLUMN "created_at" TO "create_date";
            `);
    await queryRunner.query(`
              ALTER TABLE "posts"
              RENAME COLUMN "updated_at" TO "update_date";
            `);
    await queryRunner.query(`
              ALTER TABLE "posts"
              RENAME COLUMN "deleted_at" TO "delete_date";
            `);
    await queryRunner.query(`
              ALTER TABLE "posts"
              ADD "comment_count" integer NOT NULL DEFAULT 0;
            `);
    await queryRunner.query(`
                ALTER TABLE "posts"
                ADD "created_by" VARCHAR(50);
              `);

    await queryRunner.query(`
                ALTER TABLE "posts"
                ADD "modified_by" VARCHAR(50);
              `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
              ALTER TABLE "posts"
              RENAME COLUMN "create_date" TO "created_at";
            `);
    await queryRunner.query(`
              ALTER TABLE "posts"
              RENAME COLUMN "update_date" TO "updated_at";
            `);
    await queryRunner.query(`
              ALTER TABLE "posts"
              RENAME COLUMN "delete_date" TO "deleted_at";
            `);
    await queryRunner.query(`
              ALTER TABLE "posts"
              DROP COLUMN "comment_count";
            `);
    await queryRunner.query(`
                ALTER TABLE "posts"
                DROP COLUMN "modified_by";
              `);
    await queryRunner.query(`
                ALTER TABLE "posts"
                DROP COLUMN "created_by";
              `);
  }
}
