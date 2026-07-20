export interface User {
  id: string;
  name: string;
  role: string; // e.g. "IT Administrator"
  email: string;
  avatarUrl?: string;
  company: {
    id: string;
    name: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
