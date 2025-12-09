/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { walletService } from '@/services/walletService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertTriangle, ArrowLeft, Shield, Wallet } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { useMobileAuth } from '@/lib/mobile-auth';

interface MobileRechargeDepositProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function MobileRechargeDeposit({ onBack, onSuccess }: MobileRechargeDepositProps) {
  const { t } = useMobileI18n();
  const { refreshUser } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositInfo, setDepositInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  const predefinedAmounts = [5000, 10000, 15000, 20000];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingWallet(true);
      
      const [info, balance] = await Promise.all([
        walletService.getDepositInfo(),
        walletService.getBalance()
      ]);
      
      setDepositInfo(info);
      setWalletBalance(balance.balance || 0);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
      setIsLoadingWallet(false);
    }
  };

  const handleRecharge = async () => {
    const amount = selectedAmount || parseInt(customAmount);

    if (!amount || amount <= 0) {
      toast.error(t('wallet.selectValidAmount'));
      return;
    }

    if (amount < 1000) {
      toast.error(t('wallet.minimumAmount'));
      return;
    }

    if (walletBalance < amount) {
      haptics.error();
      toast.error(t('wallet.insufficientBalance'));
      return;
    }

    try {
      setIsProcessing(true);

      await walletService.rechargeDeposit(amount);
      
      haptics.success();
      toast.success(t('wallet.depositInitiated'));
      
      await refreshUser();
      await loadData();
      
      onSuccess?.();
      onBack();
      
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('wallet.depositError'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.containerCenter, styles.p24]}>
          <Text>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  const needsToRecharge = depositInfo && !depositInfo.canUseService;
  const remainingAmount = depositInfo ? Math.max(0, depositInfo.requiredDeposit - depositInfo.currentDeposit) : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View 
        style={[
          styles.px16, 
          styles.py16, 
          styles.row, 
          styles.alignCenter,
          styles.gap16,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            haptics.light();
            onBack();
          }}
          style={[styles.p8, styles.rounded8]}
        >
          <ArrowLeft size={20} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
        </TouchableOpacity>
        <Text variant="subtitle" color="#16a34a">
          {t('wallet.rechargeDeposit')}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Status */}
        <Card style={[
          styles.p16,
          { 
            backgroundColor: needsToRecharge ? '#fef2f2' : '#f0fdf4',
            borderColor: needsToRecharge ? '#fca5a5' : '#bbf7d0'
          }
        ]}>
          <View style={[styles.row, styles.alignCenter, styles.gap12, styles.mb12]}>
            <Shield 
              size={24} 
              color={needsToRecharge ? '#dc2626' : '#16a34a'} 
            />
            <Text variant="body" color={needsToRecharge ? '#dc2626' : '#16a34a'}>
              {needsToRecharge ? t('wallet.depositInsufficient') : t('wallet.depositSufficient')}
            </Text>
          </View>
          
          <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
            <Text size="sm" color="#6b7280">{t('wallet.currentDeposit')}</Text>
            <Text size="sm" color="#111827">{depositInfo?.currentDeposit || 0} XOF</Text>
          </View>
          
          <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
            <Text size="sm" color="#6b7280">{t('wallet.requiredDeposit')}</Text>
            <Text size="sm" color="#111827">{depositInfo?.requiredDeposit || 20000} XOF</Text>
          </View>
          
          {remainingAmount > 0 && (
            <View style={[styles.row, styles.spaceBetween, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' }]}>
              <Text size="sm" color="#dc2626" weight="bold">{t('wallet.missingAmount')}</Text>
              <Text size="sm" color="#dc2626" weight="bold">{remainingAmount} XOF</Text>
            </View>
          )}
        </Card>

        {/* Wallet Balance */}
        <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
          <View style={[styles.row, styles.alignCenter, styles.gap12]}>
            <Wallet size={20} color="#16a34a" />
            <View style={styles.flex1}>
              <Text size="sm" color="#6b7280">{t('wallet.availableBalance')}</Text>
              {isLoadingWallet ? (
                <Text variant="body" color="#16a34a" weight="bold">
                  {t('common.loading')}
                </Text>
              ) : (
                <Text variant="body" color="#16a34a" weight="bold">
                  {walletBalance.toLocaleString()} XOF
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Warning if insufficient wallet balance */}
        {walletBalance < remainingAmount && (
          <Card style={[styles.p16, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
            <View style={[styles.row, styles.gap12]}>
              <AlertTriangle size={20} color="#f59e0b" />
              <Text size="sm" color="#92400e">
                {t('wallet.insufficientBalance')}
              </Text>
            </View>
          </Card>
        )}

        {/* Quick Amounts */}
        <Card style={styles.p16}>
          <Label style={styles.mb12}>{t('wallet.quickAmounts')}</Label>
          <View style={[styles.row, { flexWrap: 'wrap' }, styles.gap8]}>
            {predefinedAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                  haptics.light();
                }}
                style={[
                  styles.px16,
                  styles.py8,
                  styles.rounded8,
                  {
                    backgroundColor: selectedAmount === amount ? '#16a34a' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                    borderWidth: selectedAmount === amount ? 2 : 1,
                    borderColor: selectedAmount === amount ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
                    minWidth: 80
                  }
                ]}
              >
                <Text 
                  size="sm" 
                  color={selectedAmount === amount ? 'white' : (colorScheme === 'light' ? '#111827' : '#f9fafb')}
                  style={styles.textCenter}
                >
                  {amount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Custom Amount */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>{t('wallet.customAmount')}</Label>
          <Input
            value={customAmount}
            onChangeText={(text) => {
              setCustomAmount(text);
              setSelectedAmount(null);
            }}
            placeholder={t('wallet.enterAmount')}
            keyboardType="numeric"
            style={{ fontSize: 16 }}
          />
        </Card>

        {/* Action Buttons */}
        <View style={styles.gap12}>
          <Button 
            onPress={handleRecharge}
            disabled={isProcessing || (!selectedAmount && !customAmount) || walletBalance < (selectedAmount || parseInt(customAmount) || 0)}
            fullWidth
            style={{ 
              backgroundColor: '#16a34a',
              opacity: (isProcessing || (!selectedAmount && !customAmount) || walletBalance < (selectedAmount || parseInt(customAmount) || 0)) ? 0.6 : 1
            }}
          >
            <View style={[styles.row, styles.gap8, styles.alignCenter]}>
              <Shield size={16} color="white" />
              <Text style={styles.ml8} color="white">
                {isProcessing ? t('wallet.recharging') : `${t('wallet.rechargeAmount')} ${(selectedAmount || customAmount || 0).toLocaleString()} XOF`}
              </Text>
            </View>
          </Button>

          {(walletBalance < (selectedAmount || parseInt(customAmount) || 0)) && (
            <Button 
              variant="outline"
              onPress={() => onBack()}
              fullWidth
            >
              <View style={[styles.row, styles.gap8]}>
                <Wallet size={16} color="#16a34a" />
                <Text style={styles.ml8} color="#16a34a">
                  {t('wallet.topUpWalletFirst')}
                </Text>
              </View>
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
}