export interface DecodedTokenPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}
export interface UserProfileDetailsModel {
  id: number;
  user_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string | null;
  mobile_number?: string | null;
  photo_url?: string;
  birth_date?: string;
  address?: string;
  is_private?: boolean;
  role: {
    id: number;
    name: string;
  };
}

export class UserListResponseModel {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string | null;
  mobile_number: string;
  photo_url: string;
  birth_date: string | null;
  address: string;
  is_private: boolean;
  role_id: number;
  created_date: string;
  modified_date: string | null;
}

