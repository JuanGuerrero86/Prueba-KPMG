export interface UserData {
  id: string;
  email: string;
  nombre: string;
  roles: Role[];
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  nombre: string;
  key: string;
  isActive: boolean;
}

export interface CreateUserDto {
  email: string;
  nombre: string;
  password: string;
  roleIds?: string[];
}

export interface UpdateUserDto {
  email?: string;
  nombre?: string;
  password?: string;
  roleIds?: string[];
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
}
