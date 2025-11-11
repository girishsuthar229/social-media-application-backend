import { MigrationInterface, QueryRunner } from 'typeorm';

export class TblCreateUser1759305669921 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        role_id INT NOT NULL,
        mobile_number VARCHAR(20),
        birth_date TIMESTAMP,
        password_hash VARCHAR(60) NOT NULL,
        address VARCHAR(300),
        is_forgot_token_used BOOLEAN DEFAULT FALSE,
        is_reset_token_used BOOLEAN DEFAULT FALSE,
        password_token VARCHAR(100),
        password_set_expires_at TIMESTAMP,
        last_login_at TIMESTAMP(3),
        otp VARCHAR(6),
        otp_expiration_time TIMESTAMP(3),
        photo_url VARCHAR(300),
        
        -- audit fields from BaseEntity
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP,

        CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS users;
    `);
  }
}
