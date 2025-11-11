// services/bikeService.ts
import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';

export interface Bike {
  id: string;
  name: string;
  code: string;
  qrCode: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'unavailable';
  batteryLevel: number;
  location: Location;
  pricePerMinute: number;
  isUnlocked: boolean;
  lastMaintenance: string;
  totalDistance: number;
  totalRides: number;
  createdAt: string;
  updatedAt: string;
  distance?: number;
  model?: string;
  features?: string[];
  equipment?: string[];
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface MaintenanceLog {
  id: string;
  bikeId: string;
  type: string;
  description: string;
  cost?: number;
  performedBy: string;
  createdAt: string;
}

export interface BikeFilters {
  status?: string;
  type?: string;
  minBattery?: number;
  maxBattery?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface Area {
  key: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  country?: string;
  region?: string;
}

class BikeService {
  private baseUrl = `${API_CONFIG.BASE_URL}/bikes`;

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

  async getAllBikes(filters?: BikeFilters, page: number = 1, limit: number = 20): Promise<{ bikes: Bike[]; total: number; page: number }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getAvailableBikes(filters?: BikeFilters, page: number = 1, limit: number = 20): Promise<{ bikes: Bike[]; total: number; page: number }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`${this.baseUrl}/available?${queryParams.toString()}`, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getNearbyBikes(location: Location, radius: number = 1000): Promise<Bike[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('latitude', (location.latitude || location.lat || 0).toString());
      queryParams.append('longitude', (location.longitude || location.lng || 0).toString());
      queryParams.append('radius', radius.toString());
      
      const response = await fetch(`${this.baseUrl}/nearby?${queryParams.toString()}`, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getBikeById(bikeId: string): Promise<Bike> {
    try {
      const response = await fetch(`${this.baseUrl}/${bikeId}`, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getBikeByCode(code: string): Promise<Bike> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/code/${code}`, {
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

  async unlockBike(bikeId: string): Promise<{ success: boolean; message: string }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${bikeId}/unlock`, {
        method: 'POST',
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

  async lockBike(bikeId: string): Promise<{ success: boolean; message: string }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${bikeId}/lock`, {
        method: 'POST',
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

  async getMaintenanceHistory(bikeId: string, page: number = 1, limit: number = 20): Promise<{ logs: MaintenanceLog[]; total: number; page: number }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await fetch(`${this.baseUrl}/${bikeId}/maintenance?${queryParams.toString()}`, {
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

  async reportIssue(bikeId: string, issue: string, description?: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${bikeId}/report-issue`, {
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

  // Service Google Places pour les quartiers
  async searchAreas(query: string, country: string = 'CM'): Promise<Area[]> {
    try {
      const response = await fetch(`${this.baseUrl}/areas/search`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ query, country }),
      });

      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getDefaultAreas(): Promise<Area[]> {
    try {
      const response = await fetch(`${this.baseUrl}/areas/default`, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
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
        return 'invalid_data';
      case 401:
        return 'unauthorized';
      case 404:
        return 'bike_not_found';
      case 409:
        return 'bike_unavailable';
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

export const bikeService = new BikeService();