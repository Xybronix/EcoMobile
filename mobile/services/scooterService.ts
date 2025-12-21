import { API_CONFIG, handleApiResponse } from '@/lib/api/config';
import { authService } from './authService';
import { Scooter, Location } from '@/lib/mobile-types';

export interface ScooterFilters {
  latitude?: number;
  longitude?: number;
  radius?: number;
  batteryLevel?: number;
  status?: string;
}

export interface ScooterScanResult {
  scooter: Scooter;
  distance: number;
  estimatedTime: number;
}

class ScooterService {
  private baseUrl = `${API_CONFIG.BASE_URL}/scooters`;

  private async getAuthHeaders() {
    const token = await authService.getToken();
    return {
      ...API_CONFIG.HEADERS,
      'Authorization': `Bearer ${token}`,
    };
  }

  async getNearbyScooters(location: Location, radius: number = 1000): Promise<Scooter[]> {
    const headers = await this.getAuthHeaders();
    
    const queryParams = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: radius.toString(),
    });
    
    const response = await fetch(`${this.baseUrl}/nearby?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    });

    return await handleApiResponse(response);
  }

  async getScooterById(scooterId: string): Promise<Scooter> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/${scooterId}`, {
      method: 'GET',
      headers,
    });

    return await handleApiResponse(response);
  }

  async scanScooter(qrCode: string, userLocation: Location): Promise<ScooterScanResult> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/scan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ qrCode, userLocation }),
    });

    return await handleApiResponse(response);
  }

  async reserveScooter(scooterId: string): Promise<{ reservationId: string; expiresAt: string }> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/${scooterId}/reserve`, {
      method: 'POST',
      headers,
    });

    return await handleApiResponse(response);
  }

  async cancelReservation(scooterId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/${scooterId}/cancel-reservation`, {
      method: 'POST',
      headers,
    });

    await handleApiResponse(response);
  }

  async reportScooterIssue(scooterId: string, issue: string, description?: string, images?: string[]): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/${scooterId}/report-issue`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ issue, description, images }),
    });

    await handleApiResponse(response);
  }

  async getScooterMaintenanceHistory(scooterId: string): Promise<any[]> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/${scooterId}/maintenance-history`, {
      method: 'GET',
      headers,
    });

    return await handleApiResponse(response);
  }
}

export const scooterService = new ScooterService();