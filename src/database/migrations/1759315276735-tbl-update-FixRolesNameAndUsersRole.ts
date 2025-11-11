import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblUpdateFixRolesNameAndUsersRole1759315276735
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Update NULL names in roles
    await queryRunner.query(`
          UPDATE roles
          SET name = 'Default Role'
          WHERE name IS NULL;
        `);

    // Step 2: Alter column to NOT NULL
    await queryRunner.query(`
          ALTER TABLE roles
          ALTER COLUMN name SET NOT NULL;
        `);

    // Step 3: Fix any users with invalid role_id (optional)
    await queryRunner.query(`
          UPDATE users
          SET role_id = (SELECT id FROM roles LIMIT 1)
          WHERE role_id NOT IN (SELECT id FROM roles);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert column to nullable
    await queryRunner.query(`
          ALTER TABLE roles
          ALTER COLUMN name DROP NOT NULL;
        `);

    // Optionally, reset names back to NULL where 'Default Role'
    await queryRunner.query(`
          UPDATE roles
          SET name = NULL
          WHERE name = 'Default Role';
        `);
  }
}
