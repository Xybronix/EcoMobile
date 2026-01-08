import { API_CONFIG, handleApiResponse, ApiError } from '@/lib/api/config';
import { getAuthToken } from '@/utils/storage';
import { withNetworkCheck } from '@/lib/api/networkInterceptor';
import { authService } from './authService';

export interface IdentityDocument {
  id: string;
  documentType: 'CNI' | 'RECEPISSE';
  frontImage: string;
  backImage?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  submittedAt: string;
}

export interface ResidenceProof {
  id: string;
  proofType: 'DOCUMENT' | 'MAP_COORDINATES';
  documentFile?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  details?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  submittedAt: string;
}

export interface DocumentsStatus {
  identityDocuments: IdentityDocument[];
  residenceProof: ResidenceProof | null;
  allDocumentsSubmitted: boolean;
  allDocumentsApproved: boolean;
}

class DocumentService {
  private baseUrl = `${API_CONFIG.BASE_URL}/documents`;

  private async getAuthHeaders() {
    const token = await getAuthToken();
    return {
      ...API_CONFIG.HEADERS,
      'Authorization': `Bearer ${token}`,
    };
  }

  async submitIdentityDocument(data: {
    documentType: 'CNI' | 'RECEPISSE';
    frontImage: string; // Base64
    backImage?: string; // Base64
  }): Promise<IdentityDocument> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/identity`, {
          method: 'POST',
          headers: await this.getAuthHeaders(),
          body: JSON.stringify(data),
        });

        const result = await handleApiResponse(response);
        return result.data;
      } catch (error) {
        if (error instanceof ApiError) {
          // Si erreur d'autorisation (401, 403), déconnecter
          if (error.status === 401 || error.status === 403) {
            await authService.logout();
            throw new Error('unauthorized');
          }
          throw new Error(error.message || 'document.submissionFailed');
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequired');
  }

  async submitResidenceProof(data: {
    proofType: 'DOCUMENT' | 'MAP_COORDINATES';
    documentFile?: string; // Base64
    latitude?: number;
    longitude?: number;
    address?: string;
    details?: string;
  }): Promise<ResidenceProof> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/residence`, {
          method: 'POST',
          headers: await this.getAuthHeaders(),
          body: JSON.stringify(data),
        });

        const result = await handleApiResponse(response);
        return result.data;
      } catch (error) {
        if (error instanceof ApiError) {
          // Si erreur d'autorisation (401, 403), déconnecter
          if (error.status === 401 || error.status === 403) {
            await authService.logout();
            throw new Error('unauthorized');
          }
          throw new Error(error.message || 'document.submissionFailed');
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequired');
  }

  async getDocumentsStatus(): Promise<DocumentsStatus> {
    return withNetworkCheck(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/status`, {
          method: 'GET',
          headers: await this.getAuthHeaders(),
        });

        const result = await handleApiResponse(response);
        return result.data;
      } catch (error) {
        if (error instanceof ApiError) {
          // Si erreur d'autorisation (401, 403), déconnecter
          if (error.status === 401 || error.status === 403) {
            await authService.logout();
            throw new Error('unauthorized');
          }
          throw new Error(error.message || 'document.fetchFailed');
        }
        throw new Error('network_error');
      }
    }, 'auth.internetRequired');
  }
}

export const documentService = new DocumentService();
