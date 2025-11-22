/* eslint-disable react/no-unescaped-entities */
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { subscriptionService } from '@/services/subscriptionService';
import { walletService } from '@/services/walletService';
import { ArrowLeft, Check, Zap, Clock, Calendar, Crown, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileSubscriptionPlansProps {
  onBack: () => void;
  onSubscriptionComplete: () => void;
}

export function MobileSubscriptionPlans({ onBack, onSubscriptionComplete }: MobileSubscriptionPlansProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [priceCalculation, setPriceCalculation] = useState<any>(null);

  useEffect(() => {
    loadPlansAndBalance();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      calculatePrice();
    }
  }, [selectedPlan, selectedType]);

  const loadPlansAndBalance = async () => {
    try {
      setIsLoading(true);
      const [plansData, balanceData] = await Promise.all([
        subscriptionService.getAvailablePlans(),
        walletService.getBalance()
      ]);
      
      setPlans(plansData);
      setWalletBalance(balanceData.balance || 0);
      
      // Sélectionner le premier plan par défaut
      if (plansData.length > 0) {
        setSelectedPlan(plansData[0].id);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Erreur lors du chargement des forfaits');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!selectedPlan) return;
    
    try {
      const calculation = await subscriptionService.calculatePrice(selectedPlan, selectedType);
      setPriceCalculation(calculation);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error('Veuillez sélectionner un forfait');
      return;
    }

    if (!priceCalculation) {
      toast.error('Erreur de calcul du prix');
      return;
    }

    if (walletBalance < priceCalculation.finalPrice) {
      toast.error('Solde insuffisant. Veuillez recharger votre wallet.');
      return;
    }

    try {
      setIsLoading(true);
      await subscriptionService.createSubscription(selectedPlan, selectedType);
      
      haptics.success();
      toast.success('Abonnement activé avec succès !');
      onSubscriptionComplete();
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || 'Erreur lors de la souscription');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOURLY': return <Clock size={20} color="#16a34a" />;
      case 'DAILY': return <Calendar size={20} color="#16a34a" />;
      case 'WEEKLY': return <Zap size={20} color="#16a34a" />;
      case 'MONTHLY': return <Crown size={20} color="#16a34a" />;
      default: return <Star size={20} color="#16a34a" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'HOURLY': return 'Horaire';
      case 'DAILY': return 'Journalier';
      case 'WEEKLY': return 'Hebdomadaire';
      case 'MONTHLY': return 'Mensuel';
      default: return type;
    }
  };

  const getTypeDuration = (type: string) => {
    switch (type) {
      case 'HOURLY': return '1-24h';
      case 'DAILY': return '24h';
      case 'WEEKLY': return '7 jours';
      case 'MONTHLY': return '30 jours';
      default: return '';
    }
  };

  const typeOptions: { value: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'; label: string; duration: string }[] = [
    { value: 'HOURLY', label: 'Horaire', duration: '1-24h' },
    { value: 'DAILY', label: 'Journalier', duration: '24h' },
    { value: 'WEEKLY', label: 'Hebdomadaire', duration: '7 jours' },
    { value: 'MONTHLY', label: 'Mensuel', duration: '30 jours' }
  ];

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

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
          Forfaits d'abonnement
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Balance */}
        <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
            <View>
              <Text size="sm" color="#6b7280">
                Solde disponible
              </Text>
              <Text variant="body" color="#16a34a" weight="bold">
                {walletBalance} XOF
              </Text>
            </View>
            {walletBalance < (priceCalculation?.finalPrice || 0) && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => {/* Naviguer vers recharge */}}
              >
                <Text color="#16a34a">Recharger</Text>
              </Button>
            )}
          </View>
        </Card>

        {/* Type Selection */}
        <Card style={styles.p16}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb12}>
            Durée de l'abonnement
          </Text>
          <View style={[styles.row, styles.gap8]}>
            {typeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setSelectedType(option.value);
                  haptics.light();
                }}
                style={[
                  styles.flex1,
                  styles.p12,
                  styles.rounded8,
                  styles.alignCenter,
                  {
                    backgroundColor: selectedType === option.value 
                      ? '#16a34a20' 
                      : (colorScheme === 'light' ? '#f9fafb' : '#374151'),
                    borderWidth: selectedType === option.value ? 2 : 1,
                    borderColor: selectedType === option.value 
                      ? '#16a34a' 
                      : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563')
                  }
                ]}
              >
                {getTypeIcon(option.value)}
                <Text 
                  size="sm" 
                  color={selectedType === option.value ? '#16a34a' : (colorScheme === 'light' ? '#111827' : '#f9fafb')}
                  style={styles.mt4}
                  weight={selectedType === option.value ? 'bold' : 'normal'}
                >
                  {option.label}
                </Text>
                <Text 
                  size="xs" 
                  color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                  style={styles.mt4}
                >
                  {option.duration}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Plans Selection */}
        <View style={styles.gap12}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            Choisissez votre forfait
          </Text>
          
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => {
                setSelectedPlan(plan.id);
                haptics.light();
              }}
            >
              <Card 
                style={[
                  styles.p16,
                  {
                    backgroundColor: selectedPlan === plan.id 
                      ? '#16a34a10' 
                      : (colorScheme === 'light' ? 'white' : '#1f2937'),
                    borderColor: selectedPlan === plan.id ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#374151'),
                    borderWidth: selectedPlan === plan.id ? 2 : 1
                  }
                ]}
              >
                <View style={[styles.row, styles.spaceBetween, styles.alignStart, styles.mb12]}>
                  <View style={styles.flex1}>
                    <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb4]}>
                      <Text 
                        variant="body" 
                        color={selectedPlan === plan.id ? '#16a34a' : (colorScheme === 'light' ? '#111827' : '#f9fafb')}
                        weight="bold"
                      >
                        {plan.name}
                      </Text>
                      {plan.isPopular && (
                        <View style={[styles.px8, styles.py4, styles.roundedFull, { backgroundColor: '#f59e0b' }]}>
                          <Text size="xs" color="white">Populaire</Text>
                        </View>
                      )}
                    </View>
                    <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                      {plan.description}
                    </Text>
                  </View>
                  
                  {selectedPlan === plan.id && (
                    <View style={[styles.p4, styles.roundedFull, { backgroundColor: '#16a34a' }]}>
                      <Check size={16} color="white" />
                    </View>
                  )}
                </View>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <View style={styles.gap8}>
                    {plan.features.map((feature: string, index: number) => (
                      <View key={index} style={[styles.row, styles.alignCenter, styles.gap8]}>
                        <Check size={16} color="#16a34a" />
                        <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Price for selected type */}
                {selectedPlan === plan.id && priceCalculation && (
                  <View style={[styles.mt12, styles.pt12, { borderTopWidth: 1, borderTopColor: colorScheme === 'light' ? '#e5e7eb' : '#374151' }]}>
                    <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                      <Text size="sm" color="#6b7280">
                        Prix {getTypeLabel(selectedType).toLowerCase()}:
                      </Text>
                      <View style={styles.alignEnd}>
                        {priceCalculation.discount > 0 && (
                          <Text 
                            size="sm" 
                            color="#6b7280" 
                            style={{ textDecorationLine: 'line-through' }}
                          >
                            {priceCalculation.basePrice} XOF
                          </Text>
                        )}
                        <Text variant="body" color="#16a34a" weight="bold">
                          {priceCalculation.finalPrice} XOF
                        </Text>
                        {priceCalculation.discount > 0 && (
                          <Text size="xs" color="#16a34a">
                            Économie de {priceCalculation.savings} XOF ({priceCalculation.discount}%)
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Summary */}
        {selectedPlan && priceCalculation && (
          <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
            <Text variant="body" color="#111827" style={styles.mb8}>
              Récapitulatif
            </Text>
            <View style={styles.gap8}>
              <View style={[styles.row, styles.spaceBetween]}>
                <Text size="sm" color="#6b7280">Forfait :</Text>
                <Text size="sm" color="#111827">{selectedPlanData?.name}</Text>
              </View>
              <View style={[styles.row, styles.spaceBetween]}>
                <Text size="sm" color="#6b7280">Durée :</Text>
                <Text size="sm" color="#111827">{getTypeLabel(selectedType)}</Text>
              </View>
              {priceCalculation.discount > 0 && (
                <View style={[styles.row, styles.spaceBetween]}>
                  <Text size="sm" color="#6b7280">Réduction :</Text>
                  <Text size="sm" color="#16a34a">-{priceCalculation.discount}%</Text>
                </View>
              )}
              <View style={[styles.row, styles.spaceBetween, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#d1fae5' }]}>
                <Text variant="body" color="#111827">Total :</Text>
                <Text variant="body" color="#16a34a" weight="bold">
                  {priceCalculation.finalPrice} XOF
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Subscribe Button */}
        <Button 
          onPress={handleSubscribe}
          disabled={isLoading || !selectedPlan || !priceCalculation || walletBalance < (priceCalculation?.finalPrice || 0)}
          fullWidth
          style={{ 
            backgroundColor: '#16a34a',
            opacity: (isLoading || !selectedPlan || !priceCalculation || walletBalance < (priceCalculation?.finalPrice || 0)) ? 0.6 : 1
          }}
        >
          <Check size={16} color="white" />
          <Text style={styles.ml8} color="white">
            {isLoading ? 'Souscription...' : 
             walletBalance < (priceCalculation?.finalPrice || 0) ? 'Solde insuffisant' : 
             `Souscrire - ${priceCalculation?.finalPrice || 0} XOF`}
          </Text>
        </Button>

        {/* Benefits */}
        <Card style={styles.p16}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb12}>
            Avantages des forfaits
          </Text>
          <View style={styles.gap8}>
            <View style={[styles.row, styles.alignCenter, styles.gap8]}>
              <Zap size={16} color="#16a34a" />
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                Tarifs réduits sur toutes vos courses
              </Text>
            </View>
            <View style={[styles.row, styles.alignCenter, styles.gap8]}>
              <Clock size={16} color="#16a34a" />
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                Pas de frais de déverrouillage
              </Text>
            </View>
            <View style={[styles.row, styles.alignCenter, styles.gap8]}>
              <Calendar size={16} color="#16a34a" />
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                Utilisation illimitée pendant la durée
              </Text>
            </View>
            <View style={[styles.row, styles.alignCenter, styles.gap8]}>
              <Crown size={16} color="#16a34a" />
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                Priorité sur les vélos disponibles
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}