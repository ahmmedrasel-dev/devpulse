export type UserRole = "contributor" | "maintainer";

export interface IUser {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}
