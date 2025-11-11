import MobileProfile from '@/components/profile/MobileProfile';
import { useRouter } from 'expo-router';
import React from 'react';

export default function ProfileScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'notifications':
        router.navigate('/(modals)/notifications' as any);
        break;
      case 'chat':
        router.navigate('/(modals)/chat' as any);
        break;
      case 'edit-profile':
        router.navigate('/(modals)/edit-profile' as any);
        break;
      case 'security':
        router.navigate('/(modals)/security' as any);
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return <MobileProfile onNavigate={handleNavigate} />;
}