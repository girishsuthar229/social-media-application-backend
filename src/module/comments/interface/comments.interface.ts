export class CommentsPostUserListResponseModel {
  id: number;
  user_name: string;
  comment: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  bio?: string;
  is_following?: boolean;
  created_date: string;
}
