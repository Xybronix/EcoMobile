import { MobileAccountManagement } from '@/components/profile/MobileAccountManagement';
import { PageTitle } from '@/components/ui/PageTitle';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function AccountManagementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const initialTab = params.activeTab as string | undefined;

  const handleBack = () => {
    router.back();
  };

  const handleNavigate = (screen: string, data?: any) => {
    switch(screen) {
      case 'profile':
        router.back();
        break;
      case 'subscription-plans':
        router.navigate('/(modals)/subscription-plans');
        break;
      case 'wallet-topup':
      case 'wallet':
        router.navigate('/(modals)/wallet');
        break;
      case 'recharge-deposit':
        router.navigate('/(modals)/recharge-deposit');
        break;
      case 'create-incident':
        router.navigate('/(modals)/create-incident');
        break;
      case 'incident-details':
        router.navigate({
          pathname: '/(modals)/incident-details',
          params: { incidentId: data?.incidentId }
        });
        break;
      case 'edit-incident':
        router.navigate({
          pathname: '/(modals)/edit-incident',
          params: { incidentId: data?.incidentId }
        });
        break;
      case 'bike-map':
        router.navigate('/(tabs)/map');
        break;
      case 'bike-details':
        router.navigate({
          pathname: '/(modals)/bike-details',
          params: { bikeData: JSON.stringify(data?.bikeData) }
        });
        break;
      case 'ride-in-progress':
        router.navigate({
          pathname: '/(modals)/ride-in-progress',
          params: { bikeData: JSON.stringify(data?.bikeData) }
        });
        break;
      case 'home':
        router.navigate('/(tabs)/home');
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Gestion de compte"
        titleEn="Account Management"
      />
      <MobileAccountManagement onBack={handleBack} onNavigate={handleNavigate} initialTab={initialTab} />
    </>
  );
}