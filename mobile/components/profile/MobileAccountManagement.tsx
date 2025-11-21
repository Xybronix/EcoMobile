/* eslint-disable react/no-unescaped-entities */
// components/MobileAccountManagement.tsx
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { walletService } from '@/services/walletService';
import { incidentService } from '@/services/incidentService';
import { bikeRequestService } from '@/services/bikeRequestService';
import { Wallet, CreditCard, Clock, Shield, AlertTriangle, ArrowLeft, Lock, Unlock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { useMobileAuth } from '@/lib/mobile-auth';

interface MobileAccountManagementProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

export function MobileAccountManagement({ onBack, onNavigate }: MobileAccountManagementProps) {
  const { t, language } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'requests' | 'incidents'>('overview');
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

  // Charger les données spécifiques aux onglets quand ils deviennent actifs
  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab]);

  const loadAccountData = async () => {
    try {
      setIsLoading(true);
      
      const [wallet, depositData, subscription, userTransactions, userIncidents] = await Promise.all([
        walletService.getBalance(),
        walletService.getDepositInfo(),
        walletService.getCurrentSubscription(),
        walletService.getTransactions(1, 50),
        incidentService.getIncidents(1, 50)
      ]);

      setWalletData(wallet);
      setDepositInfo(depositData);
      setCurrentSubscription(subscription);
      setTransactions(userTransactions.transactions || []);
      setIncidents(userIncidents.incidents || []);
      
    } catch (error) {
      console.error('Error loading account data:', error);
      toast.error('Erreur lors du chargement des données');
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
      setLockRequests(lockReqs.data  || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Erreur lors du chargement des demandes');
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
      'COMPLETED': 'Terminé',
      'PENDING': 'En attente',
      'FAILED': 'Échoué',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Rejeté',
      'CANCELLED': 'Annulé',
      'OPEN': 'Ouvert',
      'IN_PROGRESS': 'En cours',
      'RESOLVED': 'Résolu',
      'CLOSED': 'Fermé'
    };
    return statusMap[status] || status;
  };

  const getTransactionTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'DEPOSIT': 'Dépôt',
      'RIDE_PAYMENT': 'Paiement trajet',
      'REFUND': 'Remboursement',
      'DEPOSIT_RECHARGE': 'Recharge caution',
      'DAMAGE_CHARGE': 'Frais de dégâts'
    };
    return typeMap[type] || type;
  };

  const getIncidentTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'brakes': 'Problème de freins',
      'battery': 'Problème de batterie',
      'tire': 'Problème de pneu',
      'chain': 'Problème de chaîne',
      'lights': 'Problème de lumières',
      'lock': 'Problème de cadenas',
      'electronics': 'Problème électronique',
      'physical_damage': 'Dégât physique',
      'other': 'Autre problème'
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
      {currentSubscription && (
        <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
          <Text variant="body" color="#111827" style={styles.mb8}>
            Forfait Actuel
          </Text>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
            <View>
              <Text variant="body" color="#16a34a" weight="bold">
                {currentSubscription.planName} - {currentSubscription.packageType}
              </Text>
              <Text size="sm" color="#6b7280">
                Expire le {new Date(currentSubscription.endDate).toLocaleDateString()}
              </Text>
            </View>
            <Badge variant="default">
              Actif
            </Badge>
          </View>
        </Card>
      )}

      {/* Wallet Overview */}
      <View style={[styles.row, styles.gap12]}>
        <Card style={[styles.flex1, styles.p16, styles.alignCenter]}>
          <Wallet size={24} color="#16a34a" style={styles.mb8} />
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
            Solde Wallet
          </Text>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} weight="bold">
            {walletData?.balance || 0} XOF
          </Text>
        </Card>
        
        <Card style={[styles.flex1, styles.p16, styles.alignCenter]}>
          <Shield size={24} color="#3b82f6" style={styles.mb8} />
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
            Caution
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
              <Text size="sm" color="#92400e">
                Caution insuffisante. Vous devez recharger votre caution à {depositInfo.requiredDeposit} XOF minimum pour utiliser les vélos.
              </Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => onNavigate('recharge-deposit')}
                style={[styles.mt8, { borderColor: '#f59e0b' }]}
              >
                <Text color="#f59e0b">Recharger la caution</Text>
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
              <Text size="sm" color="#991b1b">
                Solde négatif : -{depositInfo.negativeBalance} XOF
              </Text>
              <Text size="xs" color="#991b1b" style={styles.mt4}>
                Rechargez votre wallet et votre caution pour continuer à utiliser les services.
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={[styles.row, styles.gap12]}>
        <Button
          variant="outline"
          onPress={() => onNavigate('wallet-topup')}
          style={styles.flex1}
        >
          <CreditCard size={16} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
          <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            Recharger
          </Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => onNavigate('recharge-deposit')}
          style={styles.flex1}
        >
          <Shield size={16} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
          <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            Caution
          </Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => onNavigate('create-incident')}
          style={styles.flex1}
        >
          <AlertTriangle size={16} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
          <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            Signaler
          </Text>
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
            <Label style={styles.mb8}>Type</Label>
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="DEPOSIT">Dépôts</SelectItem>
                <SelectItem value="RIDE_PAYMENT">Paiements</SelectItem>
                <SelectItem value="REFUND">Remboursements</SelectItem>
              </SelectContent>
            </Select>
          </View>
          <View style={styles.flex1}>
            <Label style={styles.mb8}>Période</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">7 derniers jours</SelectItem>
                <SelectItem value="month">30 derniers jours</SelectItem>
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
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.alignEnd}>
                <Text 
                  variant="body" 
                  color={transaction.type === 'RIDE_PAYMENT' || transaction.type === 'DAMAGE_CHARGE' ? '#dc2626' : '#16a34a'}
                  weight="bold"
                >
                  {transaction.type === 'RIDE_PAYMENT' || transaction.type === 'DAMAGE_CHARGE' ? '-' : '+'}
                  {transaction.amount} XOF
                </Text>
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: getStatusColor(transaction.status) + '20' }}
                >
                  <Text size="xs" color={getStatusColor(transaction.status)}>
                    {getStatusText(transaction.status)}
                  </Text>
                </Badge>
              </View>
            </View>
          </Card>
        ))}
        
        {filteredTransactions.length === 0 && (
          <Card style={[styles.p32, styles.alignCenter]}>
            <Text color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
              Aucune transaction trouvée
            </Text>
          </Card>
        )}
      </View>
    </View>
  );

  const renderRequests = () => (
    <View style={styles.gap16}>
      <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
        Demandes de déverrouillage/verrouillage
      </Text>
      
      {/* Unlock Requests */}
      {unlockRequests.length > 0 && (
        <View style={styles.gap12}>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
            Déverrouillages ({unlockRequests.length})
          </Text>
          {unlockRequests.map((request) => (
            <Card key={request.id} style={styles.p16}>
              <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                <View style={[styles.row, styles.alignCenter, styles.gap12]}>
                  <Unlock size={20} color={getStatusColor(request.status)} />
                  <View>
                    <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                      Déverrouillage - {request.bike?.code || 'Vélo'}
                    </Text>
                    <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                      {new Date(request.requestedAt || request.createdAt).toLocaleString()}
                    </Text>
                    {request.adminNote && (
                      <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mt4}>
                        Note: {request.adminNote}
                      </Text>
                    )}
                  </View>
                </View>
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: getStatusColor(request.status) + '20' }}
                >
                  <Text size="xs" color={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Text>
                </Badge>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Lock Requests */}
      {lockRequests.length > 0 && (
        <View style={styles.gap12}>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
            Verrouillages ({lockRequests.length})
          </Text>
          {lockRequests.map((request) => (
            <Card key={request.id} style={styles.p16}>
              <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                <View style={[styles.row, styles.alignCenter, styles.gap12]}>
                  <Lock size={20} color={getStatusColor(request.status)} />
                  <View>
                    <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                      Verrouillage - {request.bike?.code || 'Vélo'}
                    </Text>
                    <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                      {new Date(request.requestedAt || request.createdAt).toLocaleString()}
                    </Text>
                    {request.adminNote && (
                      <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mt4}>
                        Note: {request.adminNote}
                      </Text>
                    )}
                  </View>
                </View>
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: getStatusColor(request.status) + '20' }}
                >
                  <Text size="xs" color={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Text>
                </Badge>
              </View>
            </Card>
          ))}
        </View>
      )}

      {(unlockRequests.length === 0 && lockRequests.length === 0) && (
        <Card style={[styles.p32, styles.alignCenter]}>
          <Clock size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} style={styles.mb8} />
          <Text color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
            Aucune demande trouvée
          </Text>
        </Card>
      )}
    </View>
  );

  const renderIncidents = () => (
    <View style={styles.gap16}>
      <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
        <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
          Mes signalements
        </Text>
        <Button
          variant="primary"
          size="sm"
          onPress={() => onNavigate('create-incident')}
        >
          <Text>Nouveau signalement</Text>
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
                {incident.bike?.code || 'Vélo non spécifié'} - {new Date(incident.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Badge 
              variant="secondary"
              style={{ backgroundColor: getStatusColor(incident.status) + '20' }}
            >
              <Text size="xs" color={getStatusColor(incident.status)}>
                {getStatusText(incident.status)}
              </Text>
            </Badge>
          </View>
          
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
            {incident.description}
          </Text>
          
          {incident.refundAmount > 0 && (
            <View style={[styles.row, styles.alignCenter, styles.gap4, styles.mb8]}>
              <Text size="sm" color="#16a34a" weight="bold">
                Remboursement: {incident.refundAmount} XOF
              </Text>
            </View>
          )}
          
          {incident.adminNote && (
            <View style={[styles.p12, styles.rounded8, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' }]}>
              <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                Note admin: {incident.adminNote}
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
              <Text>Détails</Text>
            </Button>
            {incident.status === 'OPEN' && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => onNavigate('edit-incident', { incidentId: incident.id })}
                style={styles.flex1}
              >
                <Text>Modifier</Text>
              </Button>
            )}
          </View>
        </Card>
      ))}
      
      {incidents.length === 0 && (
        <Card style={[styles.p32, styles.alignCenter]}>
          <AlertTriangle size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} style={styles.mb8} />
          <Text color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb16}>
            Aucun signalement trouvé
          </Text>
          <Button
            variant="primary"
            onPress={() => onNavigate('create-incident')}
          >
            <Text>Créer un premier signalement</Text>
          </Button>
        </Card>
      )}
    </View>
  );

  const tabs = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: Wallet },
    { key: 'transactions', label: 'Transactions', icon: CreditCard },
    { key: 'requests', label: 'Demandes', icon: Clock },
    { key: 'incidents', label: 'Signalements', icon: AlertTriangle }
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
          Gestion de compte
        </Text>
      </View>

      {/* Tabs */}
      <View 
        style={[
          styles.row,
          styles.px16,
          styles.py8,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
          }
        ]}
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
                styles.flex1,
                styles.alignCenter,
                styles.py8,
                {
                  borderBottomWidth: activeTab === tab.key ? 2 : 0,
                  borderBottomColor: '#16a34a'
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
      </View>

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