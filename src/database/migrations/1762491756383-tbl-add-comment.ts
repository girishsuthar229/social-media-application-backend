import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblAddComment1762491756383 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE "comments" (
            "id" SERIAL NOT NULL,
            "content" text NOT NULL,
            "post_id" integer,
            "user_id" integer,
            "created_date" timestamp(3) without time zone NOT NULL,
            "created_by" VARCHAR(50),
            "modified_date" timestamp(3) without time zone,
            "modified_by" VARCHAR(50),
            CONSTRAINT "PK_comments" PRIMARY KEY ("id")
          );
        `);

    await queryRunner.query(`
          ALTER TABLE "comments"
          ADD CONSTRAINT "FK_comments_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;
        `);

    await queryRunner.query(`
          ALTER TABLE "comments"
          ADD CONSTRAINT "FK_comments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "comment_count"`);
  }
}
