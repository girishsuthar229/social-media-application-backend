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

export class UserResponseDto {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
  mobile_number?: string;
  photo_url?: string;
  birth_date?: string;
  address?: string;
  is_private: boolean;
  role_id: number;
  created_at: Date;
  updated_at: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

// src/module/users/dto/users-list-response.dto.ts
export class UsersListResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(
    users: UserResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.users = users;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
