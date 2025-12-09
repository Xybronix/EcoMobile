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
import { Clock, ArrowLeft, Check, Crown, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileBikeReservationProps {
  bike: any;
  onBack: () => void;
  onReservationComplete: () => void;
}

export function MobileBikeReservation({ bike, onBack, onReservationComplete }: MobileBikeReservationProps) {
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Charger l'abonnement actif
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Calculer la date/heure maximale (15 minutes à partir de maintenant)
  const getMaxDateTime = (): Date => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now;
  };

  // Calculer la date/heure minimale (maintenant)
  const getMinDateTime = (): Date => {
    return new Date();
  };

  const handleSubmit = async () => {
    if (!selectedDateTime) {
      toast.error(t('reservation.fillAllFields'));
      return;
    }

    const now = new Date();
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);
    
    if (selectedDateTime < now || selectedDateTime > fifteenMinutesLater) {
      toast.error('La réservation doit être dans les 15 prochaines minutes');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const startDate = selectedDateTime.toISOString().split('T')[0];
      const startTime = selectedDateTime.toTimeString().split(' ')[0].substring(0, 5);

      await reservationService.createReservation({
        bikeId: bike.id,
        planId: 'default',
        packageType: 'hourly',
        startDate,
        startTime
      });

      haptics.success();
      toast.success('Réservation confirmée pour les 15 prochaines minutes');
      onReservationComplete();
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('reservation.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculer la durée de la réservation (1 heure minimum)
  const getReservationDuration = () => {
    return currentSubscription ? 'Inclus dans votre forfait' : '1 heure (minimum)';
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
        {/* Information sur la réservation */}
        <Card style={[styles.p16, { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]}>
          <View style={[styles.row, styles.gap12]}>
            <Info size={20} color="#3b82f6" />
            <View style={styles.flex1}>
              <Text variant="body" color="#1e40af" weight="bold">
                Réservation limitée à 15 minutes
              </Text>
              <Text size="sm" color="#1e40af" style={styles.mt4}>
                • Vous ne pouvez réserver que pour les 15 prochaines minutes
              </Text>
              <Text size="sm" color="#1e40af">
                • La réservation rend le vélo indisponible pendant cette période
              </Text>
              <Text size="sm" color="#1e40af">
                • Durée : {getReservationDuration()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Subscription Status */}
        {currentSubscription && (
          <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
            <View style={[styles.row, styles.gap12]}>
              <Crown size={20} color="#16a34a" />
              <View style={styles.flex1}>
                <Text variant="body" color="#166534" weight="bold">
                  {`Forfait actif: ${ currentSubscription.planName }`}
                </Text>
                <Text size="sm" color="#166534">
                  {`Valide jusqu'au ${ 
                    new Date(currentSubscription.endDate).toLocaleDateString()
                  }`}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Sélection de l'heure */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>Heure de début de réservation</Label>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb12}>
            Choisissez une heure dans les 15 prochaines minutes
          </Text>
          
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
            <Text color={selectedDateTime ? (colorScheme === 'light' ? '#111827' : '#f9fafb') : '#6b7280'}>
              {selectedDateTime ? selectedDateTime.toLocaleString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : 'Sélectionner une heure'}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedDateTime}
              mode="datetime"
              display="default"
              minimumDate={getMinDateTime()}
              maximumDate={getMaxDateTime()}
              onChange={(event, date) => {
                setShowTimePicker(false);
                if (date) {
                  setSelectedDateTime(date);
                }
              }}
            />
          )}
        </Card>

        {/* Récapitulatif */}
        <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
          <Text variant="body" color="#111827" style={styles.mb8}>
            Récapitulatif
          </Text>
          <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
            <Text size="sm" color="#6b7280">Vélo</Text>
            <Text size="sm" color="#111827">{bike.code}</Text>
          </View>
          <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
            <Text size="sm" color="#6b7280">Date/heure</Text>
            <Text size="sm" color="#111827">
              {selectedDateTime ? selectedDateTime.toLocaleString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
              }) : 'Non sélectionné'}
            </Text>
          </View>
          <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
            <Text size="sm" color="#6b7280">Durée</Text>
            <Text size="sm" color="#111827">
              {currentSubscription ? 'Incluse dans forfait' : '1 heure (minimum)'}
            </Text>
          </View>
          <View style={[styles.row, styles.spaceBetween, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#d1fae5' }]}>
            <Text variant="body" color="#111827">Statut</Text>
            <Text variant="body" color="#16a34a" weight="bold">
              {currentSubscription ? 'Gratuit' : 'À payer après usage'}
            </Text>
          </View>
        </Card>

        {/* Submit Button */}
        <Button 
          onPress={handleSubmit}
          disabled={isSubmitting || !selectedDateTime}
          fullWidth
          style={{ 
            backgroundColor: '#16a34a',
            opacity: (isSubmitting || !selectedDateTime) ? 0.6 : 1
          }}
        >
          <View style={[styles.row, styles.gap8, styles.alignCenter]}>
            <Check size={16} color="white" />
            <Text style={styles.ml8} color="white">
              {isSubmitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
            </Text>
          </View>
        </Button>
      </ScrollView>
    </View>
  );
}