import { MobileBikeInspection } from '@/components/bike/MobileBikeInspection';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function BikeInspectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bikeId = params.bikeId as string;
  const bikeName = params.bikeName as string;
  const inspectionType = params.inspectionType as 'pickup' | 'return';
  const onInspectionComplete = params.onInspectionComplete ? eval(`(${params.onInspectionComplete})`) : null;

  const handleBack = () => {
    router.back();
  };

  const handleComplete = (data: any) => {
    if (onInspectionComplete) {
      onInspectionComplete(data);
    } else if (inspectionType === 'pickup') {
      router.navigate({
        pathname: '/(modals)/account-management',
        params: { activeTab: 'requests' }
      });
    } else {
      const hasIssues = data.issues && data.issues.length > 0;
      
      if (hasIssues) {
        router.navigate({
          pathname: '/(modals)/account-management',
          params: { activeTab: 'incidents' }
        });
      } else {
        router.navigate('/(tabs)/home');
      }
    }
  };

  return (
    <MobileBikeInspection
      bikeId={bikeId}
      bikeName={bikeName}
      inspectionType={inspectionType}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}