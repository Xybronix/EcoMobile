import { PageTitle } from '@/components/ui/PageTitle';
import MobileDocumentSubmission from '@/components/auth/MobileDocumentSubmission';
import { useRouter } from 'expo-router';
import React from 'react';

export default function SubmitDocumentsScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'home':
        router.replace('/(tabs)/home');
        break;
      case 'profile':
        router.replace('/(tabs)/profile');
        break;
      default:
        console.log(`Navigation to ${screen} not implemented`);
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Soumission des documents"
        titleEn="Document Submission"
      />
      <MobileDocumentSubmission onNavigate={handleNavigate} />
    </>
  );
}
