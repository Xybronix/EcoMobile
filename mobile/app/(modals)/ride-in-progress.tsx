import { MobileRideInProgress } from '@/components/ride/MobileRideInProgress';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function RideInProgressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bikeData = params.bikeData ? JSON.parse(params.bikeData as string) : null;

  const handleEndRide = () => {
    router.navigate('/(tabs)/home');
  };

  const handleReportIssue = () => {
    router.navigate({
      pathname: '/(modals)/report-issue',
      params: { 
        bikeId: bikeData.id,
        bikeName: bikeData.name
      }
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
      case 'report-issue':
        router.navigate({
          pathname: '/(modals)/report-issue',
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
    <MobileRideInProgress
      bike={bikeData}
      onEndRide={handleEndRide}
      onReportIssue={handleReportIssue}
      onNavigate={handleNavigate}
    />
  );
}