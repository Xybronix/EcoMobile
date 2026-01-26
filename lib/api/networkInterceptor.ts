import { internetService } from '@/lib/internetService';
import { ApiError } from '@/lib/api/config';

export async function withNetworkCheck<T>(
  apiCall: () => Promise<T>,
  customErrorMessage?: string
): Promise<T> {
  if (!internetService.getStatus()) {
    throw new ApiError(0, customErrorMessage || 'Pas de connexion Internet', 'NETWORK_ERROR');
  }
  
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
      throw error;
    }
    
    // Vérifier si c'est une erreur réseau
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      await internetService.checkConnection();
      throw new ApiError(0, 'Erreur réseau - Vérifiez votre connexion Internet', 'NETWORK_ERROR');
    }
    
    throw error;
  }
}