import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { reservationService } from '@/services/reservationService';
import { Calendar, Clock, ArrowLeft, Check, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileBikeReservationProps {
  bike: any;
  onBack: () => void;
  onReservationComplete: () => void;
}

export function MobileBikeReservation({ bike, onBack, onReservationComplete }: MobileBikeReservationProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [conflictMessage, setConflictMessage] = useState('');

  useEffect(() => {
    loadAvailablePlans();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      checkAvailability();
    }
  }, [selectedDate, selectedTime, selectedPackage]);

  const loadAvailablePlans = async () => {
    try {
      // Charger les plans disponibles depuis l'API
      const plans = await reservationService.getAvailablePlans();
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error loading plans:', error);
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
        setConflictMessage('Une réservation existe déjà pour cette période');
      } else {
        setConflictMessage('');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const packageOptions = [
    { value: 'hourly', label: 'Forfait Horaire', duration: '1-24h' },
    { value: 'daily', label: 'Forfait Journalier', duration: '1 jour' },
    { value: 'weekly', label: 'Forfait Hebdomadaire', duration: '7 jours' },
    { value: 'monthly', label: 'Forfait Mensuel', duration: '30 jours' }
  ];

  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    value: `${i.toString().padStart(2, '0')}:00`,
    label: `${i.toString().padStart(2, '0')}:00`
  }));

  const handleSubmit = async () => {
    if (!selectedPlan || !selectedPackage || !selectedDate || !selectedTime) {
      toast.error('Veuillez remplir tous les champs');
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
      toast.success('Réservation créée avec succès');
      onReservationComplete();
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || 'Erreur lors de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlanData = availablePlans.find(p => p.id === selectedPlan);
  const selectedPackageData = packageOptions.find(p => p.value === selectedPackage);
  
  const getPrice = () => {
    if (!selectedPlanData || !selectedPackage) return 0;
    
    switch (selectedPackage) {
      case 'hourly': return selectedPlanData.hourlyRate;
      case 'daily': return selectedPlanData.dailyRate;
      case 'weekly': return selectedPlanData.weeklyRate;
      case 'monthly': return selectedPlanData.monthlyRate;
      default: return 0;
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
        {/* Plan Selection */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>Plan Tarifaire *</Label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger placeholder="Sélectionner un plan">
              <SelectValue placeholder="Sélectionner un plan" />
            </SelectTrigger>
            <SelectContent>
              {availablePlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  <Text>{plan.name}</Text>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Package Type */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>Type de Forfait *</Label>
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
                    {option.value === 'hourly' && `${selectedPlanData.hourlyRate} XOF/h`}
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
          <Label style={styles.mb8}>Date de début *</Label>
          <TouchableOpacity
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
            <Input
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD"
              style={[{ flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
            />
          </TouchableOpacity>
        </Card>

        {/* Time Selection */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>Heure de début *</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger>
              <Clock size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
              <SelectValue placeholder="Sélectionner l'heure" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  <Text>{slot.label}</Text>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
            <Text variant="body" color="#111827" style={styles.mb8}>
              Résumé de la réservation
            </Text>
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="sm" color="#6b7280">Plan :</Text>
              <Text size="sm" color="#111827">{selectedPlanData.name}</Text>
            </View>
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="sm" color="#6b7280">Forfait :</Text>
              <Text size="sm" color="#111827">{selectedPackageData.label}</Text>
            </View>
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="sm" color="#6b7280">Date/Heure :</Text>
              <Text size="sm" color="#111827">{selectedDate} à {selectedTime}</Text>
            </View>
            <View style={[styles.row, styles.spaceBetween, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#d1fae5' }]}>
              <Text variant="body" color="#111827">Prix :</Text>
              <Text variant="body" color="#16a34a" weight="bold">
                {getPrice()} XOF
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
            backgroundColor: '#16a34a',
            opacity: (isSubmitting || !selectedPlan || !selectedPackage || !selectedDate || !selectedTime || !!conflictMessage) ? 0.6 : 1
          }}
        >
          <Check size={16} color="white" />
          <Text style={styles.ml8} color="white">
            {isSubmitting ? 'Création...' : 'Confirmer la réservation'}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
}