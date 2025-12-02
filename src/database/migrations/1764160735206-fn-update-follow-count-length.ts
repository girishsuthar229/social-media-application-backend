import { MigrationInterface, QueryRunner } from 'typeorm';

export class FnUpdateFollowCountLength1764160735206
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                  DROP FUNCTION IF EXISTS sm_nest_schema.get_user_profile_details(p_user_id integer);
            
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
                      role JSONB,
                      follower_count BIGINT,
                      following_count BIGINT,
                      post_count BIGINT
                  )
                  LANGUAGE plpgsql
                  AS $$
                  BEGIN
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
                          u.address,
            
                          jsonb_build_object(
                              'id', r.id,
                              'name', r.name
                          ) AS role,
            
                          (SELECT COUNT(*) FROM public.follows f WHERE f.following_id = u.id AND f.status = 'accepted') AS follower_count,
                          (SELECT COUNT(*) FROM public.follows f WHERE f.follower_id = u.id AND f.status = 'accepted') AS following_count,
                          (SELECT COUNT(*) FROM public.posts p WHERE p.user_id = u.id AND p.deleted_date IS NULL) AS post_count
            
                      FROM public.users u
                      INNER JOIN public.roles r ON r.id = u.role_id
                      WHERE u.id = p_user_id AND u.deleted_date IS NULL;
                    END;
                    $$;
                `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
