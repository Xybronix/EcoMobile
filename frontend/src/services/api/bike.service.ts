// services/api/bike.service.ts
import { apiClient } from './client';

export interface BikePosition {
  id: string;
  name: string;
  imei: string;
  code: string;
  model: string;
  brand?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'low-battery' | 'UNAVAILABLE';
  isActive?: boolean;
  battery: number;
  gpsSignal: number;
  gsmSignal: number;
  lat: number;
  lon: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  zone: string;
  location?: string;
  speed?: number;
  lastUpdate: string;
  totalTrips?: number;
  maintenanceReason?: string;
  maintenanceDetails?: string;
  equipment?: string[];
  qrCode?: string;
  locationName?: string;
  gpsDeviceId?: string;
  pricingPlan?: any;
  createdAt: string;
  updatedAt: string;
}

export interface BikeStats {
  totalDistance: number;
  totalTrips: number;
  totalRevenue: number;
  utilizationHours: number;
  averageSpeed: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export interface MaintenanceRecord {
  id: string;
  bikeId: string;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  cost: number;
  technician: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  createdAt: string;
}

export interface PaginatedBikes {
  bikes: BikePosition[];
  total: number;
  pages: number;
  currentPage: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBikeData {
  code: string;
  model: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  gpsDeviceId?: string;
  equipment?: string[];
  pricingPlanId?: string;
}

export interface UpdateBikeData {
  code?: string;
  model?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  maintenanceReason?: string;
  maintenanceDetails?: string;
  equipment?: string[];
  pricingPlanId?: string;
}


export class BikeService {
  async getAllBikes(params?: {
    page?: number;
    limit?: number;
    status?: string;
    zone?: string;
    search?: string;
  }): Promise<PaginatedBikes> {
    const response = await apiClient.get<PaginatedBikes>('/bikes', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération des vélos');
    }

    return response.data;
  }

  async createBike(data: CreateBikeData): Promise<BikePosition> {
    const response = await apiClient.post<BikePosition>('/bikes', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la création du vélo');
    }

    return response.data;
  }

  async getBikeById(id: string): Promise<BikePosition> {
    const response = await apiClient.get<BikePosition>(`/bikes/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Vélo non trouvé');
    }

    return response.data;
  }

  async updateBike(id: string, data: UpdateBikeData): Promise<BikePosition> {
    const response = await apiClient.put<BikePosition>(`/bikes/${id}`, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la modification du vélo');
    }

    return response.data;
  }

  async deleteBike(id: string): Promise<void> {
    const response = await apiClient.delete(`/bikes/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la suppression du vélo');
    }
  }

  async getBikeStats(id: string): Promise<BikeStats> {
    const response = await apiClient.get<BikeStats>(`/bikes/${id}/stats`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération des statistiques');
    }

    return response.data;
  }

  async getMaintenanceHistory(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{ maintenance: MaintenanceRecord[], total: number }> {
    const response = await apiClient.get<{ logs: MaintenanceRecord[], pagination: { total: number } }>(`/bikes/${id}/maintenance`, params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération de l\'historique');
    }

    return {
      maintenance: response.data.logs,
      total: response.data.pagination.total
    };
  }

  async addMaintenance(id: string, data: {
    type: 'preventive' | 'corrective' | 'emergency';
    description: string;
    cost: number;
    technician: string;
    scheduledDate: string;
  }): Promise<MaintenanceRecord> {
    const response = await apiClient.post<MaintenanceRecord>(`/bikes/${id}/maintenance`, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de l\'ajout de la maintenance');
    }

    return response.data;
  }

  async getBikeByCode(code: string): Promise<BikePosition> {
    const response = await apiClient.get<BikePosition>(`/bikes/code/${code}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Vélo non trouvé');
    }

    return response.data;
  }

  async getNearbyBikes(lat: number, lon: number, radius?: number): Promise<BikePosition[]> {
    const response = await apiClient.get<BikePosition[]>('/bikes/nearby', { lat, lon, radius });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération des vélos à proximité');
    }

    return response.data;
  }

  async searchAreas(query: string, country: string = 'CM'): Promise<any[]> {
    const response = await apiClient.post<{data: any[]}>('/bikes/areas/search', { query, country });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la recherche de lieux');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  async getDefaultAreas(): Promise<any[]> {
    const response = await apiClient.get<{data: any[]}>('/bikes/areas/default');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erreur lors de la récupération des zones');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await apiClient.post<{data: {address: string}}>('/bikes/reverse-geocode', { latitude, longitude });
      return response.data?.data?.address || '';
    } catch (error) {
      console.error('Erreur reverse geocoding:', error);
      return '';
    }
  }
}

export const bikeService = new BikeService();