import { MobileForgotPassword } from '@/components/auth/MobileForgotPassword';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'login':
        router.navigate('/(auth)/login');
        break;
      case 'reset-password':
        router.navigate('/(auth)/reset-password');
        break;
      default:
        router.back();
    }
  };

  return <MobileForgotPassword onNavigate={handleNavigate} />;
}