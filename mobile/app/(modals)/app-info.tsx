import MobileAppInfo from '@/components/profile/MobileAppInfo';
import { PageTitle } from '@/components/ui/PageTitle';
import { useRouter } from 'expo-router';

export default function AppInfoScreen() {
  const router = useRouter();

  return (
    <>
      <PageTitle titleFr="À propos" titleEn="About" />
      <MobileAppInfo onBack={() => router.back()} />
    </>
  );
}
