/* eslint-disable react/no-unescaped-entities */
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
import { walletService } from '@/services/walletService';
import { Clock, ArrowLeft, Check, Crown, Info, Calendar, Timer, Shield } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, TouchableOpacity, View, Platform, Modal, TouchableWithoutFeedback, TextInput } from 'react-native';
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
  const [depositInfo, setDepositInfo] = useState<any>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [tempDateTime, setTempDateTime] = useState<Date>(new Date());
  const [showWebPicker, setShowWebPicker] = useState(false);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  useEffect(() => {
    loadUserData();
    checkDeposit();
  }, []);

  const loadUserData = async () => {
    try {
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkDeposit = async () => {
    try {
      const depositInfo = await walletService.getDepositInfo();
      setDepositInfo(depositInfo);
      
      // Stocker l'info de caution dans l'état
      if (!depositInfo.canUseService) {
        console.log(`Caution insuffisante. Nécessaire: ${depositInfo.requiredDeposit} FCFA, Actuel: ${depositInfo.currentDeposit} FCFA`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la caution:', error);
    }
  };

  const getMaxDateTime = (): Date => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now;
  };

  const getMinDateTime = (): Date => {
    return new Date();
  };

  const handleWebDateTimeChange = (type: 'date' | 'time', value: string) => {
    const newDate = new Date(tempDateTime);
    
    if (type === 'date') {
      const [year, month, day] = value.split('-').map(Number);
      newDate.setFullYear(year, month - 1, day);
    } else {
      const [hours, minutes] = value.split(':').map(Number);
      newDate.setHours(hours, minutes);
    }
    
    setTempDateTime(newDate);
  };

  const confirmWebSelection = () => {
    const now = new Date();
    const maxTime = getMaxDateTime();
    
    if (tempDateTime < now || tempDateTime > maxTime) {
      toast.error('La réservation doit être dans les 15 prochaines minutes');
      return;
    }
    
    setSelectedDateTime(tempDateTime);
    setShowWebPicker(false);
    haptics.light();
  };

  // Fonction pour ouvrir le picker selon la plateforme
  const openMobilePicker = useCallback(() => {
    haptics.light();
    
    if (Platform.OS === 'android') {
      setTempDateTime(selectedDateTime || new Date());
      setShowAndroidPicker(true);
    } else {
      setShowTimePicker(true);
    }
  }, [selectedDateTime]);

  const handleIOSDateTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    
    if (event.type === 'set' && date) {
      const now = new Date();
      const maxTime = getMaxDateTime();
      
      if (date < now || date > maxTime) {
        toast.error('La réservation doit être dans les 15 prochaines minutes');
        return;
      }
      
      setSelectedDateTime(date);
      haptics.light();
    }
  };

  const handleAndroidDateChange = (text: string) => {
    const parts = text.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const newDate = new Date(tempDateTime);
        newDate.setFullYear(year, month, day);
        setTempDateTime(newDate);
      }
    }
  };

  const handleAndroidTimeChange = (text: string) => {
    const parts = text.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      
      if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const newDate = new Date(tempDateTime);
        newDate.setHours(hours, minutes);
        setTempDateTime(newDate);
      }
    }
  };

  const confirmAndroidSelection = () => {
    const now = new Date();
    const maxTime = getMaxDateTime();
    
    if (tempDateTime < now || tempDateTime > maxTime) {
      toast.error('La réservation doit être dans les 15 prochaines minutes');
      return;
    }
    
    setSelectedDateTime(tempDateTime);
    setShowAndroidPicker(false);
    haptics.light();
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

      const depositInfo = await walletService.getDepositInfo();
    
      if (!depositInfo.canUseService) {
        haptics.error();
        toast.error(`Caution insuffisante. Minimum requis: ${depositInfo.requiredDeposit} FCFA`);
        // Optionnel: Rediriger vers la recharge de caution
        // onNavigate?.('recharge-deposit');
        setIsSubmitting(false);
        return;
      }
      
      const startDate = selectedDateTime.toISOString().split('T')[0];
      const startTime = selectedDateTime.toTimeString().split(' ')[0].substring(0, 5);

      const planId = bike.pricingPlan?.id || 'default';

      await reservationService.createReservation({
        bikeId: bike.id,
        planId: planId,
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

  const getReservationDuration = () => {
    return currentSubscription ? 'Inclus dans votre forfait' : '1 heure (minimum)';
  };

  // Picker pour Web
  const renderWebDateTimePicker = () => {
    const now = new Date();
    const maxTime = getMaxDateTime();
    
    return (
      <Modal
        visible={showWebPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWebPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowWebPicker(false)}>
          <View style={[
            styles.flex1,
            styles.justifyCenter,
            styles.alignCenter,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          ]}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[
                styles.rounded12,
                styles.p16,
                { width: '90%', maxWidth: 400, backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937' }
              ]}>
                <Text variant="subtitle" style={styles.mb16}>
                  Sélectionner la date et l'heure
                </Text>
                
                <View style={styles.mb16}>
                  <Label style={styles.mb8}>Date</Label>
                  <input
                    type="date"
                    value={tempDateTime.toISOString().split('T')[0]}
                    min={now.toISOString().split('T')[0]}
                    max={maxTime.toISOString().split('T')[0]}
                    onChange={(e) => handleWebDateTimeChange('date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${colorScheme === 'light' ? '#e5e7eb' : '#4b5563'}`,
                      backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151',
                      color: colorScheme === 'light' ? '#111827' : '#f9fafb',
                      fontSize: 16
                    }}
                  />
                </View>
                
                <View style={styles.mb24}>
                  <Label style={styles.mb8}>Heure</Label>
                  <input
                    type="time"
                    value={tempDateTime.toTimeString().split(' ')[0].substring(0, 5)}
                    onChange={(e) => handleWebDateTimeChange('time', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${colorScheme === 'light' ? '#e5e7eb' : '#4b5563'}`,
                      backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151',
                      color: colorScheme === 'light' ? '#111827' : '#f9fafb',
                      fontSize: 16
                    }}
                  />
                </View>
                
                <View style={[styles.row, styles.gap12]}>
                  <Button
                    onPress={() => setShowWebPicker(false)}
                    variant="outline"
                    style={styles.flex1}
                  >
                    <Text>Annuler</Text>
                  </Button>
                  <Button
                    onPress={confirmWebSelection}
                    style={[styles.flex1, { backgroundColor: '#16a34a' }]}
                  >
                    <Text color="white">Confirmer</Text>
                  </Button>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // Picker personnalisé pour Android avec composants React Native
  const renderAndroidDateTimePicker = () => {
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    return (
      <Modal
        visible={showAndroidPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAndroidPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAndroidPicker(false)}>
          <View style={[
            styles.flex1,
            styles.justifyCenter,
            styles.alignCenter,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          ]}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[
                styles.rounded12,
                styles.p16,
                { width: '90%', maxWidth: 400, backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937' }
              ]}>
                <Text variant="subtitle" style={styles.mb16}>
                  Sélectionner la date et l'heure
                </Text>
                
                <View style={styles.mb16}>
                  <Label style={styles.mb8}>Date (DD/MM/YYYY)</Label>
                  <View style={[
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
                  ]}>
                    <Calendar size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                    <TextInput
                      value={formatDate(tempDateTime)}
                      onChangeText={handleAndroidDateChange}
                      placeholder="JJ/MM/AAAA"
                      placeholderTextColor={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
                      style={[
                        styles.flex1,
                        { 
                          color: colorScheme === 'light' ? '#111827' : '#f9fafb',
                          fontSize: 16
                        }
                      ]}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={styles.mb24}>
                  <Label style={styles.mb8}>Heure (HH:MM)</Label>
                  <View style={[
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
                  ]}>
                    <Timer size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                    <TextInput
                      value={formatTime(tempDateTime)}
                      onChangeText={handleAndroidTimeChange}
                      placeholder="HH:MM"
                      placeholderTextColor={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
                      style={[
                        styles.flex1,
                        { 
                          color: colorScheme === 'light' ? '#111827' : '#f9fafb',
                          fontSize: 16
                        }
                      ]}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={[styles.row, styles.gap12]}>
                  <Button
                    onPress={() => setShowAndroidPicker(false)}
                    variant="outline"
                    style={styles.flex1}
                  >
                    <Text>Annuler</Text>
                  </Button>
                  <Button
                    onPress={confirmAndroidSelection}
                    style={[styles.flex1, { backgroundColor: '#16a34a' }]}
                  >
                    <Text color="white">Confirmer</Text>
                  </Button>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
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

        {/* Avertissement caution */}
        {depositInfo && !depositInfo.canUseService && (
          <Card style={[styles.p16, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
            <View style={[styles.row, styles.gap12]}>
              <Shield size={20} color="#dc2626" />
              <View style={styles.flex1}>
                <Text size="sm" color="#991b1b" weight="bold">
                  Service bloqué - Caution insuffisante
                </Text>
                <Text size="sm" color="#991b1b" style={styles.mt4}>
                  {`Minimum requis: ${depositInfo.requiredDeposit} FCFA`}
                </Text>
                <Text size="sm" color="#991b1b">
                  {`Votre caution actuelle: ${depositInfo.currentDeposit} FCFA`}
                </Text>
                <Button
                  variant="outline"
                  //onPress={() => onNavigate?.('recharge-deposit')}
                  style={[styles.mt8, { borderColor: '#dc2626' }]}
                  fullWidth
                >
                  <Text color="#dc2626">Recharger la caution</Text>
                </Button>
              </View>
            </View>
          </Card>
        )}

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

        <Card style={styles.p16}>
          <Label style={styles.mb8}>Heure de début de réservation</Label>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb12}>
            Choisissez une heure dans les 15 prochaines minutes
          </Text>
          
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'web') {
                setTempDateTime(selectedDateTime || new Date());
                setShowWebPicker(true);
                haptics.light();
              } else {
                openMobilePicker();
              }
            }}
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

          {/* Picker pour iOS uniquement */}
          {showTimePicker && Platform.OS === 'ios' && (
            <DateTimePicker
              value={selectedDateTime}
              mode="datetime"
              display="spinner"
              minimumDate={getMinDateTime()}
              maximumDate={getMaxDateTime()}
              onChange={handleIOSDateTimeChange}
              textColor={colorScheme === 'light' ? '#111827' : '#f9fafb'}
            />
          )}
        </Card>

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

        <Button 
          onPress={handleSubmit}
          disabled={isSubmitting || !selectedDateTime}
          fullWidth
          style={{ 
            backgroundColor: '#16a34a',
            opacity: (isSubmitting || !selectedDateTime || (depositInfo && !depositInfo.canUseService)) ? 0.6 : 1
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

      {Platform.OS === 'web' && renderWebDateTimePicker()}
      {Platform.OS === 'android' && renderAndroidDateTimePicker()}
    </View>
  );
}