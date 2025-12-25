export class MsgUserListResponseModel {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string | null;
  photo_url: string;
  created_date: string;
  modified_date: string | null;
}

export class UserMessageListModel {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
}
