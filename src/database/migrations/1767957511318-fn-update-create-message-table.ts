import { MigrationInterface, QueryRunner } from 'typeorm';

export class FnUpdateCreateMessageTable1767957511318 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE messages
          ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
    
          ADD COLUMN IF NOT EXISTS file_url VARCHAR(255),
          ADD COLUMN IF NOT EXISTS file_type VARCHAR(50),
          ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
          ADD COLUMN IF NOT EXISTS file_size BIGINT,
    
          ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7),
          ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7),
          ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE messages
          DROP COLUMN IF EXISTS is_edited,
    
          DROP COLUMN IF EXISTS file_url,
          DROP COLUMN IF EXISTS file_type,
          DROP COLUMN IF EXISTS file_name,
          DROP COLUMN IF EXISTS file_size,
    
          DROP COLUMN IF EXISTS latitude,
          DROP COLUMN IF EXISTS longitude,
          DROP COLUMN IF EXISTS location_name,
        `);
  }
}
