import { MobileReportIssue } from '@/components/bike/MobileReportIssue';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function ReportIssueScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bikeId = params.bikeId as string;
  const bikeName = params.bikeName as string;

  const handleBack = () => {
    router.back();
  };

  return (
    <MobileReportIssue
      bikeId={bikeId}
      bikeName={bikeName}
      onBack={handleBack}
    />
  );
}