import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblCreateSavedPost1763541138989 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "saved_posts" (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        created_by VARCHAR(50),
        CONSTRAINT unique_user_post UNIQUE (user_id, post_id),
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_saved_post_id ON saved_posts (post_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_saved_post_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "saved_posts";`);
  }
}
