// app/(modals)/subscription-plans.tsx
import { MobileSubscriptionPlans } from '@/components/subscription/MobileSubscriptionPlans';
import { useRouter } from 'expo-router';
import React from 'react';

export default function SubscriptionPlansScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNavigate = (screen: string, data?: any) => {
    switch(screen) {
      case 'wallet':
      case 'wallet-topup':
        router.navigate('/(modals)/wallet');
        break;
      
      case 'account-management':
        router.navigate({
          pathname: '/(modals)/account-management',
          params: data || {}
        });
        break;
      
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return (
    <MobileSubscriptionPlans 
      onBack={handleBack} 
      onNavigate={handleNavigate}
    />
  );
}