import { MigrationInterface, QueryRunner } from 'typeorm';

export class FnGetAllFeedPosts1769604020731 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            -- Drop the function if it already exists
            DROP FUNCTION IF EXISTS sm_nest_schema.get_user_posts_by_created_date(p_user_id INTEGER, p_limit INTEGER, p_offset INTEGER);

            -- Create or Replace the function to fetch posts by user with pagination, ordered by created_date DESC
            CREATE OR REPLACE FUNCTION sm_nest_schema.get_user_posts_by_created_date(
                p_user_id INTEGER,
                p_limit INTEGER,
                p_offset INTEGER
            )
            RETURNS TABLE (
                id INT,
                content TEXT,
                image_url VARCHAR,
                like_count INTEGER,
                share_count INTEGER,
                comment_count INTEGER,
                self_comment TEXT,
                created_date TIMESTAMP,
                created_by VARCHAR,
                modified_date TIMESTAMP,
                modified_by VARCHAR,
                deleted_date TIMESTAMP,
                is_liked BOOLEAN,
                is_saved BOOLEAN,
                comments JSONB,  -- Store comments as JSONB array
                "user" JSONB  -- Return the user details as JSONB object (quoted to avoid conflict with the keyword)
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    p.id,
                    p.content,
                    p.image_url,
                    p.like_count,
                    p.share_count,
                    p.comment_count,
                    p.self_comment,
                    p.created_date,
                    p.created_by,
                    p.modified_date,
                    p.modified_by,
                    p.deleted_date,
                    -- Check if the current user has liked the post
                    EXISTS (
                        SELECT 1 
                        FROM public.likes l
                        WHERE l.user_id = p_user_id AND l.post_id = p.id
                    ) AS is_liked,
                    -- Check if the current user has saved the post
                    EXISTS (
                        SELECT 1 
                        FROM public.saved_posts sp
                        WHERE sp.user_id = p_user_id AND sp.post_id = p.id
                    ) AS is_saved,
                    -- Collect comments for the post (JSONB array of comment data)
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', c.id,
                                'content', c.content,
                                'user_id', c.user_id,
                                'user_name', u.user_name,
                                'created_date', c.created_date
                            )
                        )
                        FROM public.comments c
                        JOIN public.users u ON u.id = c.user_id
                        WHERE c.post_id = p.id 
                        AND c.deleted_date IS NULL
                        LIMIT 2
                    ) AS comments,
                    -- Return user details as JSONB object
                    jsonb_build_object(
                        'id', u.id,
                        'user_name', u.user_name,
                        'profile_pic_url', u.photo_url
                    ) AS "user"
                FROM public.posts p
                -- Join the users table to get details of the user who created the post
                JOIN public.users u ON u.id = p.user_id
                WHERE p.deleted_date IS NULL
                -- Privacy check: user can see the post if the post creator is not private,
                -- or if the post belongs to them, or if they are following the post creator
                AND (
                    u.is_private = false  -- Post creator is not private
                    OR p.user_id = p_user_id  -- The current user can see their own posts
                    OR EXISTS (
                        SELECT 1 
                        FROM follows f
                        WHERE f.follower_id = p_user_id 
                          AND f.following_id = p.user_id 
                          AND f.status = 'accepted'  -- Ensure the follow is accepted
                    )
                )
                ORDER BY p.created_date DESC
                LIMIT p_limit OFFSET p_offset;
            END;
            $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the function if it exists (rollback scenario)
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS sm_nest_schema.get_user_posts_by_created_date(p_user_id INTEGER, p_limit INTEGER, p_offset INTEGER);
        `);
  }
}
