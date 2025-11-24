/* eslint-disable react/no-unescaped-entities */
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
  const { t, language } = useMobileI18n();
  const { user, refreshUser } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositInfo, setDepositInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const predefinedAmounts = [5000, 10000, 15000, 20000];

  useEffect(() => {
    loadDepositInfo();
  }, []);

  const loadDepositInfo = async () => {
    try {
      setIsLoading(true);
      const info = await walletService.getDepositInfo();
      setDepositInfo(info);
    } catch (error) {
      console.error('Error loading deposit info:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecharge = async () => {
    const amount = selectedAmount || parseInt(customAmount);

    if (!amount || amount <= 0) {
      toast.error('Veuillez sélectionner un montant valide');
      return;
    }

    if (amount < 1000) {
      toast.error('Le montant minimum est de 1000 FCFA');
      return;
    }

    if (!user?.wallet || user.wallet.balance < amount) {
      haptics.error();
      toast.error('Solde wallet insuffisant. Rechargez d\'abord votre portefeuille.');
      return;
    }

    try {
      setIsProcessing(true);

      await walletService.rechargeDeposit(amount);
      
      haptics.success();
      toast.success(`Caution rechargée de ${amount} FCFA`);
      
      // Rafraîchir les données utilisateur
      await refreshUser();
      
      onSuccess?.();
      onBack();
      
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || 'Erreur lors de la recharge de la caution');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.containerCenter, styles.p24]}>
          <Text>Chargement...</Text>
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
          Recharger la caution
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
              {needsToRecharge ? 'Caution insuffisante' : 'Caution suffisante'}
            </Text>
          </View>
          
          <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
            <Text size="sm" color="#6b7280">Caution actuelle :</Text>
            <Text size="sm" color="#111827">{depositInfo?.currentDeposit || 0} XOF</Text>
          </View>
          
          <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
            <Text size="sm" color="#6b7280">Caution requise :</Text>
            <Text size="sm" color="#111827">{depositInfo?.requiredDeposit || 20000} XOF</Text>
          </View>
          
          {remainingAmount > 0 && (
            <View style={[styles.row, styles.spaceBetween, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' }]}>
              <Text size="sm" color="#dc2626" weight="bold">Montant manquant :</Text>
              <Text size="sm" color="#dc2626" weight="bold">{remainingAmount} XOF</Text>
            </View>
          )}
        </Card>

        {/* Wallet Balance */}
        <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
          <View style={[styles.row, styles.alignCenter, styles.gap12]}>
            <Wallet size={20} color="#16a34a" />
            <View style={styles.flex1}>
              <Text size="sm" color="#6b7280">Solde wallet disponible</Text>
              <Text variant="body" color="#16a34a" weight="bold">
                {user?.wallet?.balance || 0} XOF
              </Text>
            </View>
          </View>
        </Card>

        {/* Warning if insufficient wallet balance */}
        {user?.wallet && user.wallet.balance < remainingAmount && (
          <Card style={[styles.p16, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
            <View style={[styles.row, styles.gap12]}>
              <AlertTriangle size={20} color="#f59e0b" />
              <Text size="sm" color="#92400e">
                Votre solde wallet est insuffisant pour recharger la caution complètement. 
                Rechargez d'abord votre portefeuille.
              </Text>
            </View>
          </Card>
        )}

        {/* Quick Amounts */}
        <Card style={styles.p16}>
          <Label style={styles.mb12}>Montants rapides</Label>
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
          <Label style={styles.mb8}>Montant personnalisé</Label>
          <Input
            value={customAmount}
            onChangeText={(text) => {
              setCustomAmount(text);
              setSelectedAmount(null);
            }}
            placeholder="Saisir un montant"
            keyboardType="numeric"
            style={{ fontSize: 16 }}
          />
        </Card>

        {/* Action Buttons */}
        <View style={styles.gap12}>
          <Button 
            onPress={handleRecharge}
            disabled={isProcessing || (!selectedAmount && !customAmount) || (user?.wallet && user.wallet.balance < (selectedAmount || parseInt(customAmount) || 0))}
            fullWidth
            style={{ 
              backgroundColor: '#16a34a',
              opacity: (isProcessing || (!selectedAmount && !customAmount) || (user?.wallet && user.wallet.balance < (selectedAmount || parseInt(customAmount) || 0))) ? 0.6 : 1
            }}
          >
            <Shield size={16} color="white" />
            <Text style={styles.ml8} color="white">
              {isProcessing ? 'Recharge...' : `Recharger ${selectedAmount || customAmount || 0} XOF`}
            </Text>
          </Button>

          {(!user?.wallet || user.wallet.balance < (selectedAmount || parseInt(customAmount) || 0)) && (
            <Button 
              variant="outline"
              onPress={() => onBack()} // Devrait naviguer vers la recharge du wallet
              fullWidth
            >
              <Wallet size={16} color="#16a34a" />
              <Text style={styles.ml8} color="#16a34a">
                Recharger le portefeuille d'abord
              </Text>
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
}