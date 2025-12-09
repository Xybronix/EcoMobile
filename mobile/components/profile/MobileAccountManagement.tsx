/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { walletService } from '@/services/walletService';
import { incidentService } from '@/services/incidentService';
import { bikeRequestService } from '@/services/bikeRequestService';
import { Wallet, CreditCard, Clock, Shield, AlertTriangle, ArrowLeft, Lock, Unlock, FileText } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileAccountManagementProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  initialTab?: string;
}

export function MobileAccountManagement({ onBack, onNavigate, initialTab = 'overview' }: MobileAccountManagementProps) {
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'requests' | 'incidents'>(initialTab as any);
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<any[]>([]);
  const [lockRequests, setLockRequests] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [depositInfo, setDepositInfo] = useState<any>(null);
  
  // Filtres
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadAccountData();
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab]);

  const loadAccountData = async () => {
    try {
      setIsLoading(true);
      
      const [wallet, depositData, userTransactions, userIncidents] = await Promise.all([
        walletService.getBalance(),
        walletService.getDepositInfo(),
        walletService.getTransactions(1, 50),
        incidentService.getIncidents(1, 50)
      ]);

      setWalletData(wallet);
      setDepositInfo(depositData);
      setTransactions(userTransactions.transactions || []);
      setIncidents(userIncidents.incidents || []);

      try {
        const subscription = await walletService.getCurrentSubscription();
        setCurrentSubscription(subscription);
      } catch (subscriptionError) {
        console.log('No active subscription found');
        setCurrentSubscription(null);
      }
      
    } catch (error) {
      console.error('Error loading account data:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const [unlockReqs, lockReqs] = await Promise.all([
        bikeRequestService.getUserUnlockRequests(1, 50),
        bikeRequestService.getUserLockRequests(1, 50)
      ]);
      
      setUnlockRequests(unlockReqs.data || []);
      setLockRequests(lockReqs.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error(t('common.error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': case 'APPROVED': case 'RESOLVED': case 'CLOSED': return '#16a34a';
      case 'PENDING': case 'OPEN': return '#f59e0b';
      case 'FAILED': case 'REJECTED': return '#dc2626';
      case 'IN_PROGRESS': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'COMPLETED': t('status.completed'),
      'PENDING': t('status.pending'),
      'FAILED': t('status.failed'),
      'APPROVED': t('status.approved'),
      'REJECTED': t('status.rejected'),
      'CANCELLED': t('status.cancelled'),
      'OPEN': t('status.open'),
      'IN_PROGRESS': t('status.in_progress'),
      'RESOLVED': t('status.resolved'),
      'CLOSED': t('status.closed')
    };
    return statusMap[status] || status;
  };

  const getTransactionTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'DEPOSIT': t('transaction.deposit'),
      'RIDE_PAYMENT': t('transaction.ridePayment'),
      'REFUND': t('transaction.refund'),
      'DEPOSIT_RECHARGE': t('transaction.depositRecharge'),
      'DAMAGE_CHARGE': t('transaction.damageCharge'),
      'SUBSCRIPTION_PAYMENT': t('transaction.subscriptionPayment')
    };
    return typeMap[type] || type;
  };

  const getIncidentTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'brakes': t('incident.brakes'),
      'battery': t('incident.battery'),
      'tire': t('incident.tire'),
      'chain': t('incident.chain'),
      'lights': t('incident.lights'),
      'lock': t('incident.lock'),
      'electronics': t('incident.electronics'),
      'physical_damage': t('incident.physicalDamage'),
      'theft': t('incident.theft'),
      'other': t('incident.other')
    };
    return typeMap[type] || type;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (transactionFilter !== 'all' && transaction.type !== transactionFilter) return false;
    
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return transactionDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return transactionDate >= monthAgo;
      }
    }
    
    return true;
  });

  const renderOverview = () => (
    <View style={styles.gap16}>
      {/* Current Subscription */}
      {currentSubscription ? (
        <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
          <Text variant="body" color="#111827" style={styles.mb8}>
            {t('accountManagement.currentSubscription')}
          </Text>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
            <View>
              <Text variant="body" color="#16a34a" weight="bold">
                {currentSubscription.planName} - {currentSubscription.packageType}
              </Text>
              <Text size="sm" color="#6b7280">
                {`${t('accountManagement.expiresOn')}: ${ new Date(currentSubscription.endDate).toLocaleDateString() }`}
              </Text>
              {currentSubscription.bikeCode && (
                <Text size="sm" color="#16a34a" style={styles.mt4}>
                  {`${t('accountManagement.reservedBike')}: ${ currentSubscription.bikeCode }`}
                </Text>
              )}
            </View>
            <View style={styles.alignEnd}>
              <Text size="sm" color="#16a34a" weight="bold">
                {currentSubscription.remainingDays}
              </Text>
              <Text size="xs" color="#6b7280">
                {`${t('accountManagement.daysRemaining')}: ${ currentSubscription.remainingDays }`}
              </Text>
            </View>
          </View>
        </Card>
      ) : (
        <Card style={[styles.p16, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}>
          <Text variant="body" color="#111827" style={styles.mb8}>
            {t('accountManagement.noActivePlan')}
          </Text>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
            <View style={styles.flex1}>
              <Text size="sm" color="#6b7280" style={styles.mb4}>
                {t('accountManagement.subscribeDescription')}
              </Text>
            </View>
            <Button
              variant="primary"
              size="sm"
              onPress={() => onNavigate('subscription-plans')}
            >
              <Text>{t('accountManagement.subscribe')}</Text>
            </Button>
          </View>
        </Card>
      )}

      {/* Wallet Overview */}
      <View style={[styles.row, styles.gap12]}>
        <Card style={[styles.flex1, styles.p16, styles.alignCenter]}>
          <Wallet size={24} color="#16a34a" style={styles.mb8} />
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
            {t('accountManagement.walletBalance')}
          </Text>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} weight="bold">
            {walletData?.balance || 0} XOF
          </Text>
        </Card>
        
        <Card style={[styles.flex1, styles.p16, styles.alignCenter]}>
          <Shield size={24} color="#3b82f6" style={styles.mb8} />
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
            {t('accountManagement.deposit')}
          </Text>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} weight="bold">
            {depositInfo?.currentDeposit || 0} XOF
          </Text>
        </Card>
      </View>

      {/* Deposit Warning */}
      {depositInfo && !depositInfo.canUseService && (
        <Card style={[styles.p16, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
          <View style={[styles.row, styles.gap12]}>
            <AlertTriangle size={20} color="#f59e0b" />
            <View style={styles.flex1}>
              <Text size="sm" color="#92400e" weight="bold">
                {t('accountManagement.serviceBlocked')}
              </Text>
              <Text size="sm" color="#92400e" style={styles.mt4}>
                {`${t('accountManagement.requiredMinimum')} ${ depositInfo.requiredDeposit }`}
                {'\n'}{`${t('accountManagement.currentAmount')} ${ depositInfo.currentDeposit }`}
                {'\n'}{`${t('accountManagement.missingAmount')} ${ depositInfo.requiredDeposit - depositInfo.currentDeposit }`}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => onNavigate('recharge-deposit')}
                style={[styles.mt8, { borderColor: '#f59e0b' }]}
              >
                <Text color="#f59e0b">{t('accountManagement.rechargeDeposit')}</Text>
              </Button>
            </View>
          </View>
        </Card>
      )}

      {/* Negative Balance Warning */}
      {depositInfo?.negativeBalance > 0 && (
        <Card style={[styles.p16, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
          <View style={[styles.row, styles.gap12]}>
            <AlertTriangle size={20} color="#dc2626" />
            <View style={styles.flex1}>
              <Text size="sm" color="#991b1b" weight="bold">
                {`${t('accountManagement.negativeBalance')} ${ depositInfo.negativeBalance }`}
              </Text>
              <Text size="xs" color="#991b1b" style={styles.mt4}>
                {t('wallet.insufficientBalance')}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={[styles.column, styles.gap12]}>
        <View style={[styles.row, styles.gap12]}>
          <Button
            variant="outline"
            onPress={() => onNavigate('wallet-topup')}
            style={[styles.flex1, styles.row]}
          >
            <View style={[styles.row, styles.gap4, styles.alignCenter, styles.justifyCenter]}>
              <CreditCard size={18} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
              <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {t('accountManagement.rechargeWallet')}
              </Text>
            </View>
          </Button>
          <Button
            variant="outline"
            onPress={() => onNavigate('recharge-deposit')}
            style={[styles.flex1, styles.row]}
          >
            <View style={[styles.row, styles.gap4, styles.alignCenter, styles.justifyCenter]}>
              <Shield size={18} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
              <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {t('accountManagement.deposit')}
              </Text>
            </View>
          </Button>
        </View>
        <Button
          variant="outline"
          onPress={() => onNavigate('create-incident')}
          style={[styles.row]}
        >
          <View style={[styles.row, styles.gap4, styles.alignCenter, styles.justifyCenter]}>
            <AlertTriangle size={18} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
            <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {t('accountManagement.reportProblem')}
            </Text>
          </View>
        </Button>
      </View>
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.gap16}>
      {/* Filters */}
      <Card style={styles.p16}>
        <View style={[styles.row, styles.gap12]}>
          <View style={styles.flex1}>
            <Label style={styles.mb8}>{t('accountManagement.filters.type')}</Label>
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('accountManagement.filters.all')}</SelectItem>
                <SelectItem value="DEPOSIT">{t('accountManagement.filters.deposits')}</SelectItem>
                <SelectItem value="RIDE_PAYMENT">{t('accountManagement.filters.ridePayments')}</SelectItem>
                <SelectItem value="REFUND">{t('accountManagement.filters.refunds')}</SelectItem>
                <SelectItem value="DEPOSIT_RECHARGE">{t('accountManagement.filters.depositRecharge')}</SelectItem>
                <SelectItem value="DAMAGE_CHARGE">{t('accountManagement.filters.damageCharges')}</SelectItem>
                <SelectItem value="SUBSCRIPTION_PAYMENT">{t('accountManagement.filters.subscriptionPayments')}</SelectItem>
              </SelectContent>
            </Select>
          </View>
          <View style={styles.flex1}>
            <Label style={styles.mb8}>{t('accountManagement.filters.period')}</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('accountManagement.filters.all')}</SelectItem>
                <SelectItem value="today">{t('accountManagement.filters.today')}</SelectItem>
                <SelectItem value="week">{t('accountManagement.filters.week')}</SelectItem>
                <SelectItem value="month">{t('accountManagement.filters.month')}</SelectItem>
              </SelectContent>
            </Select>
          </View>
        </View>
      </Card>

      {/* Transactions List */}
      <View style={styles.gap12}>
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id} style={styles.p16}>
            <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb8]}>
              <View>
                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                  {getTransactionTypeText(transaction.type)}
                </Text>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {new Date(transaction.createdAt).toLocaleString()}
                </Text>
                {transaction.metadata?.appliedRule && (
                  <Text size="xs" color="#16a34a" style={styles.mt4}>
                    {transaction.metadata.appliedRule}
                  </Text>
                )}
              </View>
              <View style={styles.alignEnd}>
                <Text 
                  variant="body" 
                  color={['RIDE_PAYMENT', 'DAMAGE_CHARGE', 'SUBSCRIPTION_PAYMENT'].includes(transaction.type) ? '#dc2626' : '#16a34a'}
                  weight="bold"
                >
                  {['RIDE_PAYMENT', 'DAMAGE_CHARGE', 'SUBSCRIPTION_PAYMENT'].includes(transaction.type) ? '-' : '+'}
                  {transaction.amount} XOF
                </Text>
                <Text 
                  size="xs" 
                  color={getStatusColor(transaction.status)}
                  style={{ marginTop: 4 }}
                >
                  {getStatusText(transaction.status)}
                </Text>
              </View>
            </View>
            
            {transaction.metadata?.discountApplied > 0 && (
              <Text size="xs" color="#16a34a" style={styles.mb4}>
                💰 {`${t('accountManagement.savings')}: ${ transaction.metadata.discountApplied }`}
              </Text>
            )}
          </Card>
        ))}
        
        {filteredTransactions.length === 0 && (
          <Card style={[styles.p32, styles.alignCenter]}>
            <FileText size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} style={styles.mb8} />
            <Text color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
              {t('accountManagement.noTransactions')}
            </Text>
          </Card>
        )}
      </View>
    </View>
  );

  const renderRequests = () => (
    <View style={styles.gap16}>
      <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
        {t('accountManagement.tabs.requests')}
      </Text>
      
      {/* Unlock Requests */}
      {unlockRequests.length > 0 && (
        <View style={styles.gap12}>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
            🔓 {`${t('accountManagement.unlockRequests')}: ${ unlockRequests.length }`}
          </Text>
          {unlockRequests.map((request) => (
            <Card key={request.id} style={styles.p16}>
              <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                <View style={[styles.row, styles.alignCenter, styles.gap12]}>
                  <Unlock size={20} color={getStatusColor(request.status)} />
                  <View>
                    <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                      {`${t('accountManagement.unlockRequests')}: ${ 1 }`} - {request.bike?.code || t('common.bike')}
                    </Text>
                    <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                      {new Date(request.requestedAt || request.createdAt).toLocaleString()}
                    </Text>
                    {request.adminNote && (
                      <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mt4}>
                        {`${t('accountManagement.adminNote')}: ${(request.adminNote)}`}
                      </Text>
                    )}
                    {request.rejectionReason && (
                      <Text size="xs" color="#dc2626" style={styles.mt4}>
                        {`${t('accountManagement.rejectionReason')}: ${ request.rejectionReason }`}
                      </Text>
                    )}
                  </View>
                </View>
                <Text 
                  size="xs" 
                  color={getStatusColor(request.status)}
                  weight="bold"
                >
                  {getStatusText(request.status)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Lock Requests */}
      {lockRequests.length > 0 && (
        <View style={styles.gap12}>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
            🔒 {`${t('accountManagement.lockRequests')} ${ lockRequests.length }`}
          </Text>
          {lockRequests.map((request) => (
            <Card key={request.id} style={styles.p16}>
              <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                <View style={[styles.row, styles.alignCenter, styles.gap12]}>
                  <Lock size={20} color={getStatusColor(request.status)} />
                  <View>
                    <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                      {`${t('accountManagement.lockRequests')}: ${ 1 }`} - {request.bike?.code || t('common.bike')}
                    </Text>
                    <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                      {new Date(request.requestedAt || request.createdAt).toLocaleString()}
                    </Text>
                    {request.adminNote && (
                      <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mt4}>
                        {`${t('accountManagement.adminNote')}: ${ request.adminNote }`}
                      </Text>
                    )}
                    {request.ride && (
                      <Text size="xs" color="#16a34a" style={styles.mt4}>
                        {`${t('accountManagement.rideDetails')}: ${ 
                          Math.round((request.ride.duration || 0) / 60), 
                          request.ride.cost || 0 
                        }`}
                      </Text>
                    )}
                  </View>
                </View>
                <Text 
                  size="xs" 
                  color={getStatusColor(request.status)}
                  weight="bold"
                >
                  {getStatusText(request.status)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {(unlockRequests.length === 0 && lockRequests.length === 0) && (
        <Card style={[styles.p32, styles.alignCenter]}>
          <Clock size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} style={styles.mb8} />
          <Text color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
            {t('accountManagement.noRequests')}
          </Text>
        </Card>
      )}
    </View>
  );

  const renderIncidents = () => (
    <View style={styles.gap16}>
      <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
        <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
          {t('accountManagement.myReports')}
        </Text>
        <Button
          variant="primary"
          size="sm"
          onPress={() => onNavigate('create-incident')}
        >
          <Text>{t('accountManagement.newReport')}</Text>
        </Button>
      </View>
      
      {incidents.map((incident) => (
        <Card key={incident.id} style={styles.p16}>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb8]}>
            <View>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {getIncidentTypeText(incident.type)}
              </Text>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {incident.bike?.code || t('common.bike')} - {new Date(incident.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text 
              size="xs" 
              color={getStatusColor(incident.status)}
              weight="bold"
            >
              {getStatusText(incident.status)}
            </Text>
          </View>
          
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
            {incident.description}
          </Text>
          
          {incident.refundAmount > 0 && (
            <View style={[styles.row, styles.alignCenter, styles.gap4, styles.mb8]}>
              <Text size="sm" color="#16a34a" weight="bold">
                {`${t('accountManagement.refundAmount')} ${(incident.refundAmount)}`}
              </Text>
            </View>
          )}
          
          {incident.adminNote && (
            <View style={[styles.p12, styles.rounded8, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' }]}>
              <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {`${t('accountManagement.adminNote')} ${ incident.adminNote }`}
              </Text>
            </View>
          )}

          <View style={[styles.row, styles.gap8, styles.mt12]}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => onNavigate('incident-details', { incidentId: incident.id })}
              style={styles.flex1}
            >
              <Text>{t('accountManagement.details')}</Text>
            </Button>
            {incident.status === 'OPEN' && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => onNavigate('edit-incident', { incidentId: incident.id })}
                style={styles.flex1}
              >
                <Text>{t('accountManagement.edit')}</Text>
              </Button>
            )}
          </View>
        </Card>
      ))}
      
      {incidents.length === 0 && (
        <Card style={[styles.p32, styles.alignCenter]}>
          <AlertTriangle size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} style={styles.mb8} />
          <Text color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb16}>
            {t('accountManagement.noReports')}
          </Text>
          <Button
            variant="primary"
            onPress={() => onNavigate('create-incident')}
          >
            <Text>{t('accountManagement.createFirstReport')}</Text>
          </Button>
        </Card>
      )}
    </View>
  );

  const tabs = [
    { key: 'overview', label: t('accountManagement.tabs.overview'), icon: Wallet },
    { key: 'transactions', label: t('accountManagement.tabs.transactions'), icon: CreditCard },
    { key: 'requests', label: t('accountManagement.tabs.requests'), icon: Clock },
    { key: 'incidents', label: t('accountManagement.tabs.incidents'), icon: AlertTriangle }
  ];

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
          {t('accountManagement.title')}
        </Text>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[
          styles.px16,
          styles.py8,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151',
            maxHeight: 70,
          }
        ]}
        contentContainerStyle={styles.gap16}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key as any);
                haptics.light();
              }}
              style={[
                styles.alignCenter,
                styles.py8,
                styles.px12,
                styles.rounded8,
                {
                  backgroundColor: activeTab === tab.key ? '#16a34a20' : 'transparent',
                  borderWidth: activeTab === tab.key ? 1 : 0,
                  borderColor: '#16a34a'
                }
              ]}
            >
              <Icon 
                size={16} 
                color={activeTab === tab.key ? '#16a34a' : (colorScheme === 'light' ? '#6b7280' : '#9ca3af')} 
              />
              <Text 
                size="xs" 
                color={activeTab === tab.key ? '#16a34a' : (colorScheme === 'light' ? '#6b7280' : '#9ca3af')}
                style={styles.mt4}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p16]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadAccountData}
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'incidents' && renderIncidents()}
      </ScrollView>
    </View>
  );
}