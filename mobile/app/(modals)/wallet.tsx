import { MobileWallet } from '@/components/home/MobileWallet';
import { useRouter } from 'expo-router';
import React from 'react';

export default function WalletScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'notifications':
        router.navigate('/(modals)/notifications' as any);
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return <MobileWallet onBack={handleBack} onNavigate={handleNavigate} />;
}