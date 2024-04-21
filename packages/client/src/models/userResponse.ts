import { Address } from 'viem';

export type UserResponseItem = {
  fid?: number;
  pfp?: string;
  displayName?: string;
  bio?: string;
  userName?: string;
  address?: Address;
};

export type UserResponse = {
  user: UserResponseItem;
};

export type UsersResponse = {
  users: UserResponseItem[];
};
