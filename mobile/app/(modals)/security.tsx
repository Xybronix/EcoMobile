import { MobileSecurity } from '@/components/profile/MobileSecurity';
import { PageTitle } from '@/components/ui/PageTitle';
import { useRouter } from 'expo-router';
import React from 'react';

export default function SecurityScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'profile':
        router.back();
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Sécurité"
        titleEn="Security"
      />
      <MobileSecurity onNavigate={handleNavigate} />
    </>
  );
}