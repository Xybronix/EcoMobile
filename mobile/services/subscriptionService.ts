import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  discount: number;
  features: string[];
  isActive: boolean;
  conditions?: any;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: SubscriptionPlan;
  type: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
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

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/plans`, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
      });

      const result = await handleApiResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      return [];
    }
  }

  async createSubscription(planId: string, type: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'): Promise<Subscription> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId, type }),
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

  async getCurrentSubscription(): Promise<Subscription | null> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/current`, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result.data || null;
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  }

  async getUserSubscriptions(): Promise<Subscription[]> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error loading user subscriptions:', error);
      return [];
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${subscriptionId}`, {
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

  async calculatePrice(planId: string, type: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'): Promise<{
    basePrice: number;
    discount: number;
    finalPrice: number;
    savings: number;
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/calculate-price`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId, type }),
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
      case 402:
        return 'insufficient_funds';
      case 404:
        return 'plan_not_found';
      case 409:
        return 'active_subscription_exists';
      case 422:
        return 'validation_error';
      default:
        return 'unknown_error';
    }
  }
}

export const subscriptionService = new SubscriptionService();