import { MobileBikeReservation } from '@/components/bike/MobileBikeReservation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function BikeReservationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bikeData = params.bikeData ? JSON.parse(params.bikeData as string) : null;

  const handleBack = () => {
    router.back();
  };

  const handleReservationComplete = () => {
    router.navigate('/(tabs)/map');
  };

  if (!bikeData) {
    return null;
  }

  return (
    <MobileBikeReservation 
      bike={bikeData}
      onBack={handleBack}
      onReservationComplete={handleReservationComplete}
    />
  );
}