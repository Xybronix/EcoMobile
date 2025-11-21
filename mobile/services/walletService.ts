// services/walletService.ts
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
  type: 'DEPOSIT' | 'RIDE_PAYMENT' | 'REFUND' | 'DEPOSIT_RECHARGE' | 'DAMAGE_CHARGE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  rideId?: string;
  paymentMethod?: string;
  paymentProvider?: string;
  externalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: string;
  currency?: string;
  phoneNumber?: string;
  description?: string;
}

export interface FeeCalculation {
  amount: number;
  fees: number;
  total: number;
  currency: string;
}

export interface WalletStats {
  currentBalance: number;
  totalDeposited: number;
  totalSpent: number;
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

      const data = await handleApiResponse(response);
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getTransactions(page: number = 1, limit: number = 20): Promise<{ 
    transactions: Transaction[]; 
    total: number; 
    page: number;
    totalPages: number;
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const response = await fetch(`${this.baseUrl}/transactions?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      const data = await handleApiResponse(response);
      
      return {
        transactions: data.data?.transactions || data.transactions || [],
        total: data.data?.total || data.total || 0,
        page: data.data?.page || data.page || page,
        totalPages: Math.ceil((data.data?.total || data.total || 0) / limit)
      };
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

      const data = await handleApiResponse(response);
      return data.data || data;
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

      const data = await handleApiResponse(response);
      return data.data || data;
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

      const data = await handleApiResponse(response);
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async initiateDeposit(depositRequest: DepositRequest): Promise<{ 
    transactionId: string; 
    paymentUrl?: string; 
    qrCode?: string;
    status: string;
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/deposit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(depositRequest),
      });

      const data = await handleApiResponse(response);
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async verifyPayment(transactionId: string): Promise<{ 
    status: string; 
    transaction?: Transaction;
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/payment/verify/${transactionId}`, {
        method: 'GET',
        headers,
      });

      const data = await handleApiResponse(response);
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getDepositInfo(): Promise<{
    currentDeposit: number;
    requiredDeposit: number;
    canUseService: boolean;
    negativeBalance: number;
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/deposit-info`, {
        method: 'GET',
        headers,
      });

      const data = await handleApiResponse(response);
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getCurrentSubscription(): Promise<{
    id: string;
    planName: string;
    packageType: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/current-subscription`, {
        method: 'GET',
        headers,
      });

      const data = await handleApiResponse(response);
      return data.data || null;
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  }

  async getUserReports(): Promise<any[]> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/user-reports`, {
        method: 'GET',
        headers,
      });

      const data = await handleApiResponse(response);
      return data.data || [];
    } catch (error) {
      console.error('Error getting user reports:', error);
      return [];
    }
  }

  async rechargeDeposit(amount: number): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/deposit/recharge`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount }),
      });

      await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async requestCashDeposit(request: { 
    amount: number; 
    description?: string 
  }): Promise<{ 
    transactionId: string; 
    status: string; 
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/deposit/cash`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });
      
      const data = await handleApiResponse(response);
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async updateCashDepositRequest(transactionId: string, amount: number): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/deposit/cash/${transactionId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ amount }),
      });
      
      const data = await handleApiResponse(response);
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async cancelCashDepositRequest(transactionId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/deposit/cash/${transactionId}`, {
        method: 'DELETE',
        headers,
      });
      
      await handleApiResponse(response);
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