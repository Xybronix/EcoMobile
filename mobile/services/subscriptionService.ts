/* eslint-disable @typescript-eslint/no-unused-vars */
import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';

export interface Plan {
  id: string;
  name: string;
  type: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  discount: number;
  features: string[];
  isPopular?: boolean;
}

export interface SubscriptionRequest {
  planId: string;
  packageType: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
}

export interface ActiveSubscription {
  id: string;
  planName: string;
  packageType: string;
  startDate: string;
  endDate: string;
  status: string;
  remainingDays: number;
}

class SubscriptionService {
  private baseUrl = `${API_CONFIG.BASE_URL}/subscriptions`;

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

  async getAvailablePlans(): Promise<Plan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/plans`, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
      });

      const result = await handleApiResponse(response);
      return result.data?.plans || [];
    } catch (error) {
      console.error('Error loading plans:', error);
      return [];
    }
  }

  async subscribe(data: SubscriptionRequest): Promise<ActiveSubscription> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
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

  async getCurrentSubscription(): Promise<ActiveSubscription | null> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/current`, {
        method: 'GET',
        headers,
      });

      if (response.status === 404) {
        return null;
      }

      const result = await handleApiResponse(response);
      return result.data;
    } catch (error) {
      return null;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${subscriptionId}/cancel`, {
        method: 'POST',
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
        return 'invalid_data';
      case 401:
        return 'unauthorized';
      case 402:
        return 'insufficient_funds';
      case 409:
        return 'subscription_conflict';
      case 422:
        return 'validation_error';
      default:
        return 'unknown_error';
    }
  }
}

export const subscriptionService = new SubscriptionService();