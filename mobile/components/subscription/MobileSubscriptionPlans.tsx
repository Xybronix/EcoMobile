/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { subscriptionService } from '@/services/subscriptionService';
import { walletService } from '@/services/walletService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { ArrowLeft, Check, Clock, CreditCard, Star, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { useMobileAuth } from '@/lib/mobile-auth';

interface Plan {
  id: string;
  name: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  discount: number;
  features: string[];
  isPopular?: boolean;
}

interface MobileSubscriptionPlansProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

export function MobileSubscriptionPlans({ onBack, onNavigate }: MobileSubscriptionPlansProps) {
  const { t } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPlans();
    loadWalletData();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const availablePlans = await subscriptionService.getAvailablePlans();
      setPlans(availablePlans);
      if (availablePlans.length > 0) {
        setSelectedPlan(availablePlans[0].id);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error(t('subscription.error.loading'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletData = async () => {
    try {
      const wallet = await walletService.getBalance();
      setWalletData(wallet);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const packageOptions = [
    {
      key: 'daily',
      label: t('subscription.package.daily'),
      description: t('subscription.package.dailyDesc'),
      icon: Clock,
      getRateKey: (plan: Plan) => plan.dailyRate
    },
    {
      key: 'weekly',
      label: t('subscription.package.weekly'), 
      description: t('subscription.package.weeklyDesc'),
      icon: Star,
      getRateKey: (plan: Plan) => plan.weeklyRate
    },
    {
      key: 'monthly',
      label: t('subscription.package.monthly'),
      description: t('subscription.package.monthlyDesc'),
      icon: Zap,
      getRateKey: (plan: Plan) => plan.monthlyRate
    }
  ];

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const selectedPackageData = packageOptions.find(p => p.key === selectedPackage);

  const getPrice = () => {
    if (!selectedPlanData || !selectedPackageData) return 0;
    return selectedPackageData.getRateKey(selectedPlanData);
  };

  const handleSubscribe = async () => {
    if (!selectedPlanData || !user) {
      toast.error(t('subscription.selectPlanError'));
      return;
    }

    const price = getPrice();
    
    // Vérifier le solde
    const currentBalance = walletData?.balance || 0;

    if (currentBalance < price) {
      haptics.error();
      Alert.alert(
        t('subscription.insufficientBalance.title'),
        t('subscription.insufficientBalance.message'),
        [
          { text: t('subscription.insufficientBalance.cancel'), style: 'cancel' },
          { text: t('subscription.insufficientBalance.topUp'), onPress: () => onNavigate('wallet') }
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);
      
      await subscriptionService.subscribe({
        planId: selectedPlan,
        packageType: selectedPackage,
        startDate: new Date()
      });

      haptics.success();
      toast.success(t('subscription.success.title'));
      
      Alert.alert(
        t('subscription.success.title'),
        `${t('subscription.success.message')} ${ 
          selectedPlanData.name, 
          selectedPackageData?.label 
        }`,
        [
          { text: t('subscription.success.ok'), onPress: () => onBack() }
        ]
      );
      
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('subscription.error.subscribing'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {t('subscription.plans.title')}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Plans Selection */}
        <View style={styles.gap16}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            {t('subscription.plans.selectPlan')}
          </Text>
          
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => {
                setSelectedPlan(plan.id);
                haptics.light();
              }}
              style={[
                styles.card,
                styles.p16,
                {
                  borderWidth: selectedPlan === plan.id ? 2 : 1,
                  borderColor: selectedPlan === plan.id ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
                  backgroundColor: selectedPlan === plan.id ? '#f0fdf4' : (colorScheme === 'light' ? 'white' : '#1f2937')
                }
              ]}
            >
              <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb8]}>
                <Text 
                  variant="body" 
                  color={selectedPlan === plan.id ? '#16a34a' : (colorScheme === 'light' ? '#111827' : '#f9fafb')}
                  weight="bold"
                >
                  {plan.name}
                </Text>
                {plan.isPopular && (
                  <Badge variant="default">
                    <Text color="white" size="xs">{t('subscription.plans.popular')}</Text>
                  </Badge>
                )}
              </View>
              
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
                {`${t('subscription.plans.hourlyRate')} ${ plan.hourlyRate }`}
              </Text>
              
              {plan.discount > 0 && (
                <Text size="sm" color="#16a34a" style={styles.mb8}>
                  {`${t('subscription.plans.discount')} ${ plan.discount }`}
                </Text>
              )}
              
              <View style={[styles.row, { flexWrap: 'wrap' }, styles.gap4]}>
                {plan.features?.map((feature, index) => (
                  <View key={index} style={[styles.row, styles.alignCenter, styles.gap4]}>
                    <Check size={12} color="#16a34a" />
                    <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Package Type Selection */}
        <View style={styles.gap16}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            {t('subscription.plans.selectDuration')}
          </Text>
          
          {packageOptions.map((option) => {
            const Icon = option.icon;
            const price = selectedPlanData ? option.getRateKey(selectedPlanData) : 0;
            
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => {
                  setSelectedPackage(option.key as any);
                  haptics.light();
                }}
                style={[
                  styles.card,
                  styles.p16,
                  {
                    borderWidth: selectedPackage === option.key ? 2 : 1,
                    borderColor: selectedPackage === option.key ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
                    backgroundColor: selectedPackage === option.key ? '#f0fdf4' : (colorScheme === 'light' ? 'white' : '#1f2937')
                  }
                ]}
              >
                <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                  <View style={[styles.row, styles.alignCenter, styles.gap12]}>
                    <Icon 
                      size={24} 
                      color={selectedPackage === option.key ? '#16a34a' : (colorScheme === 'light' ? '#6b7280' : '#9ca3af')} 
                    />
                    <View>
                      <Text 
                        variant="body" 
                        color={selectedPackage === option.key ? '#16a34a' : (colorScheme === 'light' ? '#111827' : '#f9fafb')}
                      >
                        {option.label}
                      </Text>
                      <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.alignEnd}>
                    <Text variant="body" color="#16a34a" weight="bold">
                      {price} XOF
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary */}
        {selectedPlanData && (
          <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
            <Text variant="body" color="#111827" style={styles.mb12}>
              {t('subscription.summary.title')}
            </Text>
            
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="sm" color="#6b7280">{t('subscription.summary.plan')}</Text>
              <Text size="sm" color="#111827">{selectedPlanData.name}</Text>
            </View>
            
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="sm" color="#6b7280">{t('subscription.summary.package')}</Text>
              <Text size="sm" color="#111827">{selectedPackageData?.label}</Text>
            </View>
            
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="sm" color="#6b7280">{t('subscription.summary.currentBalance')}</Text>
              <Text size="sm" color="#111827">{walletData?.balance || 0} XOF</Text>
            </View>
            
            <View style={[styles.row, styles.spaceBetween, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#d1fae5' }]}>
              <Text variant="body" color="#111827">{t('subscription.summary.totalPrice')}</Text>
              <Text variant="body" color="#16a34a" weight="bold">
                {getPrice()} XOF
              </Text>
            </View>
          </Card>
        )}

        {/* Subscribe Button */}
        <Button 
          onPress={handleSubscribe}
          disabled={isSubmitting || !selectedPlanData || !selectedPackageData}
          fullWidth
          style={{ 
            backgroundColor: '#16a34a',
            opacity: (isSubmitting || !selectedPlanData || !selectedPackageData) ? 0.6 : 1
          }}
        >
          <CreditCard size={16} color="white" />
          <Text style={styles.ml8} color="white">
            {isSubmitting 
              ? t('subscription.subscribing') 
              : `${t('subscription.subscribe')} ${ getPrice() }`
            }
          </Text>
        </Button>

        <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
          {t('subscription.footer')}
        </Text>
      </ScrollView>
    </View>
  );
}