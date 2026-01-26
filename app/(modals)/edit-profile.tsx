import MobileEditProfile from '@/components/profile/MobileEditProfile';
import { PageTitle } from '@/components/ui/PageTitle';
import { useRouter } from 'expo-router';
import React from 'react';

export default function EditProfileScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'profile':
        router.back();
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Modifier le profil"
        titleEn="Edit Profile"
      />
      <MobileEditProfile onNavigate={handleNavigate} />
    </>
  );
}