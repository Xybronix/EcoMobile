// app/(modals)/create-incident.tsx
import { MobileCreateIncident } from '@/components/incident/MobileCreateIncident';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function CreateIncidentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Récupérer les paramètres
  const incidentId = params.incidentId as string | undefined;
  const rideId = params.rideId as string | undefined;
  const bikeId = params.bikeId as string | undefined;

  const handleBack = () => {
    router.back();
  };

  return (
    <MobileCreateIncident 
      onBack={handleBack}
      incidentId={incidentId}
      rideId={rideId}
      bikeId={bikeId}
    />
  );
}