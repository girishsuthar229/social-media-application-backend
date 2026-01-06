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
    status: string;
    is_read?: boolean;
  };
}

export interface UserReadMessageModel {
  selected_user_id: number;
  current_user_id: number;
}

export interface UserMessageListModel {
  id: number;
  message: string;
  created_date: string;
  modified_date?: string;
  status: string;
  is_read: boolean;
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

export interface UserTypingMessage {
  receiver_id: number;
  is_typing: boolean;
  type_user_id: number;
  type_user_name: string;
}
