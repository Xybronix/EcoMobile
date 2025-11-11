import { MobileBikeMap } from '@/components/bike/MobileBikeMap';
import { useRouter } from 'expo-router';
import React from 'react';

export default function MapScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string, data?: unknown) => {
    switch(screen) {
      case 'notifications':
        router.navigate('/(modals)/notifications' as any);
        break;
      case 'bike-details':
        router.navigate({
          pathname: '/(modals)/bike-details' as any,
          params: { bikeData: JSON.stringify(data) }
        });
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return <MobileBikeMap onNavigate={handleNavigate} />;
}