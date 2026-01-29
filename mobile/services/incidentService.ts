import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';

export interface Incident {
  id: string;
  userId: string;
  bikeId?: string;
  bikeCode?: string;
  type: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  resolvedAt?: string;
  refundAmount?: number;
  adminNote?: string;
  resolvedBy?: string;
  resolvedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  bike?: {
    id: string;
    code: string;
    model: string;
  };
}

export interface CreateIncidentData {
  type: string;
  description: string;
  bikeId?: string;
  photos?: string[];
}

class IncidentService {
  private baseUrl = `${API_CONFIG.BASE_URL}/incidents`;

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

  async getIncidents(page: number = 1, limit: number = 20): Promise<{
    incidents: Incident[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      const result = await handleApiResponse(response);
      return {
        incidents: result.data?.incidents || result.data || [],
        total: result.data?.pagination?.total || result.total || 0,
        page: result.data?.pagination?.page || result.page || page,
        totalPages: result.data?.pagination?.totalPages || Math.ceil((result.data?.pagination?.total || result.total || 0) / limit)
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async getIncident(id: string): Promise<Incident> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
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

  async createIncident(data: CreateIncidentData): Promise<Incident> {
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

  async updateIncident(id: string, data: Partial<CreateIncidentData>): Promise<Incident> {
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

  async deleteIncident(id: string): Promise<void> {
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

  private getErrorMessage(error: ApiError): string {
    return error.message || 'unknown_error';
  }
}

export const incidentService = new IncidentService();