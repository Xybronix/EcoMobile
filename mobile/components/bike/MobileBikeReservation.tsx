/* eslint-disable react-hooks/exhaustive-deps */
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { reservationService } from '@/services/reservationService';
import { subscriptionService } from '@/services/subscriptionService';
import { Calendar, Clock, ArrowLeft, Check, X, Crown, AlertTriangle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileBikeReservationProps {
  bike: any;
  onBack: () => void;
  onReservationComplete: () => void;
}

interface SubscriptionInfo {
  id: string;
  planName: string;
  packageType: string;
  startDate: string;
  endDate: string;
  status: string;
  remainingDays: number;
}

interface PlanWithSubscriptionInfo {
  id: string;
  name: string;
  type: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  discount: number;
  features: string[];
  isPopular?: boolean;
  isCoveredBySubscription?: boolean;
  subscriptionCoverage?: {
    coveredDays: number;
    remainingDays: number;
    extraCost?: number;
    message?: string;
  };
}

export function MobileBikeReservation({ bike, onBack, onReservationComplete }: MobileBikeReservationProps) {
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<PlanWithSubscriptionInfo[]>([]);
  const [conflictMessage, setConflictMessage] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionInfo | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTime && selectedPackage) {
      checkAvailability();
      updatePlansWithSubscriptionInfo();
    }
  }, [selectedDate, selectedTime, selectedPackage, currentSubscription]);

  const loadUserData = async () => {
    try {
      // Charger l'abonnement actif
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
      
      // Charger les plans disponibles
      const plans = await reservationService.getAvailablePlans();
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updatePlansWithSubscriptionInfo = () => {
    if (!selectedDate || !selectedPackage || !currentSubscription) return;

    const updatedPlans = availablePlans.map(plan => {
      const subscriptionInfo = calculateSubscriptionCoverage(plan, selectedPackage);
      return {
        ...plan,
        isCoveredBySubscription: subscriptionInfo.isCovered,
        subscriptionCoverage: subscriptionInfo
      };
    });

    setAvailablePlans(updatedPlans);
  };

  const calculateSubscriptionCoverage = (plan: any, packageType: string) => {
    if (!currentSubscription) {
      return { isCovered: false, coveredDays: 0, remainingDays: 0 };
    }

    const reservationStartDate = new Date(`${selectedDate}T${selectedTime}`);
    const subscriptionEndDate = new Date(currentSubscription.endDate);
    
    // Calculer la durée de la réservation en jours
    let reservationDays = 1;
    switch (packageType) {
      case 'daily':
        reservationDays = 1;
        break;
      case 'weekly':
        reservationDays = 7;
        break;
      case 'monthly':
        reservationDays = 30;
        break;
      default:
        reservationDays = 1;
    }

    const reservationEndDate = new Date(reservationStartDate);
    reservationEndDate.setDate(reservationEndDate.getDate() + reservationDays);

    // Vérifier si la réservation commence pendant l'abonnement
    const startsDuringSubscription = reservationStartDate <= subscriptionEndDate;

    if (!startsDuringSubscription) {
      return {
        isCovered: false,
        coveredDays: 0,
        remainingDays: 0,
        message: t('subscription.afterExpiry')
      };
    }

    // Calculer le nombre de jours couverts par l'abonnement
    const coverageEndDate = new Date(Math.min(reservationEndDate.getTime(), subscriptionEndDate.getTime()));
    const coveredDays = Math.ceil((coverageEndDate.getTime() - reservationStartDate.getTime()) / (1000 * 60 * 60 * 24));

    const isFullyCovered = coveredDays >= reservationDays;
    const remainingDays = Math.max(0, reservationDays - coveredDays);

    let message = '';
    let extraCost = 0;

    if (isFullyCovered) {
      message = t('subscription.fullyIncluded');
    } else {
      // Calculer le coût supplémentaire pour les jours non couverts
      const dailyRate = getDailyRate(plan, packageType);
      extraCost = remainingDays * dailyRate;
      message = `${t('subscription.partiallyIncluded')} (coveredDays: ${coveredDays}, remainingDays: ${remainingDays}, extraCost: ${extraCost.toLocaleString()})`;
    }

    return {
      isCovered: isFullyCovered,
      coveredDays,
      remainingDays,
      extraCost,
      message
    };
  };

  const getDailyRate = (plan: any, packageType: string) => {
    switch (packageType) {
      case 'daily':
        return plan.dailyRate;
      case 'weekly':
        return plan.weeklyRate / 7;
      case 'monthly':
        return plan.monthlyRate / 30;
      default:
        return plan.dailyRate;
    }
  };

  const checkAvailability = async () => {
    try {
      const isAvailable = await reservationService.checkAvailability(
        bike.id,
        selectedDate,
        selectedTime,
        selectedPackage
      );
      
      if (!isAvailable) {
        setConflictMessage(t('reservation.conflictMessage'));
      } else {
        setConflictMessage('');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const packageOptions = [
    { value: 'hourly', label: t('package.hourly'), duration: t('package.hourlyDuration') },
    { value: 'daily', label: t('package.daily'), duration: t('package.dailyDuration') },
    { value: 'weekly', label: t('package.weekly'), duration: t('package.weeklyDuration') },
    { value: 'monthly', label: t('package.monthly'), duration: t('package.monthlyDuration') }
  ];

  const handleSubmit = async () => {
    if (!selectedPlan || !selectedPackage || !selectedDate || !selectedTime) {
      toast.error(t('reservation.fillAllFields'));
      return;
    }

    if (conflictMessage) {
      toast.error(conflictMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      
      await reservationService.createReservation({
        bikeId: bike.id,
        planId: selectedPlan,
        packageType: selectedPackage,
        startDate: selectedDate,
        startTime: selectedTime
      });

      haptics.success();
      toast.success(t('reservation.success'));
      onReservationComplete();
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('reservation.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlanData = availablePlans.find(p => p.id === selectedPlan);
  const selectedPackageData = packageOptions.find(p => p.value === selectedPackage);
  
  const getPrice = () => {
    if (!selectedPlanData || !selectedPackage) return 0;
    
    // Si couvert par l'abonnement, prix = 0 ou coût supplémentaire
    if (selectedPlanData.isCoveredBySubscription) {
      return 0;
    } else if (selectedPlanData.subscriptionCoverage?.extraCost) {
      return selectedPlanData.subscriptionCoverage.extraCost;
    }
    
    // Prix normal
    switch (selectedPackage) {
      case 'hourly': return selectedPlanData.hourlyRate;
      case 'daily': return selectedPlanData.dailyRate;
      case 'weekly': return selectedPlanData.weeklyRate;
      case 'monthly': return selectedPlanData.monthlyRate;
      default: return 0;
    }
  };

  const getPriceMessage = () => {
    if (!selectedPlanData) return '';
    
    if (selectedPlanData.isCoveredBySubscription) {
      return t('subscription.fullyIncluded');
    } else if (selectedPlanData.subscriptionCoverage?.extraCost) {
      return `${t('subscription.partiallyIncluded')} ${ 
        selectedPlanData.subscriptionCoverage.coveredDays, 
        selectedPlanData.subscriptionCoverage.remainingDays, 
        selectedPlanData.subscriptionCoverage.extraCost.toLocaleString() 
      }`;
    } else {
      return t('subscription.normalRate');
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
        <View style={styles.flex1}>
          <Text variant="subtitle" color="#16a34a">
            {t('reservation.title')}
          </Text>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
            {bike.code} - {bike.model}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription Status */}
        {currentSubscription && (
          <Card style={[styles.p16, { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]}>
            <View style={[styles.row, styles.gap12]}>
              <Crown size={20} color="#3b82f6" />
              <View style={styles.flex1}>
                <Text variant="body" color="#1e40af" weight="bold">
                  {`${t('subscription.active')} ${ currentSubscription.planName }`}
                </Text>
                <Text size="sm" color="#1e40af">
                  {`${t('subscription.validUntil')} ${ 
                    new Date(currentSubscription.endDate).toLocaleDateString(),
                    currentSubscription.remainingDays
                  }`}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Plan Selection */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>{t('reservation.planSelection')}</Label>
          <View style={styles.gap8}>
            {availablePlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => {
                  setSelectedPlan(plan.id);
                  haptics.light();
                }}
                style={[
                  styles.p16,
                  styles.rounded8,
                  {
                    backgroundColor: selectedPlan === plan.id 
                      ? '#16a34a20' 
                      : (colorScheme === 'light' ? '#f9fafb' : '#374151'),
                    borderWidth: selectedPlan === plan.id ? 2 : 1,
                    borderColor: selectedPlan === plan.id 
                      ? '#16a34a' 
                      : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563')
                  }
                ]}
              >
                <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                  <View style={styles.flex1}>
                    <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb4]}>
                      <Text 
                        variant="body" 
                        color={selectedPlan === plan.id ? '#16a34a' : (colorScheme === 'light' ? '#111827' : '#f9fafb')}
                        weight="bold"
                      >
                        {plan.name}
                      </Text>
                      {plan.isCoveredBySubscription && (
                        <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                          <Crown size={16} color="#3b82f6" />
                          <Text size="xs" color="#3b82f6">
                            {t('subscription.included')}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Subscription Coverage Info */}
                    {plan.subscriptionCoverage && !plan.isCoveredBySubscription && (
                      <View style={[styles.row, styles.alignCenter, styles.gap4, styles.mb4]}>
                        <AlertTriangle size={14} color="#f59e0b" />
                        <Text size="xs" color="#f59e0b">
                          {plan.subscriptionCoverage.message}
                        </Text>
                      </View>
                    )}

                    {/* Pricing */}
                    <View style={[styles.row, styles.gap12]}>
                      <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                        {`${t('price.daily')} ${ plan.dailyRate.toLocaleString() }`}
                      </Text>
                      <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                        {`${t('price.monthly')} ${ plan.monthlyRate.toLocaleString() }`}
                      </Text>
                    </View>
                  </View>

                  {/* Price based on subscription */}
                  <View style={styles.alignEnd}>
                    {plan.isCoveredBySubscription ? (
                      <Text size="lg" color="#3b82f6" weight="bold">
                        {t('reservation.free')}
                      </Text>
                    ) : plan.subscriptionCoverage?.extraCost ? (
                      <View style={styles.alignEnd}>
                        <Text size="sm" color="#f59e0b" style={styles.textRight}>
                          {plan.subscriptionCoverage.extraCost.toLocaleString()} XOF
                        </Text>
                        <Text size="xs" color="#6b7280" style={styles.textRight}>
                          {t('reservation.additional')}
                        </Text>
                      </View>
                    ) : (
                      <Text size="lg" color="#16a34a" weight="bold">
                        {plan.dailyRate.toLocaleString()} XOF
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Package Type */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>{t('reservation.packageType')}</Label>
          <View style={styles.gap8}>
            {packageOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setSelectedPackage(option.value);
                  haptics.light();
                }}
                style={[
                  styles.row,
                  styles.spaceBetween,
                  styles.alignCenter,
                  styles.p12,
                  styles.rounded8,
                  {
                    backgroundColor: selectedPackage === option.value 
                      ? '#16a34a20' 
                      : (colorScheme === 'light' ? '#f9fafb' : '#374151'),
                    borderWidth: selectedPackage === option.value ? 2 : 1,
                    borderColor: selectedPackage === option.value 
                      ? '#16a34a' 
                      : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563')
                  }
                ]}
              >
                <View>
                  <Text 
                    variant="body" 
                    color={selectedPackage === option.value ? '#16a34a' : (colorScheme === 'light' ? '#111827' : '#f9fafb')}
                  >
                    {option.label}
                  </Text>
                  <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                    {option.duration}
                  </Text>
                </View>
                {selectedPlanData && (
                  <Text variant="body" color="#16a34a">
                    {option.value === 'hourly' && `${t('price.hourly')} ${ selectedPlanData.hourlyRate }`}
                    {option.value === 'daily' && `${selectedPlanData.dailyRate} XOF`}
                    {option.value === 'weekly' && `${selectedPlanData.weeklyRate} XOF`}
                    {option.value === 'monthly' && `${selectedPlanData.monthlyRate} XOF`}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Date Selection */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>{t('reservation.startDate')}</Label>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.row,
              styles.alignCenter,
              styles.gap12,
              styles.p12,
              styles.rounded8,
              { 
                backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151',
                borderWidth: 1,
                borderColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563'
              }
            ]}
          >
            <Calendar size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
            <Text color={selectedDate ? (colorScheme === 'light' ? '#111827' : '#f9fafb') : '#6b7280'}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : t('reservation.selectDate')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDateTime}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setSelectedDateTime(date);
                  const formattedDate = date.toISOString().split('T')[0];
                  setSelectedDate(formattedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}
        </Card>

        {/* Time Selection */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>{t('reservation.startTime')}</Label>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={[
              styles.row,
              styles.alignCenter,
              styles.gap12,
              styles.p12,
              styles.rounded8,
              { 
                backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151',
                borderWidth: 1,
                borderColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563'
              }
            ]}
          >
            <Clock size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
            <Text color={selectedTime ? (colorScheme === 'light' ? '#111827' : '#f9fafb') : '#6b7280'}>
              {selectedTime || t('reservation.selectTime')}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedDateTime}
              mode="time"
              display="default"
              onChange={(event, date) => {
                setShowTimePicker(false);
                if (date) {
                  setSelectedDateTime(date);
                  const formattedTime = date.toTimeString().split(' ')[0].substring(0, 5);
                  setSelectedTime(formattedTime);
                }
              }}
            />
          )}
        </Card>

        {/* Conflict Warning */}
        {conflictMessage && (
          <Card style={[styles.p16, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
            <View style={[styles.row, styles.gap12]}>
              <X size={20} color="#dc2626" />
              <Text size="sm" color="#dc2626">
                {conflictMessage}
              </Text>
            </View>
          </Card>
        )}

        {/* Price Summary */}
        {selectedPlanData && selectedPackageData && (
          <Card style={[styles.p16, { 
            backgroundColor: selectedPlanData.isCoveredBySubscription ? '#eff6ff' : '#f0fdf4', 
            borderColor: selectedPlanData.isCoveredBySubscription ? '#3b82f6' : '#16a34a' 
          }]}>
            <Text variant="body" color="#111827" style={styles.mb8}>
              {t('reservation.summary')}
            </Text>
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="sm" color="#6b7280">{t('reservation.plan')}</Text>
              <Text size="sm" color="#111827">{selectedPlanData.name}</Text>
            </View>
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="sm" color="#6b7280">{t('reservation.package')}</Text>
              <Text size="sm" color="#111827">{selectedPackageData.label}</Text>
            </View>
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="sm" color="#6b7280">{t('reservation.dateTime')}</Text>
              <Text size="sm" color="#111827">{selectedDate} à {selectedTime}</Text>
            </View>
            {selectedPlanData.subscriptionCoverage && (
              <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
                <Text size="sm" color="#6b7280">{t('reservation.coverage')}</Text>
                <Text size="sm" color={selectedPlanData.isCoveredBySubscription ? "#3b82f6" : "#f59e0b"}>
                  {getPriceMessage()}
                </Text>
              </View>
            )}
            <View style={[styles.row, styles.spaceBetween, { paddingTop: 8, borderTopWidth: 1, borderTopColor: selectedPlanData.isCoveredBySubscription ? '#dbeafe' : '#d1fae5' }]}>
              <Text variant="body" color="#111827">{t('reservation.price')}</Text>
              <Text variant="body" color={selectedPlanData.isCoveredBySubscription ? "#3b82f6" : "#16a34a"} weight="bold">
                {getPrice() === 0 ? t('reservation.free') : `${getPrice().toLocaleString()} XOF`}
              </Text>
            </View>
          </Card>
        )}

        {/* Submit Button */}
        <Button 
          onPress={handleSubmit}
          disabled={isSubmitting || !selectedPlan || !selectedPackage || !selectedDate || !selectedTime || !!conflictMessage}
          fullWidth
          style={{ 
            backgroundColor: selectedPlanData?.isCoveredBySubscription ? '#3b82f6' : '#16a34a',
            opacity: (isSubmitting || !selectedPlan || !selectedPackage || !selectedDate || !selectedTime || !!conflictMessage) ? 0.6 : 1
          }}
        >
          <Check size={16} color="white" />
          <Text style={styles.ml8} color="white">
            {isSubmitting ? t('reservation.creating') : t('reservation.confirm')}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
}