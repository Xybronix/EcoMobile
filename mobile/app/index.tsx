import { useRouter } from 'expo-router';
import { PageTitle } from '@/components/ui/PageTitle';
import MobileWelcome from '@/components/MobileWelcome';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    if (screen === 'login') {
      router.navigate('/(auth)/login');
    } else if (screen === 'register') {
      router.navigate('/(auth)/register');
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="Bienvenue"
        titleEn="Welcome"
      />
      <MobileWelcome onNavigate={handleNavigate} />
    </>
  );
}