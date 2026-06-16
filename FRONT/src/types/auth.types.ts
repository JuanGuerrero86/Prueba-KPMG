export interface User {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}
