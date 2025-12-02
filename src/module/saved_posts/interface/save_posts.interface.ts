export interface SavedAllPostsResponseModel {
  post_id: number;
  image_url: string | null;
  like_count: number;
  share_count: number;
  comment_count: number;
  self_comment: string | null;
  is_following: boolean;
}
