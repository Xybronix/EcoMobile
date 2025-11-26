// services/reservationService.ts
import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';
import { Bike } from '@/services/bikeService';

export interface Reservation {
  id: string;
  bikeId: string;
  bike: Bike;
  planId: string;
  packageType: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

class ReservationService {
  private baseUrl = `${API_CONFIG.BASE_URL}/reservations`;

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

  async getAvailablePlans(): Promise<any[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/public/pricing`, {
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

  async checkAvailability(bikeId: string, date: string, time: string, packageType: string): Promise<boolean> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/check-availability`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bikeId, date, time, packageType }),
      });

      const result = await handleApiResponse(response);
      return result.data?.available || false;
    } catch (error) {
      return false;
    }
  }

  async createReservation(data: {
    bikeId: string;
    planId: string;
    packageType: string;
    startDate: string;
    startTime: string;
  }): Promise<Reservation> {
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

  async getUserReservations(): Promise<Reservation[]> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error loading reservations:', error);
      return [];
    }
  }

  async getActiveReservation(): Promise<any | null> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/active`, {
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

  async updateReservation(id: string, data: any): Promise<Reservation> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
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

  async cancelReservation(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
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

  async calculateReservationWithSubscription(
    bikeId: string, 
    planId: string, 
    packageType: string, 
    startDate: string
  ): Promise<{
    basePrice: number;
    subscriptionCoverage: number;
    finalPrice: number;
    coveredDays: number;
    message: string;
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/calculate-with-subscription`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bikeId, planId, packageType, startDate }),
      });

      const result = await handleApiResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error calculating reservation with subscription:', error);
      throw new Error('calculation_error');
    }
  }

  private getErrorMessage(error: ApiError): string {
    switch (error.status) {
      case 400:
        return 'invalid_data';
      case 401:
        return 'unauthorized';
      case 404:
        return 'reservation_not_found';
      case 409:
        return 'reservation_conflict';
      case 422:
        return 'validation_error';
      default:
        return 'unknown_error';
    }
  }
}

export const reservationService = new ReservationService();