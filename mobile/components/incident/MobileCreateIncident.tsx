/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { incidentService } from '@/services/incidentService';
import { reservationService } from '@/services/reservationService';
import { rideService } from '@/services/rideService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertTriangle, ArrowLeft, Camera, Save, X, Clock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileCreateIncidentProps {
  onBack: () => void;
  incidentId?: string;
  rideId?: string;
  bikeId?: string;
}

export function MobileCreateIncident({ onBack, incidentId, rideId, bikeId }: MobileCreateIncidentProps) {
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [selectedBike, setSelectedBike] = useState<string>(bikeId || '');
  const [incidentType, setIncidentType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBikes, setAvailableBikes] = useState<any[]>([]);
  const [existingIncident, setExistingIncident] = useState<any>(null);
  const [isLoadingBikes, setIsLoadingBikes] = useState(true);

  const incidentTypes = [
    { value: 'brakes', label: t('incident.brakes'), severity: 'critical' },
    { value: 'battery', label: t('incident.battery'), severity: 'high' },
    { value: 'tire', label: t('incident.tire'), severity: 'high' },
    { value: 'chain', label: t('incident.chain'), severity: 'medium' },
    { value: 'lights', label: t('incident.lights'), severity: 'medium' },
    { value: 'lock', label: t('incident.lock'), severity: 'high' },
    { value: 'electronics', label: t('incident.electronics'), severity: 'medium' },
    { value: 'physical_damage', label: t('incident.physicalDamage'), severity: 'high' },
    { value: 'theft', label: t('incident.theft'), severity: 'critical' },
    { value: 'other', label: t('incident.other'), severity: 'low' }
  ];

  const criticalTypes = ['brakes', 'theft', 'physical_damage', 'electronics'];

  useEffect(() => {
    loadAvailableBikes();
    
    if (incidentId) {
      loadExistingIncident();
    }
  }, []);

  const loadAvailableBikes = async () => {
    try {
      setIsLoadingBikes(true);
      const bikes: any[] = [];
      
      // 1. Vélo réservé actuel
      try {
        const reservations = await reservationService.getUserReservations();
        const activeReservation = reservations?.find((r: any) => 
          r.status === 'ACTIVE' && 
          new Date(r.startDate) <= new Date() && 
          new Date(r.endDate) >= new Date()
        );
        
        if (activeReservation?.bike) {
          bikes.push({ 
            ...activeReservation.bike, 
            source: 'reserved',
            sourceLabel: t('incident.bikeSource.reserved'),
            sourceDescription: `${t('common.reservedUntil')}: ${ new Date(activeReservation.endDate).toLocaleDateString() }`,
            priority: 1
          });
        }
      } catch (error) {
        console.log('No reserved bike found');
      }
      
      // 2. Vélo actuel (trajet en cours)
      try {
        const activeRide = await rideService.getActiveRide();
        if (activeRide?.bike && !bikes.find(b => b.id === activeRide.bike?.id)) {
          bikes.push({ 
            ...activeRide.bike, 
            source: 'current',
            sourceLabel: t('incident.bikeSource.current'),
            sourceDescription: `${t('common.rideStartedAt')}: ${ new Date(activeRide.startTime).toLocaleTimeString() }`,
            priority: 0,
            rideId: activeRide.id
          });
        }
      } catch (error) {
        console.log('No active ride found');
      }
      
      // 3. Dernier vélo utilisé (le plus récent dans l'historique)
      try {
        const recentRides = await rideService.getUserRides({ 
          page: 1, 
          limit: 3, 
          status: 'COMPLETED' 
        });
        
        if (recentRides.rides.length > 0) {
          for (const ride of recentRides.rides) {
            if (ride.bike && !bikes.find(b => b.id === ride.bike?.id)) {
              bikes.push({ 
                ...ride.bike, 
                source: 'recent',
                sourceLabel: t('incident.bikeSource.recent'),
                sourceDescription: `${t('common.lastRide')}: ${ new Date(ride.endTime || ride.startTime).toLocaleDateString() }`,
                priority: 2,
                lastRideDate: ride.endTime || ride.startTime
              });
              break;
            }
          }
        }
      } catch (error) {
        console.log('No recent rides found');
      }
      
      // Trier par priorité (current > reserved > recent)
      bikes.sort((a, b) => a.priority - b.priority);
      
      setAvailableBikes(bikes);
      
      // Auto-sélectionner le premier vélo disponible
      if (!selectedBike && bikes.length > 0) {
        setSelectedBike(bikes[0].id);
      }
      
    } catch (error) {
      console.error('Error loading available bikes:', error);
      toast.error(t('error.loadingBikes'));
    } finally {
      setIsLoadingBikes(false);
    }
  };

  const loadExistingIncident = async () => {
    try {
      const incident = await incidentService.getIncident(incidentId!);
      setExistingIncident(incident);
      setSelectedBike(incident.bikeId || '');
      setIncidentType(incident.type);
      setDescription(incident.description);
    } catch (error) {
      console.error('Error loading incident:', error);
      toast.error(t('error.loadingIncident'));
    }
  };

  const handleAddPhoto = () => {
    if (photos.length < 5) {
      haptics.light();
      const newPhotos = [...photos, `photo-${Date.now()}.jpg`];
      setPhotos(newPhotos);
    } else {
      haptics.error();
      toast.error(t('incident.maxPhotos'));
    }
  };

  const handleRemovePhoto = (index: number) => {
    haptics.light();
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!selectedBike) {
      toast.error(t('incident.selectBike'));
      return;
    }
    
    if (!incidentType) {
      toast.error(t('incident.selectProblemType'));
      return;
    }
    
    if (!description.trim() || description.trim().length < 20) {
      toast.error(t('incident.minimumCharacters'));
      return;
    }

    try {
      setIsSubmitting(true);
      
      const incidentData = {
        bikeId: selectedBike,
        type: incidentType,
        description: description.trim(),
        photos: photos.length > 0 ? photos : undefined
      };

      if (incidentId) {
        await incidentService.updateIncident(incidentId, incidentData);
        toast.success(t('incident.updated'));
      } else {
        await incidentService.createIncident(incidentData);
        
        if (criticalTypes.includes(incidentType)) {
          toast.success(t('incident.criticalSuccess'));
        } else {
          toast.success(t('incident.success'));
        }
      }

      haptics.success();
      onBack();
      
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('error.occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeData = incidentTypes.find(type => type.value === incidentType);
  const selectedBikeData = availableBikes.find(bike => bike.id === selectedBike);

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
          {incidentId ? t('incident.edit.title') : t('incident.create.title')}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading state for bikes */}
        {isLoadingBikes && (
          <Card style={[styles.p16, styles.alignCenter]}>
            <Clock size={24} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} style={styles.mb8} />
            <Text color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
              {t('common.loadingBikes')}
            </Text>
          </Card>
        )}

        {/* Bike Selection */}
        {!isLoadingBikes && (
          <Card style={styles.p16}>
            <Label style={styles.mb8}>{t('incident.selectBike')}</Label>
            
            {availableBikes.length > 0 ? (
              <View style={styles.gap8}>
                {availableBikes.map((bike) => (
                  <TouchableOpacity
                    key={bike.id}
                    onPress={() => {
                      setSelectedBike(bike.id);
                      haptics.light();
                    }}
                    style={[
                      styles.p12,
                      styles.rounded8,
                      {
                        backgroundColor: selectedBike === bike.id 
                          ? '#f0fdf4' 
                          : (colorScheme === 'light' ? '#f9fafb' : '#374151'),
                        borderWidth: selectedBike === bike.id ? 2 : 1,
                        borderColor: selectedBike === bike.id 
                          ? '#16a34a' 
                          : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563')
                      }
                    ]}
                  >
                    <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                      <View>
                        <Text 
                          variant="body" 
                          color={selectedBike === bike.id ? '#16a34a' : (colorScheme === 'light' ? '#111827' : '#f9fafb')}
                          weight="bold"
                        >
                          {bike.code} - {bike.model}
                        </Text>
                        <Text size="sm" color="#16a34a" style={styles.mt4}>
                          {bike.sourceLabel}
                        </Text>
                        <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                          {bike.sourceDescription}
                        </Text>
                      </View>
                      {selectedBike === bike.id && (
                        <View style={[
                          styles.w20,
                          styles.h20,
                          styles.rounded12,
                          styles.alignCenter,
                          styles.justifyCenter,
                          { backgroundColor: '#16a34a' }
                        ]}>
                          <Text color="white" size="xs">✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Card style={[styles.p16, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
                <View style={[styles.row, styles.gap12]}>
                  <AlertTriangle size={20} color="#f59e0b" />
                  <Text size="sm" color="#92400e">
                    {t('incident.noBikes.title')}
                    {'\n\n'}{t('incident.noBikes.requirements')}
                  </Text>
                </View>
              </Card>
            )}
          </Card>
        )}

        {/* Incident Type */}
        {availableBikes.length > 0 && (
          <Card style={styles.p16}>
            <Label style={styles.mb8}>{t('incident.selectProblemType')}</Label>
            <View style={styles.gap8}>
              {incidentTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => {
                    setIncidentType(type.value);
                    haptics.light();
                  }}
                  style={[
                    styles.row,
                    styles.spaceBetween,
                    styles.alignCenter,
                    styles.p12,
                    styles.rounded8,
                    {
                      backgroundColor: incidentType === type.value 
                        ? (type.severity === 'critical' ? '#fef2f2' : '#f0fdf4')
                        : (colorScheme === 'light' ? '#f9fafb' : '#374151'),
                      borderWidth: incidentType === type.value ? 2 : 1,
                      borderColor: incidentType === type.value 
                        ? (type.severity === 'critical' ? '#dc2626' : '#16a34a') 
                        : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563')
                    }
                  ]}
                >
                  <View>
                    <Text 
                      variant="body" 
                      color={incidentType === type.value 
                        ? (type.severity === 'critical' ? '#dc2626' : '#16a34a')
                        : (colorScheme === 'light' ? '#111827' : '#f9fafb')
                      }
                    >
                      {type.label}
                    </Text>
                    {type.severity === 'critical' && (
                      <Text size="xs" color="#dc2626" style={styles.mt4}>
                        {t('incident.severity.critical')}
                      </Text>
                    )}
                  </View>
                  {type.severity === 'critical' && (
                    <AlertTriangle size={20} color="#dc2626" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Description */}
        {availableBikes.length > 0 && (
          <Card style={styles.p16}>
            <Label style={styles.mb8}>{t('incident.detailedDescription')}</Label>
            <Textarea
              value={description}
              onChangeText={setDescription}
              placeholder={t('incident.descriptionPlaceholder')}
              style={[
                styles.mt8,
                { height: 120 },
                description.trim().length > 0 && description.trim().length < 20 && { borderColor: '#f59e0b', borderWidth: 2 }
              ]}
            />
            <View style={[styles.row, styles.spaceBetween, styles.mt4]}>
              <Text 
                size="xs" 
                color={description.trim().length < 20 ? '#f59e0b' : '#6b7280'}
              >
                {description.trim().length < 20 ? t('incident.minimumCharacters') : t('incident.sufficientDescription')}
              </Text>
              <Text size="xs" color="#6b7280">
                {description.length}/1000
              </Text>
            </View>
          </Card>
        )}

        {/* Warning for critical incidents */}
        {selectedTypeData?.severity === 'critical' && availableBikes.length > 0 && (
          <Card style={[styles.p16, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
            <View style={[styles.row, styles.gap12]}>
              <AlertTriangle size={20} color="#dc2626" />
              <View style={styles.flex1}>
                <Text size="sm" color="#991b1b" weight="bold">
                  {t('incident.criticalWarning.title')}
                </Text>
                <Text size="sm" color="#991b1b" style={styles.mt4}>
                  {t('incident.criticalWarning.description')}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Photos */}
        {availableBikes.length > 0 && (
          <Card style={styles.p16}>
            <Label style={styles.mb8}>
              {t('incident.photos')} {criticalTypes.includes(incidentType) ? t('incident.photosStronglyRecommended') : t('incident.photosOptional')}
            </Label>
            <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb12}>
              {criticalTypes.includes(incidentType)
                ? t('incident.photosHelpCritical')
                : t('incident.photosHelpGeneral')}
            </Text>
            
            {/* Photo Grid */}
            <View style={[styles.row, { flexWrap: 'wrap' }, styles.gap8, styles.mb12]}>
              {photos.map((photo, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.relative,
                    { width: 100, height: 100 },
                    styles.rounded8,
                    styles.alignCenter,
                    styles.justifyCenter,
                    { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
                  ]}
                >
                  <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                    {`${t('common.photo')}: ${ index + 1 }`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(index)}
                    style={[
                      styles.absolute,
                      { top: 4, right: 4 },
                      styles.w24,
                      styles.h24,
                      styles.rounded12,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { backgroundColor: '#ef4444' }
                    ]}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {photos.length < 5 && (
              <Button 
                variant="outline" 
                onPress={handleAddPhoto}
                fullWidth
              >
                <Camera size={16} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
                <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                  {t('incident.addPhoto')}
                </Text>
              </Button>
            )}
          </Card>
        )}

        {/* Submit Button */}
        {availableBikes.length > 0 && (
          <Button 
            onPress={handleSubmit}
            disabled={isSubmitting || !selectedBike || !incidentType || description.trim().length < 20}
            fullWidth
            style={{ 
              backgroundColor: '#16a34a',
              opacity: (isSubmitting || !selectedBike || !incidentType || description.trim().length < 20) ? 0.6 : 1
            }}
          >
            <Save size={16} color="white" />
            <Text style={styles.ml8} color="white">
              {isSubmitting 
                ? (incidentId ? t('incident.updating') : t('incident.creating')) 
                : (incidentId ? t('incident.update') : t('incident.submit'))
              }
            </Text>
          </Button>
        )}

        {/* Help Text */}
        <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
          {availableBikes.length === 0 
            ? t('incident.help.noBikes')
            : t('incident.help.withBikes')
          }
        </Text>

        {/* Selected bike info */}
        {selectedBikeData && (
          <Card style={[styles.p12, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
            <Text size="sm" color="#16a34a">
              {t('common.selectedBike')}: {selectedBikeData.code} ({selectedBikeData.sourceLabel})
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}