import { apiClient } from './client';

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'RIDE_PAYMENT' | 'REFUND';
  amount: number;
  fees: number;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod?: string;
  paymentProvider?: string;
  externalId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface WalletStats {
  totalDeposits: number;
  totalSpent: number;
  totalTransactions: number;
  averageTransactionAmount: number;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: string;
}

export interface DepositResponse {
  transactionId: string;
  paymentUrl: string;
  externalId: string;
}

export interface FeesCalculation {
  amount: number;
  fees: number;
  totalAmount: number;
}

export class WalletService {
  async getBalance(): Promise<WalletBalance> {
    const response = await apiClient.get<WalletBalance>('/wallet/balance');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération du solde');
    }

    return response.data;
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<{ transactions: Transaction[], total: number, pages: number }> {
    const response = await apiClient.get<{ transactions: Transaction[], total: number, pages: number }>('/wallet/transactions', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération des transactions');
    }

    return response.data;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/wallet/transactions/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Transaction non trouvée');
    }

    return response.data;
  }

  async getStats(): Promise<WalletStats> {
    const response = await apiClient.get<WalletStats>('/wallet/stats');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération des statistiques');
    }

    return response.data;
  }

  async calculateFees(amount: number): Promise<FeesCalculation> {
    const response = await apiClient.post<FeesCalculation>('/wallet/deposit/calculate-fees', { amount });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors du calcul des frais');
    }

    return response.data;
  }

  async initiateDeposit(data: DepositRequest): Promise<DepositResponse> {
    const response = await apiClient.post<DepositResponse>('/wallet/deposit', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de l\'initiation du dépôt');
    }

    return response.data;
  }

  async verifyPayment(transactionId: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/wallet/payment/verify/${transactionId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la vérification du paiement');
    }

    return response.data;
  }
}

export const walletService = new WalletService();