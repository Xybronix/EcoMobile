import { MobileSecurity } from '@/components/profile/MobileSecurity';
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

  return <MobileSecurity onNavigate={handleNavigate} />;
}