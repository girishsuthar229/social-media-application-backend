import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblCreatePosts1760421921053 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "posts" (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        image_url VARCHAR,
        like_count INTEGER NOT NULL DEFAULT 0,
        share_count INTEGER NOT NULL DEFAULT 0,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        deleted_at TIMESTAMP WITHOUT TIME ZONE,
        CONSTRAINT fk_posts_user_id_users_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // index to speed up feed queries ordering by created_at
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_posts_created_at;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts";`);
  }
}
