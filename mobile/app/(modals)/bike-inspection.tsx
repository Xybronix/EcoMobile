import { MobileBikeInspection } from '@/components/bike/MobileBikeInspection';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function BikeInspectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bikeId = params.bikeId as string;
  const bikeName = params.bikeName as string;
  const inspectionType = params.inspectionType as 'pickup' | 'return';

  const handleBack = () => {
    router.back();
  };

  const handleComplete = (data: any) => {
    if (inspectionType === 'pickup') {
      router.navigate({
        pathname: '/(modals)/ride-in-progress',
        params: { 
          bikeData: JSON.stringify({
            id: bikeId,
            name: bikeName,
            // autres données du vélo...
          })
        }
      });
    } else {
      router.navigate('/(tabs)/home');
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