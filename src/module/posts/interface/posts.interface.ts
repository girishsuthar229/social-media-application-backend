interface PostComment {
  id: number;
  content: string;
  user_id: number;
  user_name: string;
  created_date: string;
}

interface PostUser {
  id: number;
  user_name: string;
  profile_pic_url: string;
}

export interface GetAllPostsReponseModel {
  post_id: number;
  content: string;
  image_url: string;
  like_count: number;
  share_count: number;
  self_comment: string | null;
  comment_count: number;
  comments: PostComment[];
  user: PostUser;
  created_date: string;
  modified_date: string | null;
  is_liked: boolean;
}
export interface UserAllPostsResponseModel {
  post_id: number;
  image_url: string | null;
  like_count: number;
  share_count: number;
  comment_count: number;
  self_comment: string | null;
  is_following: boolean;
}
