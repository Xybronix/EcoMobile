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
  depositBalance: number;
  negativeBalance?: number;
  subscription?: {
    planName: string;
    packageType: string;
    endDate: string;
  };
  isActive: boolean;
  address?: string;
  avatar?: string;
  _incidents?: any[];
  _rides?: any[];
  _transactions?: any[];
  _requests?: any[];
  createdAt: string;
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
    if (!queryParams.role || queryParams.role !== 'ADMIN') {
      queryParams.role = 'USER';
    }

    const response = await apiClient.get<PaginatedUsers>('/users', queryParams);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération des utilisateurs');
    }

    const users = response.data.users.map(user => ({
      ...user,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      accountBalance: user.accountBalance || 0,
      totalSpent: user.totalSpent || 0,
      totalTrips: user.totalTrips || 0,
      depositBalance: user.depositBalance || 0
    }));

    return {
      ...response.data,
      users
    };
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Utilisateur non trouvé');
    }

    const user = response.data;

    const incidentsResponse = await apiClient.get(`/admin/users/${id}/incidents`);
    const userIncidents = incidentsResponse.success ? (incidentsResponse.data as any[]) : [];

    const ridesResponse = await apiClient.get(`/admin/users/${id}/rides`);
    const userRides = ridesResponse.success ? (ridesResponse.data as any[]) : [];
    
    const transactionsResponse = await apiClient.get(`/admin/users/${id}/transactions`);
    const userTransactions = transactionsResponse.success ? (transactionsResponse.data as any[]) : [];
    
    const requestsResponse = await apiClient.get(`/admin/users/${id}/requests`);
    const userRequests = requestsResponse.success ? (requestsResponse.data as any[]) : [];

    return {
      ...user,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      accountBalance: user.accountBalance || 0,
      totalSpent: user.totalSpent || 0,
      totalTrips: user.totalTrips || 0,
      depositBalance: user.depositBalance || 0,
      _incidents: userIncidents,
      _rides: userRides,
      _transactions: userTransactions,
      _requests: userRequests
    };
  }

  async getUserIncidents(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/admin/users/${userId}/incidents`);
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des incidents');
    }

    return (response.data as any[]) || [];
  }

  async getUserRides(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/admin/users/${userId}/rides`);
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des trajets');
    }

    return (response.data as any[]) || [];
  }

  async getUserTransactions(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/admin/users/${userId}/transactions`);
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des transactions');
    }

    return (response.data as any[]) || [];
  }

  async getUserRequests(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/admin/users/${userId}/requests`);
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des demandes');
    }

    return (response.data as any[]) || [];
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