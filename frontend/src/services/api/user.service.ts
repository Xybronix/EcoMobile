// services/api/user.service.ts
import { apiClient } from './client';

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'blocked' | 'pending';
  accountBalance: number;
  totalSpent: number;
  totalTrips: number;
  reliabilityScore: number;
  createdAt: string;
  avatar?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalBalance: number;
  totalSpent: number;
  totalTrips: number;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  pages: number;
  currentPage: number;
}

export class UserService {
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<PaginatedUsers> {
    const queryParams: any = { ...params };
    queryParams.role = 'USER';

    const response = await apiClient.get<PaginatedUsers>('/users', queryParams);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération des utilisateurs');
    }

    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Utilisateur non trouvé');
    }

    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la modification');
    }

    return response.data;
  }

  async blockUser(id: string): Promise<void> {
    const response = await apiClient.put(`/users/${id}/status`, { status: 'blocked', isActive: false });
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors du blocage');
    }
  }

  async unblockUser(id: string): Promise<void> {
    const response = await apiClient.put(`/users/${id}/status`, { status: 'active', isActive: true });
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors du déblocage');
    }
  }

  async deleteUser(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la suppression');
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/search', { q: query });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la recherche');
    }

    return response.data;
  }
}

export const userService = new UserService();