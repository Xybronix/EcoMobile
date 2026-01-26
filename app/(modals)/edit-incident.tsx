import { MobileCreateIncident } from '@/components/incident/MobileCreateIncident';
import { PageTitle } from '@/components/ui/PageTitle';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function EditIncidentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const incidentId = params.incidentId as string;

  const handleBack = () => {
    router.back();
  };

  if (!incidentId) {
    router.back();
    return null;
  }

  return (
    <>
      <PageTitle 
        titleFr="Modifier l'incident"
        titleEn="Edit Incident"
      />
      <MobileCreateIncident onBack={handleBack} incidentId={incidentId} />
    </>
  );
}