import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblCreateLikes1760423102980 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "likes" (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT uq_likes_user_post UNIQUE (user_id, post_id),
            CONSTRAINT fk_likes_user_id_users_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_likes_post_id_posts_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
          );
        `);

    await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes (post_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_likes_post_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "likes";`);
  }
}
