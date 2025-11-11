import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';
import { Bike } from './bikeService';

export interface Ride {
  id: string;
  userId: string;
  bikeId: string;
  bike?: Bike;
  startTime: string;
  endTime?: string;
  startLocation: Location;
  endLocation?: Location;
  distance: number;
  duration: number;
  cost: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface RideHistoryFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface RideStats {
  totalRides: number;
  totalDistance: number;
  totalCost: number;
  totalDuration: number;
  averageRating: number;
  carbonSaved: number;
}

class RideService {
  private baseUrl = `${API_CONFIG.BASE_URL}/rides`;

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

  async startRide(bikeId: string, startLocation: Location): Promise<Ride> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bikeId, startLocation }),
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
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

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getUserRides(filters?: RideHistoryFilters): Promise<{ rides: Ride[]; total: number; page: number }> {
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

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return { rides: [], total: 0, page: 1 };
      }
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getActiveRide(): Promise<Ride | null> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/active`, {
        method: 'GET',
        headers,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getRideDetails(rideId: string): Promise<Ride> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${rideId}`, {
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

  async cancelRide(rideId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${rideId}/cancel`, {
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

  async getRideStats(): Promise<RideStats> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return {
          totalRides: 0,
          totalDistance: 0,
          totalCost: 0,
          totalDuration: 0,
          averageRating: 0,
          carbonSaved: 0
        };
      }
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
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
        return 'ride_not_found';
      case 409:
        return 'ride_in_progress';
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

export const rideService = new RideService();