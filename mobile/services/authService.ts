import { withNetworkCheck } from '@/lib/api/networkInterceptor';
import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { 
  storeAuthToken, 
  getAuthToken, 
  storeUserData, 
  getUserData,
  isAuthenticated,
  clearAuthData 
} from '@/utils/storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  language: string;
}

export interface User {
  wallet: any;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  language: string;
  role: string;
  status: 'pending' | 'pending_verification' | 'active' | 'inactive' | 'suspended' | 'banned';
  isActive?: boolean;
  emailVerified: boolean;
  phoneVerified?: boolean;
  accountVerified?: boolean;
  verificationStatus?: {
    email: boolean;
    phone: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface VerifyEmailRequest {
  userId: string;
  token: string;
}

export interface VerifyEmailResponse {
  verified: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  resent: boolean;
}

class AuthService {
  private baseUrl = `${API_CONFIG.BASE_URL}/auth`;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/login`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify(credentials),
        });

        const responseData = await handleApiResponse(response);
        const data = responseData.data;
        
        await storeAuthToken(data.token);
        await storeUserData(data.user);
        
        return data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForLogin');
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/register`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify(userData),
        });

        const responseData = await handleApiResponse(response);
        const data = responseData.data;
        
        await storeAuthToken(data.token);
        await storeUserData(data.user);
        
        return data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForRegister');
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/verify-email`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify(data),
        });

        const responseData = await handleApiResponse(response);
        return responseData.data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForVerification');
  }

  async resendVerification(email: string): Promise<ResendVerificationResponse> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/resend-verification`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({ email }),
        });

        const responseData = await handleApiResponse(response);
        return responseData.data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForVerification');
  }

  async getCurrentUser(): Promise<User> {
    return withNetworkCheck(async () => {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('not_authenticated');
      }

      try {
        const response = await fetch(`${this.baseUrl}/me`, {
          method: 'GET',
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`,
          },
        });

        const responseData = await handleApiResponse(response);
        const user = responseData.data;
        await storeUserData(user);
        
        return user;
      } catch (error) {
        // Si erreur d'autorisation (401, 403), déconnecter et ne pas retourner les données stockées
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          await this.logout();
          throw new Error('not_authenticated');
        }
        
        // Pour les autres erreurs (réseau, etc.), retourner les données stockées si disponibles
        const storedUser = await getUserData<User>();
        if (storedUser) {
          return storedUser;
        }
        
        throw error;
      }
    }, 'auth.internetRequiredForUser');
  }

  async forgotPassword(email: string): Promise<void> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/forgot-password`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({ email }),
        });

        await handleApiResponse(response);
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForForgotPassword');
  }

  async resetPassword(token: string, password: string): Promise<void> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/reset-password`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({ token, password }),
        });

        await handleApiResponse(response);
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForResetPassword');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return withNetworkCheck(async () => {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('not_authenticated');
      }

      try {
        const response = await fetch(`${this.baseUrl}/change-password`, {
          method: 'POST',
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        await handleApiResponse(response);
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForChangePassword');
  }

  async getToken(): Promise<string | null> {
    return await getAuthToken();
  }

  async getUser(): Promise<User | null> {
    return await getUserData<User>();
  }

  async getStoredUser(): Promise<User | null> {
    return await getUserData<User>();
  }

  async isAuthenticated(): Promise<boolean> {
    return await isAuthenticated();
  }

  async logout(): Promise<void> {
    await clearAuthData();
  }

  async initiatePhoneVerification(phone: string): Promise<{ code?: string }> {
    return withNetworkCheck(async () => {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('not_authenticated');
      }

      try {
        const response = await fetch(`${this.baseUrl}/verify-phone/initiate`, {
          method: 'POST',
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ phone }),
        });

        const result = await handleApiResponse(response);
        return result.data || {};
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForPhoneVerification');
  }

  async verifyPhoneCode(code: string): Promise<void> {
    return withNetworkCheck(async () => {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('not_authenticated');
      }

      try {
        const response = await fetch(`${this.baseUrl}/verify-phone/verify`, {
          method: 'POST',
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        });

        await handleApiResponse(response);
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForPhoneVerification');
  }

  async resendPhoneVerification(): Promise<void> {
    return withNetworkCheck(async () => {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('not_authenticated');
      }

      try {
        const response = await fetch(`${this.baseUrl}/verify-phone/resend`, {
          method: 'POST',
          headers: {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`,
          },
        });

        await handleApiResponse(response);
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForPhoneVerification');
  }

  async resendEmailVerification(): Promise<void> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/resend-verification`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({ email: (await this.getUser())?.email }),
        });

        await handleApiResponse(response);
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(this.getErrorMessage(error));
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequiredForEmailVerification');
  }

  private getErrorMessage(error: ApiError): string {
    return error.message || 'unknown_error';
  }
}

export const authService = new AuthService();