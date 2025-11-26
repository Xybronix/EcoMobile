// services/bikeRequestService.ts
import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';

export interface UnlockRequest {
  id: string;
  userId: string;
  bikeId: string;
  bike?: {
    id: string;
    code: string;
    model: string;
    status: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  validatedBy?: string;
  validatedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  adminNote?: string;
  rejectionReason?: string;
}

export interface LockRequest {
  id: string;
  userId: string;
  bikeId: string;
  bike?: {
    id: string;
    code: string;
    model: string;
    status: string;
  };
  rideId?: string;
  ride?: {
    id: string;
    startTime: string;
    endTime?: string;
    cost?: number;
    duration?: number;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  validatedBy?: string;
  validatedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  adminNote?: string;
  rejectionReason?: string;
  latitude?: number;
  longitude?: number;
}

export interface RequestStats {
  unlock: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  lock: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  total: number;
}

class BikeRequestService {
  private baseUrl = `${API_CONFIG.BASE_URL}/bike-requests`;

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

  // Demandes de déverrouillage
  async createUnlockRequest(bikeId: string): Promise<UnlockRequest> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/unlock`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bikeId: bikeId }),
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

  // Demandes de verrouillage
  async createLockRequest(bikeId: string, rideId?: string, location?: { latitude: number; longitude: number }): Promise<LockRequest> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/lock`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bikeId, rideId, location }),
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

  // Obtenir les demandes de déverrouillage de l'utilisateur
  async getUserUnlockRequests(page: number = 1, limit: number = 20): Promise<{
    data: UnlockRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const response = await fetch(`${this.baseUrl}/unlock-requests/user?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  // Obtenir les demandes de verrouillage de l'utilisateur
  async getUserLockRequests(page: number = 1, limit: number = 20): Promise<{
    data: LockRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const response = await fetch(`${this.baseUrl}/lock-requests/user?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  // Obtenir toutes les demandes de l'utilisateur
  async getAllUserRequests(page: number = 1, limit: number = 20): Promise<{
    data: (UnlockRequest | LockRequest & { type: 'unlock' | 'lock' })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const response = await fetch(`${this.baseUrl}/user?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  // Obtenir les statistiques des demandes
  async getUserRequestStats(): Promise<RequestStats> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/user/stats`, {
        method: 'GET',
        headers,
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

  // Obtenir une demande spécifique
  async getRequestById(type: 'unlock' | 'lock', id: string): Promise<UnlockRequest | LockRequest> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${type}/${id}`, {
        method: 'GET',
        headers,
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
        return 'invalid_request';
      case 401:
        return 'unauthorized';
      case 404:
        return 'request_not_found';
      case 409:
        return 'request_already_processed';
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

export const bikeRequestService = new BikeRequestService();