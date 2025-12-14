import { useRouter } from 'expo-router';
import { MobileRegister } from '../../components/auth/MobileRegister';
import { PageTitle } from '@/components/ui/PageTitle';

export default function RegisterScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    if (screen === 'welcome') {
      router.back();
    } else if (screen === 'home') {
      router.replace('/(tabs)/home');
    } else if (screen === 'login') {
      router.navigate('/(auth)/login');
    }
  };

  return (
    <>
      <PageTitle 
        titleFr="S'inscrire"
        titleEn="Register"
      />
      <MobileRegister onNavigate={handleNavigate} />
    </>
  );
}