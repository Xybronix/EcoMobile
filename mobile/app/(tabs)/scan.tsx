import { MobileQRScanner } from '@/components/bike/MobileQRScanner';
import type { Bike } from '@/lib/mobile-types';
import { useRouter } from 'expo-router';
import React from 'react';

export default function ScanScreen() {
  const router = useRouter();

  const handleBikeFound = (bike: Bike) => {
    router.navigate({
      pathname: '/(modals)/bike-details' as any,
      params: { bikeData: JSON.stringify(bike) }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return <MobileQRScanner onBikeFound={handleBikeFound} onBack={handleBack} />;
}