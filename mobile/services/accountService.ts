// services/accountService.ts
import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';

export interface UserAccount {
  activeSubscription?: {
    planName: string;
    type: string;
    endDate: string;
  };
  securityDeposit?: {
    currentAmount: number;
    requiredAmount: number;
    negativeBalance: number;
    isActive: boolean;
  };
  stats: {
    totalRides: number;
    totalSpent: number;
  };
}

export interface WalletActivity {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface BikeAction {
  id: string;
  actionType: string;
  status: string;
  requestedAt: string;
  validatedAt?: string;
  adminNote?: string;
  bike: {
    code: string;
  };
}

export interface DamageReport {
  id: string;
  description: string;
  estimatedCost: number;
  actualCost?: number;
  status: string;
  createdAt: string;
  bike: {
    code: string;
  };
}

class AccountService {
  private baseUrl = `${API_CONFIG.BASE_URL}/users`;

  private async getAuthHeaders() {
    const token = await authService.getToken();
    if (!token) {
      throw new Error('not_authenticated');
    }
    return {
      ...API_CONFIG.HEADERS,
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAccountOverview(): Promise<UserAccount> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/account-overview`, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getWalletActivities(period: string): Promise<WalletActivity[]> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/wallet-activities?period=${period}`, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getBikeActions(period: string): Promise<BikeAction[]> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/bike-actions?period=${period}`, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getDamageReports(): Promise<DamageReport[]> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/damage-reports`, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  private getErrorMessage(error: ApiError): string {
    switch (error.status) {
      case 400:
        return 'invalid_data';
      case 401:
        return 'unauthorized';
      case 404:
        return 'not_found';
      default:
        return 'unknown_error';
    }
  }
}

export const accountService = new AccountService();