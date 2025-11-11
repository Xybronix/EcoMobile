import Constants from 'expo-constants';

//const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.142.28.189:5000/api/v1';
const API_BASE_URL = 'http://10.142.28.189:5000/api/v1';


export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
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
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || 'Request failed', errorData.code);
  }
  return response.json();
};