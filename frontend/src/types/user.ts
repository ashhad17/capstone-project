
export interface User {
  _id?: string;
  id?: string; // Keep both id and _id for compatibility
  name: string;
  email: string;
  role?: string;
  status?: string;
  avatar?: string;
  avatarPublicId?: string;
  address?: string;
  phone?: string;
  emailVerified?: boolean;
}
