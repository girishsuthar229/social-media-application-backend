import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusColumnToFollowsTable1764134920866
  implements MigrationInterface
{
  name = 'AddStatusColumnToFollowsTable1764134920866';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "follows_status_enum" AS ENUM ('pending', 'accepted');
    `);
    await queryRunner.query(`
      ALTER TABLE "follows"
      ADD COLUMN "status" "follows_status_enum" NOT NULL DEFAULT 'pending';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "follows"
      DROP COLUMN "status";
    `);
    await queryRunner.query(`
      DROP TYPE "follows_status_enum";
    `);
  }
}
