import { MobileReportIssue } from '@/components/bike/MobileReportIssue';
import { PageTitle } from '@/components/ui/PageTitle';
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
    <>
      <PageTitle 
        titleFr="Signaler un problème"
        titleEn="Report an Issue"
      />
      <MobileReportIssue bikeId={bikeId} bikeName={bikeName} onBack={handleBack} />
    </>
  );
}