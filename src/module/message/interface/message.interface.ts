export class MsgUserListResponseModel {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  message: {
    id: number;
    sender_id: number;
    receiver_id: number;
    last_message: string;
    created_date: string;
    modified_date: string | null;
    is_read?: boolean;
  };
}

export interface UserMessageListModel {
  id: number;
  message: string;
  created_date: string;
  modified_date?: string;
  sender: {
    id: number;
    user_name: string;
    first_name: string | null;
    last_name: string | null;
    photo_url: string | null;
  };
  receiver: {
    id: number;
    user_name: string;
    first_name: string | null;
    last_name: string | null;
    photo_url?: string | null;
  };
}
