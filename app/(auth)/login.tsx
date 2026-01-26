/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import MobileLogin from '../../components/auth/MobileLogin';
import { PageTitle } from '@/components/ui/PageTitle';

export default function LoginScreen() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(router.canGoBack());
  }, []);

  const handleNavigate = (screen: string) => {
    if (screen === 'welcome') {
      if (canGoBack) {
        router.back();
      } else {
        router.replace('../index');
      }
    } else if (screen === 'home') {
      router.replace('/(tabs)/home');
    } else if (screen === 'register') {
      router.navigate('/(auth)/register');
    } else if (screen === 'forgot-password') {
      router.navigate('/(auth)/forgot-password');
    } else if (screen === 'submit-documents') {
      router.replace('/(auth)/submit-documents');
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Se connecter"
        titleEn="Login"
      />
      <MobileLogin onNavigate={handleNavigate} />
    </>
  );
}