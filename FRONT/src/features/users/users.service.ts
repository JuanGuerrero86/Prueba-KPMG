import apiClient from '../../services/api.client';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';
import { UserData, CreateUserDto, UpdateUserDto, UserQuery, Role } from '../../types/user.types';

export const usersService = {
  async getUsers(query: UserQuery = {}) {
    const res = await apiClient.get<PaginatedResponse<UserData>>('/api/users', { params: query });
    return res.data;
  },
  async getAllUsers() {
    const res = await apiClient.get<ApiResponse<UserData[]>>('/api/users/all');
    return res.data.data;
  },
  async getUserById(id: string) {
    const res = await apiClient.get<ApiResponse<UserData>>(`/api/users/${id}`);
    return res.data.data;
  },
  async createUser(dto: CreateUserDto) {
    const res = await apiClient.post<ApiResponse<UserData>>('/api/users', dto);
    return res.data.data;
  },
  async updateUser(id: string, dto: UpdateUserDto) {
    const res = await apiClient.put<ApiResponse<UserData>>(`/api/users/${id}`, dto);
    return res.data.data;
  },
  async deleteUser(id: string) {
    await apiClient.delete(`/api/users/${id}`);
  },
  async toggleUser(id: string) {
    const res = await apiClient.patch<ApiResponse<UserData>>(`/api/users/${id}/toggle`);
    return res.data.data;
  },
  async assignRoles(id: string, roleIds: string[]) {
    const res = await apiClient.post<ApiResponse<UserData>>(`/api/users/${id}/roles`, { roleIds });
    return res.data.data;
  },
  async getRoles() {
    const res = await apiClient.get<ApiResponse<Role[]>>('/api/roles');
    return res.data.data;
  },
};
