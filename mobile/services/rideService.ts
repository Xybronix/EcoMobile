import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';
import { Ride, RideStats, Location, ApiResponse } from '@/lib/mobile-types';

export interface RideHistoryFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

class RideService {
  private baseUrl = `${API_CONFIG.BASE_URL}/rides`;

  private async getAuthHeaders() {
    const token = await authService.getToken();
    if (!token) {
      throw new Error('auth.notAuthenticated');
    }
    return {
      ...API_CONFIG.HEADERS,
      'Authorization': `Bearer ${token}`,
    };
  }

  async startRide(bikeId: string, startLocation: Location): Promise<Ride> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bikeId, startLocation }),
      });

      const result: ApiResponse<Ride> = await handleApiResponse(response);
      return result.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async endRide(rideId: string, endLocation: Location): Promise<Ride> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${rideId}/end`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ endLocation }),
      });

      const result: ApiResponse<Ride> = await handleApiResponse(response);
      return result.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserRides(filters?: RideHistoryFilters): Promise<{ 
    rides: Ride[]; 
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    } 
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const result: ApiResponse<any> = await handleApiResponse(response);
      return result.data!;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return { 
          rides: [], 
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        };
      }
      throw this.handleError(error);
    }
  }

  async getActiveRide(): Promise<Ride | null> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/active`, {
        method: 'GET',
        headers,
      });

      const result: ApiResponse<Ride | null> = await handleApiResponse(response);
      return result.data || null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw this.handleError(error);
    }
  }

  async getRideDetails(rideId: string): Promise<Ride> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${rideId}/details`, {
        method: 'GET',
        headers,
      });

      const result: ApiResponse<Ride> = await handleApiResponse(response);
      return result.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelRide(rideId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${rideId}/cancel`, {
        method: 'POST',
        headers,
      });

      await handleApiResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRideStats(): Promise<RideStats> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers,
      });

      const result: ApiResponse<RideStats> = await handleApiResponse(response);
      return result.data!;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return {
          totalRides: 0,
          totalDistance: 0,
          totalCost: 0,
          totalDuration: 0,
          averageDistance: 0,
          averageDuration: 0
        };
      }
      throw this.handleError(error);
    }
  }

  async reportIssue(rideId: string, issue: string, description?: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${rideId}/report-issue`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ issue, description }),
      });

      await handleApiResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          return new Error('ride.invalidData');
        case 401:
          return new Error('auth.unauthorized');
        case 404:
          return new Error('ride.notFound');
        case 409:
          return new Error('ride.alreadyInProgress');
        case 422:
          return new Error('ride.validationError');
        case 429:
          return new Error('common.tooManyRequests');
        case 500:
          return new Error('common.serverError');
        default:
          return new Error('common.unknownError');
      }
    }
    return new Error('common.networkError');
  }
}

export const rideService = new RideService();