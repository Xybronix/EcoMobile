import { API_CONFIG, handleApiResponse } from '@/lib/api/config';
import { authService } from './authService';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'wallet';
  lastFour?: string;
  provider?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'ride' | 'topup' | 'refund' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  rideId?: string;
  paymentMethodId?: string;
  createdAt: string;
}

export interface TopUpRequest {
  amount: number;
  paymentMethodId: string;
  currency?: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  lastTopUp?: string;
}

class PaymentService {
  private baseUrl = `${API_CONFIG.BASE_URL}/payments`;

  private async getAuthHeaders() {
    const token = await authService.getToken();
    return {
      ...API_CONFIG.HEADERS,
      'Authorization': `Bearer ${token}`,
    };
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/methods`, {
      method: 'GET',
      headers,
    });

    return await handleApiResponse(response);
  }

  async addPaymentMethod(token: string, type: string, isDefault: boolean = false): Promise<PaymentMethod> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/methods`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token, type, isDefault }),
    });

    return await handleApiResponse(response);
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/methods/${paymentMethodId}`, {
      method: 'DELETE',
      headers,
    });

    await handleApiResponse(response);
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/methods/${paymentMethodId}/default`, {
      method: 'PUT',
      headers,
    });

    await handleApiResponse(response);
  }

  async getTransactionHistory(page: number = 1, limit: number = 20): Promise<{ transactions: Transaction[]; total: number; page: number }> {
    const headers = await this.getAuthHeaders();
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await fetch(`${this.baseUrl}/transactions?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    });

    return await handleApiResponse(response);
  }

  async getWalletBalance(): Promise<WalletBalance> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/wallet/balance`, {
      method: 'GET',
      headers,
    });

    return await handleApiResponse(response);
  }

  async topUpWallet(request: TopUpRequest): Promise<Transaction> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/wallet/topup`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    return await handleApiResponse(response);
  }

  async getRideCostEstimate(distance: number, duration: number): Promise<{ cost: number; currency: string }> {
    const headers = await this.getAuthHeaders();
    
    const queryParams = new URLSearchParams({
      distance: distance.toString(),
      duration: duration.toString(),
    });
    
    const response = await fetch(`${this.baseUrl}/estimate?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    });

    return await handleApiResponse(response);
  }

  async processRidePayment(rideId: string, paymentMethodId?: string): Promise<Transaction> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/ride/${rideId}/pay`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ paymentMethodId }),
    });

    return await handleApiResponse(response);
  }
}

export const paymentService = new PaymentService();