import Constants from 'expo-constants';

// Configuration dynamique selon l'environnement
const getApiBaseUrl = () => {
  return 'https://ecomobile-8bx0.onrender.com/api/v1';
  /*
  if (__DEV__) {
    return 'http://10.201.154.189:5000/api/v1';
  }
  
  return Constants.expoConfig?.extra?.apiUrl || 'https://ecomobile-8bx0.onrender.com/api/v1';
  */
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
        message: `HTTP ${response.status} - ${response.statusText}`,
        code: 'UNKNOWN_ERROR'
      };
    }
    
    throw new ApiError(
      response.status, 
      errorData.message || `Request failed with status ${response.status}`, 
      errorData.code
    );
  }
  
  try {
    return await response.json();
  } catch (error) {
    throw new ApiError(500, 'Invalid JSON response from server', 'PARSE_ERROR');
  }
};