import { MobileRechargeDeposit } from '@/components/home/MobileRechargeDeposit';
import { PageTitle } from '@/components/ui/PageTitle';
import { useRouter } from 'expo-router';
import React from 'react';

export default function RechargeDepositScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSuccess = () => {
    router.push({
      pathname: '/(modals)/account-management',
      params: { activeTab: 'overview' }
    });
  };

  return (
    <>
      <PageTitle 
        titleFr="Recharger le dépôt"
        titleEn="Recharge Deposit"
      />
      <MobileRechargeDeposit onBack={handleBack} onSuccess={handleSuccess} />
    </>
  );
}