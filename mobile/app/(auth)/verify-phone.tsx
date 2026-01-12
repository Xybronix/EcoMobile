import { PageTitle } from '@/components/ui/PageTitle';
import MobilePhoneVerification from '@/components/auth/MobilePhoneVerification';
import { useRouter } from 'expo-router';
import React from 'react';

export default function VerifyPhoneScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'register':
        router.replace('/(auth)/register');
        break;
      case 'login':
        router.replace('/(auth)/login');
        break;
      case 'home':
        router.replace('/(tabs)/home');
        break;
      case 'documents':
        router.replace('/(auth)/submit-documents');
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Si on ne peut pas revenir en arrière, rediriger vers la page de connexion
      router.replace('/(auth)/login');
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Vérification téléphone"
        titleEn="Phone Verification"
      />
      <MobilePhoneVerification onNavigate={handleNavigate} onBack={handleBack} />
    </>
  );
}
