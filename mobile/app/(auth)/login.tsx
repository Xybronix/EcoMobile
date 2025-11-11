import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import MobileLogin from '../../components/auth/MobileLogin';

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
    }
  };

  return <MobileLogin onNavigate={handleNavigate} />;
}