import { MobileBikeInspection } from '@/components/bike/MobileBikeInspection';
import { PageTitle } from '@/components/ui/PageTitle';
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
      if (data.type === 'unlock_request_sent') {
        router.navigate({
          pathname: '/(modals)/account-management',
          params: { activeTab: 'requests' }
        });
      } else {
        router.navigate('/(tabs)/home');
      }
    } else {
      const hasIssues = data.issues && data.issues.length > 0;
      
      if (hasIssues) {
        router.navigate({
          pathname: '/(modals)/account-management',
          params: { 
            activeTab: 'incidents',
            inspectionData: JSON.stringify(data)
          }
        });
      } else {
        router.navigate('/(tabs)/home');
      }
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Inspection du vélo"
        titleEn="Bike Inspection"
      />
      <MobileBikeInspection bikeId={bikeId} bikeName={bikeName} inspectionType={inspectionType} onNavigate={(route, params) => router.navigate(route as any, params)} onComplete={handleComplete} onBack={handleBack} />
    </>
  );
}