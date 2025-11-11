import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblCreateRolesTable1759305466605 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
              CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT true,
                is_system_defined BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
              );
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
              DROP TABLE IF EXISTS roles;
            `);
  }
}
