import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { authService } from './authService';
import { storeNotificationsEnabled, getNotificationsEnabled } from '@/utils/storage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotional';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface NotificationPreferences {
  rideNotifications: boolean;
  promotionalNotifications: boolean;
  securityNotifications: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

class NotificationService {
  private baseUrl = `${API_CONFIG.BASE_URL}/notifications`;

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

  async getNotifications(page: number = 1, limit: number = 20): Promise<{ notifications: Notification[]; total: number; page: number }> {
    const headers = await this.getAuthHeaders();
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
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

  async markAsRead(notificationId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${notificationId}/read`, {
        method: 'PUT',
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

  async markAllAsRead(): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/read-all`, {
        method: 'PUT',
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

  async getUnreadCount(): Promise<number> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/unread-count`, {
        method: 'GET',
        headers,
      });

      const data = await handleApiResponse(response);
      return data.count || 0;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/${notificationId}`, {
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

  async getPreferences(): Promise<NotificationPreferences> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/preferences`, {
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

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/preferences`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(preferences),
      });

      const updatedPreferences = await handleApiResponse(response);
      
      // Stocker localement l'état des notifications
      if (preferences.pushNotifications !== undefined) {
        await storeNotificationsEnabled(preferences.pushNotifications);
      }
      
      return updatedPreferences;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async registerPushToken(token: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/push-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token }),
      });

      await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(this.getErrorMessage(error));
      }
      throw new Error('network_error');
    }
  }

  async unregisterPushToken(): Promise<void> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}/push-token`, {
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

  async areNotificationsEnabled(): Promise<boolean> {
    return await getNotificationsEnabled();
  }

  private getErrorMessage(error: ApiError): string {
    switch (error.status) {
      case 400:
        return 'invalid_data';
      case 401:
        return 'unauthorized';
      case 404:
        return 'notification_not_found';
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

export const notificationService = new NotificationService();