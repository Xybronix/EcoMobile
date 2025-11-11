import { MobileChat } from '@/components/profile/MobileChat';
import { useRouter } from 'expo-router';
import React from 'react';

export default function ChatScreen() {
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

  return <MobileChat onNavigate={handleNavigate} />;
}