import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';

export interface WalletBalance {
  balance: number;
  currency: string;
  lastTopUp?: string;
  lastTransaction?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'ride_payment' | 'refund' | 'bonus';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  rideId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: string;
  currency?: string;
}

export interface FeeCalculation {
  amount: number;
  fees: number;
  total: number;
  currency: string;
}

export interface WalletStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalRidePayments: number;
  averageDeposit: number;
  monthlyStats?: {
    month: string;
    deposits: number;
    withdrawals: number;
    ridePayments: number;
  }[];
}

class WalletService {
  private baseUrl = `${API_CONFIG.BASE_URL}/wallet`;

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

  async getBalance(): Promise<WalletBalance> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        method: 'GET',
        headers,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getTransactions(page: number = 1, limit: number = 20): Promise<{ transactions: Transaction[]; total: number; page: number }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const response = await fetch(`${this.baseUrl}/transactions?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
        method: 'GET',
        headers,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getStats(): Promise<WalletStats> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async calculateFees(amount: number, paymentMethod: string): Promise<FeeCalculation> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/deposit/calculate-fees`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount, paymentMethod }),
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async initiateDeposit(depositRequest: DepositRequest): Promise<{ transactionId: string; paymentUrl?: string; qrCode?: string }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/deposit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(depositRequest),
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async verifyPayment(transactionId: string): Promise<{ status: string; transaction?: Transaction }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/payment/verify/${transactionId}`, {
        method: 'GET',
        headers,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getPaymentMethods(): Promise<string[]> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: 'GET',
        headers,
      });

      return await handleApiResponse(response);
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
        return 'invalid_amount';
      case 401:
        return 'unauthorized';
      case 402:
        return 'insufficient_funds';
      case 404:
        return 'transaction_not_found';
      case 422:
        return 'validation_error';
      case 429:
        return 'too_many_requests';
      case 500:
        return 'server_error';
      default:
        return 'unknown_error';
    }
  }
}

export const walletService = new WalletService();