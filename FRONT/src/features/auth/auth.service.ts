import apiClient from '../../services/api.client';
import { ApiResponse } from '../../types/api.types';
import { LoginRequest, LoginResponse, User } from '../../types/auth.types';
import { useAuthStore } from '../../store/auth.store';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
    useAuthStore.getState().clearUser();
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/api/auth/me');
    return res.data.data;
  },
};
