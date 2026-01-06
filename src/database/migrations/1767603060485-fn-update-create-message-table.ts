import { MigrationInterface, QueryRunner } from 'typeorm';

export class FnUpdateCreateMessageTable1767603060485 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
    
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
    
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
    
          -- New status column (Sent, Delivered, Seen)
          status VARCHAR(10) NOT NULL DEFAULT 'sent',
    
          -- audit fields
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          deleted_at TIMESTAMP,
    
          CONSTRAINT fk_sender
            FOREIGN KEY (sender_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
    
          CONSTRAINT fk_receiver
            FOREIGN KEY (receiver_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS messages;
    `);
  }
}
