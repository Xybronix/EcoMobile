import MobileProfile from '@/components/profile/MobileProfile';
import { PageTitle } from '@/components/ui/PageTitle';
import { useRouter } from 'expo-router';
import React from 'react';

export default function ProfileScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'notifications':
        router.navigate('/(modals)/notifications' as any);
        break;
      case 'verify-phone':
        router.replace('/(auth)/verify-phone');
        break;
      case 'submit-documents':
        router.replace('/(auth)/submit-documents');
        break;
      case 'edit-profile':
        router.navigate('/(modals)/edit-profile' as any);
        break;
      case 'account-management':
        router.navigate('/(modals)/account-management' as any);
        break;
      case 'security':
        router.navigate('/(modals)/security' as any);
        break;
      case 'chat':
        router.navigate('/(modals)/chat' as any);
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Profil"
        titleEn="Profile"
      />
      <MobileProfile onNavigate={handleNavigate} />
    </>
  );
}