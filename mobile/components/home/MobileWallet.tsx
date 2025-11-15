import { ArrowDownLeft, ArrowUpRight, Clock, CreditCard, Plus, Wallet } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, RefreshControl } from 'react-native';
import { toast } from 'sonner';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { walletService, type Transaction, type WalletBalance } from '@/services/walletService';
import { MobileHeader } from '@/components/layout/MobileHeader';

interface MobileWalletProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export function MobileWallet({ onBack, onNavigate }: MobileWalletProps) {
  const { t, language } = useMobileI18n();
  const { user } = useMobileAuth();
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'orange-money' | 'mobile-money'>('orange-money');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const predefinedAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

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
      
      const errorMessage = language === 'fr' 
        ? 'Erreur lors du chargement des données du portefeuille'
        : 'Error loading wallet data';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [language]);

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
      const paymentMethodMap = {
        'orange-money': 'ORANGE_MONEY',
        'mobile-money': 'MOMO'
      };

      const result = await walletService.initiateDeposit({
        amount,
        paymentMethod: paymentMethodMap[paymentMethod],
        currency: 'XOF'
      });

      toast.success(t('wallet.depositInitiated'));

      // Rafraîchir les données du portefeuille
      loadWalletData();

      setShowTopUpDialog(false);
      setSelectedAmount(null);
      setCustomAmount('');
    } catch (error) {
      console.error('Error initiating deposit:', error);
      const errorMessage = error instanceof Error ? error.message : 'unknown_error';
      
      if (errorMessage === 'invalid_amount') {
        toast.error(t('wallet.invalidAmount'));
      } else if (errorMessage === 'network_error') {
        toast.error(t('common.networkError'));
      } else {
        toast.error(t('wallet.depositError'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
      case 'refund':
      case 'bonus':
        return <ArrowUpRight size={20} color="#16a34a" />;
      case 'withdrawal':
      case 'ride_payment':
        return <ArrowDownLeft size={20} color="#dc2626" />;
      default:
        return <ArrowUpRight size={20} color="#2563eb" />;
    }
  };

  const getPaymentTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return t('wallet.transaction.deposit');
      case 'withdrawal':
        return t('wallet.transaction.withdrawal');
      case 'ride_payment':
        return t('wallet.transaction.ridePayment');
      case 'refund':
        return t('wallet.transaction.refund');
      case 'bonus':
        return t('wallet.transaction.bonus');
      default:
        return type;
    }
  };

  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return t('wallet.status.completed');
      case 'pending':
        return t('wallet.status.pending');
      case 'failed':
        return t('wallet.status.failed');
      case 'cancelled':
        return t('wallet.status.cancelled');
      default:
        return status;
    }
  };

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return styles.completedBadge;
      case 'pending':
        return styles.pendingBadge;
      case 'failed':
        return styles.failedBadge;
      case 'cancelled':
        return styles.cancelledBadge;
      default:
        return styles.pendingBadge;
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('wallet.loadError')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadWalletData()}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
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
        <View style={styles.content}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Wallet size={20} color="white" />
              <Text style={styles.balanceLabel}>{t('wallet.balance')}</Text>
            </View>
            <Text style={styles.balanceAmount}>
              {(walletBalance?.balance || 0).toLocaleString()} 
              <Text style={styles.currency}> {walletBalance?.currency || 'XOF'}</Text>
            </Text>
            <TouchableOpacity
              style={styles.topUpButton}
              onPress={() => setShowTopUpDialog(true)}
            >
              <Plus size={20} color="#16a34a" />
              <Text style={styles.topUpButtonText}>{t('wallet.topUp')}</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <CreditCard size={32} color="#2563eb" />
              </View>
              <Text style={styles.quickActionText}>{t('wallet.myCards')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Clock size={32} color="#7c3aed" />
              </View>
              <Text style={styles.quickActionText}>{t('wallet.history')}</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>{t('wallet.recentTransactions')}</Text>
            
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>{t('wallet.noTransactions')}</Text>
              </View>
            ) : (
              <View style={styles.transactionsList}>
                {transactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionCard}>
                    <View style={styles.transactionHeader}>
                      <View style={styles.transactionIcon}>
                        {getPaymentIcon(transaction)}
                      </View>
                      
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionType}>
                          {getPaymentTypeLabel(transaction.type)}
                        </Text>
                        <Text style={styles.transactionDate}>
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
                      </View>

                      <View style={styles.transactionAmount}>
                        <Text style={[
                          styles.amountText,
                          ['withdrawal', 'ride_payment'].includes(transaction.type) 
                            ? styles.negativeAmount 
                            : styles.positiveAmount
                        ]}>
                          {['withdrawal', 'ride_payment'].includes(transaction.type) ? '-' : '+'}
                          {transaction.amount} {transaction.currency}
                        </Text>
                        <View style={[
                          styles.statusBadge,
                          getStatusStyle(transaction.status)
                        ]}>
                          <Text style={[
                            styles.statusText,
                            transaction.status === 'pending' && styles.pendingStatusText
                          ]}>
                            {getStatusLabel(transaction.status)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {transaction.description && (
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                    )}
                  </View>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('wallet.topUp')}</Text>
            <Text style={styles.modalDescription}>
              {t('wallet.selectAmountToTopUp')}
            </Text>

            <View style={styles.modalBody}>
              {/* Predefined Amounts */}
              <View style={styles.amountsSection}>
                <Text style={styles.sectionLabel}>{t('wallet.selectAmount')}</Text>
                <View style={styles.amountsGrid}>
                  {predefinedAmounts.map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.amountButton,
                        selectedAmount === amount && styles.amountButtonSelected
                      ]}
                      onPress={() => {
                        setSelectedAmount(amount);
                        setCustomAmount('');
                      }}
                    >
                      <Text style={[
                        styles.amountButtonText,
                        selectedAmount === amount && styles.amountButtonTextSelected
                      ]}>
                        {amount.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Custom Amount */}
              <View style={styles.customAmountSection}>
                <Text style={styles.sectionLabel}>{t('wallet.customAmount')}</Text>
                <TextInput
                  style={styles.customAmountInput}
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
              <View style={styles.paymentMethodSection}>
                <Text style={styles.sectionLabel}>{t('wallet.paymentMethod')}</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      paymentMethod === 'orange-money' && styles.radioOptionSelected
                    ]}
                    onPress={() => setPaymentMethod('orange-money')}
                  >
                    <View style={styles.radioCircle}>
                      {paymentMethod === 'orange-money' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>{t('wallet.orangeMoney')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      paymentMethod === 'mobile-money' && styles.radioOptionSelected
                    ]}
                    onPress={() => setPaymentMethod('mobile-money')}
                  >
                    <View style={styles.radioCircle}>
                      {paymentMethod === 'mobile-money' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>{t('wallet.mobileMoney')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowTopUpDialog(false)}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isProcessing && styles.confirmButtonDisabled
                ]}
                onPress={handleTopUp}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>{t('wallet.confirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  currency: {
    fontSize: 20,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  topUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  positiveAmount: {
    color: '#16a34a',
  },
  negativeAmount: {
    color: '#dc2626',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#16a34a',
  },
  pendingBadge: {
    backgroundColor: '#f3f4f6',
  },
  failedBadge: {
    backgroundColor: '#dc2626',
  },
  cancelledBadge: {
    backgroundColor: '#6b7280',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  pendingStatusText: {
    color: '#6b7280',
  },
  transactionDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  modalBody: {
    gap: 24,
  },
  amountsSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  amountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amountButton: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  amountButtonSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  amountButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  amountButtonTextSelected: {
    color: 'white',
  },
  customAmountSection: {
    gap: 8,
  },
  customAmountInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  paymentMethodSection: {
    gap: 8,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  radioOptionSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16a34a',
  },
  radioLabel: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});