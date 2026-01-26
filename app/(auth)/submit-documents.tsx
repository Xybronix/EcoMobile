import { PageTitle } from '@/components/ui/PageTitle';
import MobileDocumentSubmission from '@/components/auth/MobileDocumentSubmission';
import { useRouter } from 'expo-router';
import React from 'react';
import { useMobileAuth } from '@/lib/mobile-auth';
import { authService } from '@/services/authService';

export default function SubmitDocumentsScreen() {
  const router = useRouter();
  const { user } = useMobileAuth();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'home':
        router.replace('/(tabs)/home');
        break;
      case 'profile':
        router.replace('/(tabs)/profile');
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  const handleBack = async () => {
    try {
      // Vérifier si l'utilisateur est authentifié
      const authenticated = await authService.isAuthenticated();
      
      // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
      if (!authenticated) {
        router.replace('/(auth)/login');
        return;
      }

      // Récupérer les données utilisateur actuelles pour vérifier le statut
      let currentUser = user;
      if (!currentUser) {
        try {
          currentUser = await authService.getCurrentUser();
        } catch {
          // Si erreur lors de la récupération, considérer comme non authentifié
          router.replace('/(auth)/login');
          return;
        }
      }

      // Si le compte n'est pas validé (status === 'pending_verification'), 
      // rediriger vers la page de connexion pour qu'il se reconnecte
      if (currentUser && currentUser.status === 'pending_verification') {
        router.replace('/(auth)/login');
        return;
      }

      // Si l'utilisateur est authentifié et validé, comportement normal
      if (router.canGoBack()) {
        router.back();
      } else {
        // Si on ne peut pas revenir en arrière, rediriger vers la page de connexion
        router.replace('/(auth)/login');
      }
    } catch {
      // En cas d'erreur, rediriger vers la page de connexion
      router.replace('/(auth)/login');
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Soumission des documents"
        titleEn="Document Submission"
      />
      <MobileDocumentSubmission onNavigate={handleNavigate} onBack={handleBack} />
    </>
  );
}
