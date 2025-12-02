export class FollowUnFollowResponseModel {
  id: number;
  user_name: string;
  is_following?: boolean;
  follow_status: string | null;
}

export class FollowUserListResponseModel {
  id: number;
  user_name: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string | null;
  bio?: string | null;
  is_following?: boolean;
  follow_status: string | null;
}

export class PendingFollowUsers {
  id: number;
  created_date: string;
  is_following_me?: boolean;
  user: {
    user_id: number;
    user_name: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string | null;
    bio?: string | null;
    is_following?: boolean;
    follow_status: string | null;
  };
}
