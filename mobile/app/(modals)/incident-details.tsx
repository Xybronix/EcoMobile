// app/(modals)/incident-details.tsx
import { MobileIncidentDetails } from '@/components/incident/MobileIncidentDetails';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function IncidentDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const incidentId = params.id as string;

  const handleBack = () => {
    router.back();
  };

  const handleEdit = (id: string) => {
    router.push({
      pathname: '/(modals)/edit-incident',
      params: { incidentId: id }
    });
  };

  if (!incidentId) {
    router.back();
    return null;
  }

  return (
    <MobileIncidentDetails 
      incidentId={incidentId}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}