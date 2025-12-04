export class LikePostUserListResponseModel {
  id: number;
  created_date: string;
  user: {
    id: number;
    user_name: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    bio?: string;
    is_following?: boolean;
    follow_status: string | null;
  };
}
