import { MobileChat } from '@/components/profile/MobileChat';
import { PageTitle } from '@/components/ui/PageTitle';
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

  return (
    <>
      <PageTitle 
        titleFr="Support de Chat"
        titleEn="Chat Support"
      />
      <MobileChat onNavigate={handleNavigate} />
    </>
  );
}