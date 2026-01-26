import { MobileResetPassword } from '@/components/auth/MobileResetPassword';
import { PageTitle } from '@/components/ui/PageTitle';
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

  return (
    <>
      <PageTitle 
        titleFr="Réinitialiser le mot de passe"
        titleEn="Reset Password"
      />
      <MobileResetPassword onNavigate={handleNavigate} />
    </>
  );
}