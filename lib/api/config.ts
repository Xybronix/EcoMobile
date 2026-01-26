import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  //return 'https://ecomobile-8bx0.onrender.com/api/v1';
  if (__DEV__) {
    return 'http://10.15.164.189:5000/api/v1';
  }
  
  return Constants.expoConfig?.extra?.apiUrl || 'https://ecomobile-8bx0.onrender.com/api/v1';
};

const API_BASE_URL = getApiBaseUrl();


export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Gestion des erreurs API
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Intercepteur de requêtes
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { 
        error: `HTTP ${response.status} - ${response.statusText}`,
        message: `HTTP ${response.status} - ${response.statusText}`,
        code: 'UNKNOWN_ERROR'
      };
    }
    
    // Le backend peut renvoyer soit 'error' soit 'message', on prend les deux en compte
    const errorMessage = errorData.error || errorData.message || `Request failed with status ${response.status}`;
    
    // Si c'est un 403 (Forbidden), déconnecter l'utilisateur automatiquement
    if (response.status === 403) {
      const { authService } = await import('@/services/authService');
      try {
        await authService.logout();
      } catch (logoutError) {
        console.error('Error during logout on 403:', logoutError);
      }
    }
    
    throw new ApiError(
      response.status, 
      errorMessage, 
      errorData.code
    );
  }
  
  try {
    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new ApiError(500, 'Invalid JSON response from server :', errorMessage);
  }
};