import { MobileAccountManagement } from '@/components/profile/MobileAccountManagement';
import { useRouter } from 'expo-router';
import React from 'react';

export default function AccountManagementScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'profile':
        router.back();
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return <MobileAccountManagement onBack={handleBack} onNavigate={handleNavigate} />;
}