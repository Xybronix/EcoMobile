// app/(modals)/recharge-deposit.tsx
import { MobileRechargeDeposit } from '@/components/home/MobileRechargeDeposit';
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
    <MobileRechargeDeposit 
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}