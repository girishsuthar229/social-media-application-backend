import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblCreateFollows1760423165639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "follows" (
            id SERIAL PRIMARY KEY,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
            created_by VARCHAR(50),
            modified_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
            modified_by VARCHAR(50),
            CONSTRAINT uq_follows_follower_following UNIQUE (follower_id, following_id),
            CONSTRAINT fk_follows_follower_id_users_id FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_follows_following_id_users_id FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

    await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows (follower_id);
        `);

    await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows (following_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_follows_follower_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_follows_following_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "follows";`);
  }
}
