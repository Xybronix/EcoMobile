import { MobileRideInProgress } from '@/components/ride/MobileRideInProgress';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function RideInProgressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bikeData = params.bikeData ? JSON.parse(params.bikeData as string) : null;

  const handleNavigate = (screen: string, data?: any) => {
    switch(screen) {
      case 'account-management':
        router.navigate({
          pathname: '/(modals)/account-management',
          params: data
        });
        break;
      case 'create-incident':
        router.navigate({
          pathname: '/(modals)/create-incident',
          params: data
        });
        break;
      case 'home':
        router.navigate('/(tabs)/home');
        break;
      case 'rides':
        router.navigate('/(tabs)/rides');
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  if (!bikeData) {
    return null;
  }

  return (
    <MobileRideInProgress bike={bikeData} onEndRide={() => router.navigate('/(tabs)/home')} onReportIssue={() => handleNavigate('create-incident', { bikeId: bikeData.id })} onNavigate={handleNavigate} />
  );
}