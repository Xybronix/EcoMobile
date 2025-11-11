import { MobileBikeDetails } from '@/components/bike/MobileBikeDetails';
import type { Bike } from '@/lib/mobile-types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function BikeDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bikeData = params.bikeData ? JSON.parse(params.bikeData as string) : null;

  const handleBack = () => {
    router.back();
  };

  const handleStartRide = (bike: Bike) => {
    router.navigate({
      pathname: '/(modals)/ride-in-progress',
      params: { bikeData: JSON.stringify(bike) }
    });
  };

  const handleNavigate = (screen: string, data?: any) => {
    switch(screen) {
      case 'bike-inspection':
        router.navigate({
          pathname: '/(modals)/bike-inspection',
          params: data
        });
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  if (!bikeData) {
    return null;
  }

  return (
    <MobileBikeDetails 
      bike={bikeData}
      onBack={handleBack}
      onStartRide={handleStartRide}
      onNavigate={handleNavigate}
    />
  );
}