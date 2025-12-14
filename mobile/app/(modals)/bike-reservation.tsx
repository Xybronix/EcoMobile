import { MobileBikeReservation } from '@/components/bike/MobileBikeReservation';
import { PageTitle } from '@/components/ui/PageTitle';
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
    router.navigate({
      pathname: '/(modals)/account-management',
      params: { activeTab: 'reservations' }
    });
  };

  if (!bikeData) {
    return null;
  }

  return (
    <>
      <PageTitle 
        titleFr="Réservation de vélo"
        titleEn="Bike Reservation"
      />
      <MobileBikeReservation bike={bikeData} onBack={handleBack} onReservationComplete={handleReservationComplete} />
    </>
  );
}