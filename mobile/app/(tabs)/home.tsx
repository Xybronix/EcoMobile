// app/(tabs)/home.tsx
import { MobileHome } from '@/components/home/MobileHome';
import { useRouter } from 'expo-router';
import React from 'react';

export default function HomeScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string, data?: unknown) => {
    switch(screen) {
      case 'map':
        router.navigate('/(tabs)/map');
        break;
      case 'scan':
        router.navigate('/(tabs)/scan');
        break;
      case 'rides':
        router.navigate('/(tabs)/rides');
        break;
      case 'profile':
        router.navigate('/(tabs)/profile');
        break;
      case 'account-management':
        router.navigate('/(modals)/account-management');
        break;
      case 'wallet':
        router.push('/(modals)/wallet');
        break;
      case 'notifications':
        router.push('/(modals)/notifications');
        break;
      case 'ride-details':
        router.push({
          pathname: '/(modals)/ride-details',
          params: { rideData: JSON.stringify(data) }
        });
        break;
      default:
        break;
    }
  };

  return <MobileHome onNavigate={handleNavigate} />;
}