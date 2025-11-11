import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblCreateShare1760423111273 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "shares" (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT uq_shares_user_post UNIQUE (user_id, post_id),
            CONSTRAINT fk_shares_user_id_users_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_shares_post_id_posts_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
          );
        `);

    await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_shares_post_id ON shares (post_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_shares_post_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shares";`);
  }
}
