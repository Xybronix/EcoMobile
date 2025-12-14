import { MobileRideHistory } from '@/components/ride/MobileRideHistory';
import type { Ride } from '@/lib/mobile-types';
import { PageTitle } from '@/components/ui/PageTitle';
import { useRouter } from 'expo-router';
import React from 'react';

export default function RidesScreen() {
  const router = useRouter();

  const handleRideDetails = (ride: Ride) => {
    router.navigate({
      pathname: '/(modals)/ride-details' as any,
      params: { rideData: JSON.stringify(ride) }
    });
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

  return (
    <>
      <PageTitle 
        titleFr="Trajets"
        titleEn="Rides"
      />
      <MobileRideHistory onRideDetails={handleRideDetails} onNavigate={handleNavigate} />
    </>
  );
}