import { MobileNotifications } from '@/components/profile/MobileNotifications';
import { PageTitle } from '@/components/ui/PageTitle';
import { useRouter } from 'expo-router';
import React from 'react';

export default function NotificationsScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'home':
        router.navigate('/(tabs)/home' as any);
        break;
      default:
        router.back();
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Notifications"
        titleEn="Notifications"
      />
      <MobileNotifications onNavigate={handleNavigate} />
    </>
  );
}