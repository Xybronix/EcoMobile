import { MobileResetPassword } from '@/components/auth/MobileResetPassword';
import { useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    switch(screen) {
      case 'login':
        router.navigate('/(auth)/login');
        break;
      default:
        router.back();
    }
  };

  return <MobileResetPassword onNavigate={handleNavigate} />;
}