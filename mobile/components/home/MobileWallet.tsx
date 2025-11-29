/* eslint-disable react-hooks/exhaustive-deps */
import { ArrowDownLeft, ArrowUpRight, Clock, CreditCard, Plus, Wallet } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Modal, ScrollView, TextInput, TouchableOpacity, View, RefreshControl } from 'react-native';
import { toast } from 'sonner';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { walletService, type Transaction, type WalletBalance } from '@/services/walletService';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface MobileWalletProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export function MobileWallet({ onBack, onNavigate }: MobileWalletProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'orange-money' | 'mobile-money' | 'cash'>('orange-money');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [editingCashRequest, setEditingCashRequest] = useState<string | null>(null);
  const [newCashAmount, setNewCashAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadWalletData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(1, 10)
      ]);

      setWalletBalance(balanceData);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setError(error instanceof Error ? error.message : 'unknown_error');
      toast.error(t('wallet.loadingWalletData'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [language, t]);

  const onRefresh = useCallback(() => {
    loadWalletData(true);
  }, [loadWalletData]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleTopUp = async () => {
    const amount = selectedAmount || parseInt(customAmount);

    if (!amount || amount <= 0) {
      toast.error(t('wallet.selectValidAmount'));
      return;
    }

    if (amount < 500) {
      toast.error(t('wallet.minimumAmount'));
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'cash') {
        await handleCashTopUp();
        return;
      }

      const paymentMethodMap = {
        'orange-money': 'ORANGE_MONEY',
        'mobile-money': 'MOMO',
        'cash': 'CASH'
      };

      await walletService.initiateDeposit({
        amount: Math.round(amount),
        paymentMethod: paymentMethodMap[paymentMethod],
        currency: 'XOF'
      });

      toast.success(t('wallet.depositInitiated'));
      loadWalletData();
      setShowTopUpDialog(false);
      setSelectedAmount(null);
      setCustomAmount('');
    } catch (error) {
      console.error('Error initiating deposit:', error);
      const errorMessage = error instanceof Error ? error.message : 'unknown_error';
      
      if (errorMessage === 'invalid_amount') {
        toast.error(t('wallet.invalidAmountFormat'));
      } else if (errorMessage === 'network_error') {
        toast.error(t('common.networkError'));
      } else {
        toast.error(t('wallet.depositError'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashTopUp = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    
    if (!amount || amount <= 0) {
      toast.error(t('wallet.selectValidAmount'));
      return;
    }
    
    if (amount < 500) {
      toast.error(t('wallet.minimumCashAmount'));
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await walletService.requestCashDeposit({
        amount: Math.round(amount),
        description: 'Demande de recharge en espèces'
      });
      
      toast.success(t('wallet.cashRequestSuccess'));
      loadWalletData();
      setShowTopUpDialog(false);
      setSelectedAmount(null);
      setCustomAmount('');
    } catch (error) {
      console.error('Error requesting cash deposit:', error);
      const errorMessage = error instanceof Error ? error.message : 'unknown_error';
      
      if (errorMessage === 'invalid_amount') {
        toast.error(t('wallet.invalidCashAmount'));
      } else {
        toast.error(t('wallet.cashRequestError'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCashRequest = async (transactionId: string) => {
    const amount = parseInt(newCashAmount);
    
    if (!amount || amount < 500) {
      toast.error(t('wallet.minimumCashAmount'));
      return;
    }
    
    try {
      await walletService.updateCashDepositRequest(transactionId, Math.round(amount));
      toast.success(t('wallet.cashRequestModified'));
      setEditingCashRequest(null);
      setNewCashAmount('');
      loadWalletData();
    } catch (error) {
      console.error('Error updating cash request:', error);
      toast.error(t('wallet.cashModifyError'));
    }
  };

  const handleCancelCashRequest = async (transactionId: string) => {
    try {
      await walletService.cancelCashDepositRequest(transactionId);
      toast.success(t('wallet.cashRequestCancelled'));
      loadWalletData();
    } catch (error) {
      console.error('Error cancelling cash request:', error);
      toast.error(t('wallet.cashCancelError'));
    }
  };

  const canModifyTransaction = (transaction: Transaction) => {
    return transaction.type === 'DEPOSIT' && 
          transaction.status === 'PENDING' && 
          transaction.paymentMethod === 'CASH' && 
          (transaction as any).canModify !== false;
  };

  const getCashStatusLabel = (transaction: Transaction) => {
    if (transaction.paymentMethod === 'CASH') {
      switch (transaction.status) {
        case 'PENDING':
          return t('wallet.pendingValidation');
        case 'COMPLETED':
          return t('wallet.validated');
        case 'FAILED':
          return t('wallet.rejected');
        case 'CANCELLED':
          return t('wallet.status.cancelled');
        default:
          return getStatusLabel(transaction.status);
      }
    }
    return getStatusLabel(transaction.status);
  };

  const getPaymentIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'DEPOSIT':
      case 'REFUND':
      case 'RIDE_PAYMENT':
        return <ArrowDownLeft size={20} color="#dc2626" />;
      default:
        return <ArrowUpRight size={20} color="#2563eb" />;
    }
  };

  const getPaymentTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return t('wallet.transaction.deposit');
      case 'RIDE_PAYMENT':
        return t('wallet.transaction.ridePayment');
      case 'REFUND':
        return t('wallet.transaction.refund');
      default:
        return type;
    }
  };

  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return t('wallet.status.completed');
      case 'PENDING':
        return t('wallet.status.pending');
      case 'FAILED':
        return t('wallet.status.failed');
      case 'CANCELLED':
        return t('wallet.status.cancelled');
      default:
        return status;
    }
  };

  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'FAILED':
        return 'destructive';
      case 'CANCELLED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <MobileHeader 
          title={t('wallet.title')} 
          showBack 
          onBack={onBack}
          showNotifications
          notificationCount={2}
          onNotifications={() => onNavigate?.('notifications')}
        />
        <View style={[styles.containerCenter, styles.p24]}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={[styles.mt16]}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error && !walletBalance) {
    return (
      <View style={styles.container}>
        <MobileHeader 
          title={t('wallet.title')} 
          showBack 
          onBack={onBack}
          showNotifications
          notificationCount={2}
          onNotifications={() => onNavigate?.('notifications')}
        />
        <View style={[styles.containerCenter, styles.p24]}>
          <Text style={[styles.mb16, styles.textCenter]}>{t('wallet.loadError')}</Text>
          <Button onPress={() => loadWalletData()}>
            {t('common.retry')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MobileHeader 
        title={t('wallet.title')} 
        showBack 
        onBack={onBack}
        showNotifications
        notificationCount={2}
        onNotifications={() => onNavigate?.('notifications')}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }
      >
        <View style={[styles.p16, styles.gap24]}>
          {/* Balance Card */}
          <Card style={[styles.p24, { backgroundColor: '#16a34a' }]}>
            <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb16]}>
              <Wallet size={20} color="white" />
              <Text style={{ color: 'white', opacity: 0.9 }}>{t('wallet.balance')}</Text>
            </View>
            <Text style={[styles.mb24, { color: 'white', fontSize: 36, fontWeight: 'bold' }]}>
              {(walletBalance?.balance || 0).toLocaleString()} 
              <Text style={{ fontSize: 20 }}> {walletBalance?.currency || 'XOF'}</Text>
            </Text>
            <Button
              variant="secondary"
              onPress={() => setShowTopUpDialog(true)}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <Plus size={20} color="#16a34a" />
              <Text style={{ color: 'white', marginLeft: 8 }}>{t('wallet.topUp')}</Text>
            </Button>
          </Card>

          {/* Quick Actions */}
          <View style={[styles.row, styles.gap12]}>
            <TouchableOpacity style={[styles.flex1]}>
              <Card style={[styles.p16, styles.alignCenter]}>
                <CreditCard size={32} color="#2563eb" style={styles.mb8} />
                <Text size="sm">{t('wallet.myCards')}</Text>
              </Card>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.flex1]}>
              <Card style={[styles.p16, styles.alignCenter]}>
                <Clock size={32} color="#7c3aed" style={styles.mb8} />
                <Text size="sm">{t('wallet.history')}</Text>
              </Card>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions */}
          <View>
            <Text size="lg" weight="semibold" style={styles.mb16}>{t('wallet.recentTransactions')}</Text>
            
            {transactions.length === 0 ? (
              <Card style={[styles.p24, styles.alignCenter]}>
                <Text size="sm" color="muted">{t('wallet.noTransactions')}</Text>
              </Card>
            ) : (
              <View style={styles.gap12}>
                {transactions.map((transaction) => (
                  <Card key={transaction.id} style={styles.p16}>
                    <View style={[styles.row, styles.alignStart, styles.gap12]}>
                      <View style={[styles.w40, styles.h40, styles.rounded20, styles.alignCenter, styles.justifyCenter, { backgroundColor: '#f3f4f6' }]}>
                        {getPaymentIcon(transaction)}
                      </View>
                      
                      <View style={styles.flex1}>
                        <Text weight="medium" style={styles.mb4}>
                          {getPaymentTypeLabel(transaction.type)}
                          {transaction.paymentMethod === 'CASH' && ` (${t('wallet.cashPayment')})`}
                        </Text>
                        <Text size="sm" color="muted" style={styles.mb8}>
                          {new Date(transaction.createdAt).toLocaleDateString(
                            language === 'fr' ? 'fr-FR' : 'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </Text>
                        
                        {/* Statut spécifique pour les paiements en espèces */}
                        {transaction.paymentMethod === 'CASH' && (
                          <Text size="sm" style={[
                            transaction.status === 'PENDING' && { color: '#d97706' },
                            transaction.status === 'COMPLETED' && { color: '#059669' },
                            transaction.status === 'FAILED' && { color: '#dc2626' },
                          ]}>
                            {getCashStatusLabel(transaction)}
                          </Text>
                        )}
                      </View>

                      <View style={[styles.alignEnd]}>
                        <Text 
                          weight="semibold" 
                          style={[
                            styles.mb4,
                            ['WITHDRAWAL', 'RIDE_PAYMENT'].includes(transaction.type) 
                              ? { color: '#dc2626' } 
                              : { color: '#16a34a' }
                          ]}
                        >
                          {['WITHDRAWAL', 'RIDE_PAYMENT'].includes(transaction.type) ? '-' : '+'}
                          {transaction.amount} {transaction.currency}
                        </Text>
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </View>
                    </View>

                    {/* Actions pour les demandes en espèces en attente */}
                    {canModifyTransaction(transaction) && (
                      <View style={[styles.flex1, styles.row, styles.gap8, styles.mt12]}>
                        <Button
                          variant="primary"
                          size="sm"
                          style={{
                            width: '50%'
                          }}
                          onPress={() => {
                            setEditingCashRequest(transaction.id);
                            setNewCashAmount(transaction.amount.toString());
                          }}
                        >
                          {t('wallet.modify')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          style={{
                            width: '50%'
                          }}
                          onPress={() => handleCancelCashRequest(transaction.id)}
                        >
                          {t('common.cancel')}
                        </Button>
                      </View>
                    )}

                    {/* Modal de modification pour les demandes en espèces */}
                    {editingCashRequest === transaction.id && (
                      <Card style={[styles.mt12, styles.p12, { backgroundColor: '#f8fafc' }]}>
                        <Text weight="medium" style={styles.mb8}>{t('wallet.modifyAmount')}</Text>
                        <TextInput
                          style={[styles.input, styles.mb12]}
                          value={newCashAmount}
                          onChangeText={setNewCashAmount}
                          keyboardType="numeric"
                          placeholder={t('wallet.newAmount')}
                        />
                        <View style={[styles.row, styles.gap8, styles.justifyEnd]}>
                          <Button
                            variant="secondary"
                            size="sm"
                            style={{
                              width: '49%'
                            }}
                            onPress={() => setEditingCashRequest(null)}
                          >
                            {t('common.cancel')}
                          </Button>
                          <Button
                            size="sm"
                            style={{
                              width: '49%'
                            }}
                            onPress={() => handleUpdateCashRequest(transaction.id)}
                          >
                            {t('common.confirm')}
                          </Button>
                        </View>
                      </Card>
                    )}

                    {transaction.description && (
                      <Text size="sm" color="muted" style={styles.mt8}>
                        {transaction.description}
                      </Text>
                    )}
                  </Card>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Top Up Dialog */}
      <Modal
        visible={showTopUpDialog}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTopUpDialog(false)}
      >
        <View style={[styles.containerCenter, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <Card style={[styles.m24, styles.p24, { maxWidth: 400, width: '90%' }]}>
            <Text size="xl" weight="semibold" style={styles.mb8}>{t('wallet.topUp')}</Text>
            <Text size="sm" color="muted" style={styles.mb24}>
              {t('wallet.selectAmountToTopUp')}
            </Text>

            <View style={styles.gap24}>
              <View>
                <Text weight="medium" style={styles.mb8}>{t('wallet.customAmount')}</Text>
                <TextInput
                  style={styles.input}
                  value={customAmount}
                  onChangeText={(text) => {
                    setCustomAmount(text);
                    setSelectedAmount(null);
                  }}
                  placeholder="500"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Payment Method */}
              <View>
                <Text weight="medium" style={styles.mb8}>{t('wallet.paymentMethod')}</Text>
                <View style={styles.gap12}>
                  <TouchableOpacity
                    style={[
                      styles.row,
                      styles.alignCenter,
                      styles.gap12,
                      styles.p16,
                      styles.rounded8,
                      { 
                        borderWidth: 1,
                        borderColor: paymentMethod === 'orange-money' ? '#16a34a' : '#d1d5db',
                        backgroundColor: paymentMethod === 'orange-money' ? '#f0fdf4' : 'transparent'
                      }
                    ]}
                    onPress={() => setPaymentMethod('orange-money')}
                  >
                    <View style={[
                      styles.w20,
                      styles.h20,
                      styles.rounded8,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { 
                        borderWidth: 2,
                        borderColor: paymentMethod === 'orange-money' ? '#16a34a' : '#d1d5db'
                      }
                    ]}>
                      {paymentMethod === 'orange-money' && (
                        <View style={[styles.w8, styles.h8, styles.rounded4, { backgroundColor: '#16a34a' }]} />
                      )}
                    </View>
                    <Text>{t('wallet.orangeMoney')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.row,
                      styles.alignCenter,
                      styles.gap12,
                      styles.p16,
                      styles.rounded8,
                      { 
                        borderWidth: 1,
                        borderColor: paymentMethod === 'mobile-money' ? '#16a34a' : '#d1d5db',
                        backgroundColor: paymentMethod === 'mobile-money' ? '#f0fdf4' : 'transparent'
                      }
                    ]}
                    onPress={() => setPaymentMethod('mobile-money')}
                  >
                    <View style={[
                      styles.w20,
                      styles.h20,
                      styles.rounded8,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { 
                        borderWidth: 2,
                        borderColor: paymentMethod === 'mobile-money' ? '#16a34a' : '#d1d5db'
                      }
                    ]}>
                      {paymentMethod === 'mobile-money' && (
                        <View style={[styles.w8, styles.h8, styles.rounded4, { backgroundColor: '#16a34a' }]} />
                      )}
                    </View>
                    <Text>{t('wallet.mobileMoney')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.row,
                      styles.alignCenter,
                      styles.gap12,
                      styles.p16,
                      styles.rounded8,
                      { 
                        borderWidth: 1,
                        borderColor: paymentMethod === 'cash' ? '#16a34a' : '#d1d5db',
                        backgroundColor: paymentMethod === 'cash' ? '#f0fdf4' : 'transparent'
                      }
                    ]}
                    onPress={() => setPaymentMethod('cash')}
                  >
                    <View style={[
                      styles.w20,
                      styles.h20,
                      styles.rounded8,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { 
                        borderWidth: 2,
                        borderColor: paymentMethod === 'cash' ? '#16a34a' : '#d1d5db'
                      }
                    ]}>
                      {paymentMethod === 'cash' && (
                        <View style={[styles.w8, styles.h8, styles.rounded4, { backgroundColor: '#16a34a' }]} />
                      )}
                    </View>
                    <Text>{t('wallet.cashPayment')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={[styles.row, styles.gap12, styles.mt24]}>
              <Button
                variant="secondary"
                style={styles.flex1}
                onPress={() => setShowTopUpDialog(false)}
                disabled={isProcessing}
              >
                {t('common.cancel')}
              </Button>
              
              <Button
                style={styles.flex1}
                onPress={handleTopUp}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  t('wallet.confirm')
                )}
              </Button>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}