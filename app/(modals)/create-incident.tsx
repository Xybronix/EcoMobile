import { MobileCreateIncident } from '@/components/incident/MobileCreateIncident';
import { PageTitle } from '@/components/ui/PageTitle';
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
    <>
      <PageTitle 
        titleFr="Créer un incident"
        titleEn="Create Incident"
      />
      <MobileCreateIncident onBack={handleBack} incidentId={incidentId} rideId={rideId} bikeId={bikeId} />
    </>
  );
}