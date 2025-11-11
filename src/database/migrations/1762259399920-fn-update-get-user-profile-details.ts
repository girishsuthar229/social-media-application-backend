import { MigrationInterface, QueryRunner } from 'typeorm';

export class FnUpdateGetUserProfileDetails1762259399920
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Drop the existing function if it exists
      DROP FUNCTION IF EXISTS sm_nest_schema.get_user_profile_details(p_user_id integer);

      -- Recreate the function with the new address column
      CREATE OR REPLACE FUNCTION sm_nest_schema.get_user_profile_details(p_user_id integer)
      RETURNS TABLE (
          id INT,
          user_name VARCHAR,
          first_name VARCHAR,
          last_name VARCHAR,
          email VARCHAR,
          mobile_number VARCHAR,
          birth_date TIMESTAMP,
          bio TEXT,
          photo_url VARCHAR,
          is_private BOOLEAN,
          address VARCHAR,
          role JSONB
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
          -- Returning the result from the SELECT query
          RETURN QUERY
          SELECT 
              u.id,
              u.user_name,
              u.first_name,
              u.last_name,
              u.email,
              u.mobile_number,
              u.birth_date,
              u.bio,
              u.photo_url,
              u.is_private,
              u.address,  -- ✅ Added address column
              jsonb_build_object(
                  'id', r.id,
                  'name', r.name
              ) AS role
          FROM public.users u
          INNER JOIN public.roles r ON r.id = u.role_id
          WHERE u.id = p_user_id
            AND u.deleted_at IS NULL;  -- Only active (non-deleted) users are returned
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
