/* eslint-disable react/no-unescaped-entities */
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { incidentService } from '@/services/incidentService';
import { reservationService } from '@/services/reservationService';
import { rideService } from '@/services/rideService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertTriangle, ArrowLeft, Camera, Save, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { useMobileAuth } from '@/lib/mobile-auth';

interface MobileCreateIncidentProps {
  onBack: () => void;
  incidentId?: string; // Pour modification
  rideId?: string; // Si signalement depuis un trajet en cours
  bikeId?: string; // Si signalement pour un vélo spécifique
}

export function MobileCreateIncident({ onBack, incidentId, rideId, bikeId }: MobileCreateIncidentProps) {
  const { t, language } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [selectedBike, setSelectedBike] = useState<string>('');
  const [incidentType, setIncidentType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBikes, setAvailableBikes] = useState<any[]>([]);
  const [existingIncident, setExistingIncident] = useState<any>(null);

  const incidentTypes = [
    { value: 'brakes', label: 'Problème de freins', severity: 'critical' },
    { value: 'battery', label: 'Problème de batterie', severity: 'high' },
    { value: 'tire', label: 'Problème de pneu', severity: 'high' },
    { value: 'chain', label: 'Problème de chaîne', severity: 'medium' },
    { value: 'lights', label: 'Problème de lumières', severity: 'medium' },
    { value: 'lock', label: 'Problème de cadenas', severity: 'high' },
    { value: 'electronics', label: 'Problème électronique', severity: 'medium' },
    { value: 'physical_damage', label: 'Dégât physique', severity: 'high' },
    { value: 'theft', label: 'Vol ou tentative de vol', severity: 'critical' },
    { value: 'other', label: 'Autre problème', severity: 'low' }
  ];

  const criticalTypes = ['brakes', 'theft', 'physical_damage'];

  useEffect(() => {
    loadAvailableBikes();
    
    if (incidentId) {
      loadExistingIncident();
    }
    
    if (bikeId) {
      setSelectedBike(bikeId);
    }
  }, []);

  const loadAvailableBikes = async () => {
    try {
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
            reservationId: activeReservation.id 
          });
        }
      } catch (error) {
        console.log('No reserved bike found');
      }
      
      // 2. Vélo actuel (trajet en cours)
      try {
        const activeRide = await rideService.getActiveRide();
        if (activeRide?.bike) {
          bikes.push({ 
            ...activeRide.bike, 
            source: 'current', 
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
          limit: 1, 
          status: 'COMPLETED' 
        });
        
        if (recentRides.rides.length > 0 && recentRides.rides[0].bike) {
          bikes.push({ 
            ...recentRides.rides[0].bike, 
            source: 'recent',
            lastRideDate: recentRides.rides[0].endTime || recentRides.rides[0].startTime
          });
        }
      } catch (error) {
        console.log('No recent rides found');
      }
      
      // Dédupliquer par ID de vélo
      const uniqueBikes = bikes.filter((bike, index, self) => 
        index === self.findIndex(b => b.id === bike.id)
      );
      
      setAvailableBikes(uniqueBikes);
      
      // Auto-sélectionner le premier vélo disponible
      if (!selectedBike && uniqueBikes.length > 0) {
        setSelectedBike(uniqueBikes[0].id);
      }
      
    } catch (error) {
      console.error('Error loading available bikes:', error);
      toast.error('Erreur lors du chargement des vélos disponibles');
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
      toast.error('Erreur lors du chargement du signalement');
    }
  };

  const handleAddPhoto = () => {
    if (photos.length < 5) {
      haptics.light();
      const newPhotos = [...photos, `photo-${Date.now()}.jpg`];
      setPhotos(newPhotos);
    } else {
      haptics.error();
      toast.error('Maximum 5 photos autorisées');
    }
  };

  const handleRemovePhoto = (index: number) => {
    haptics.light();
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!selectedBike) {
      toast.error('Veuillez sélectionner un vélo');
      return;
    }
    
    if (!incidentType) {
      toast.error('Veuillez sélectionner le type de problème');
      return;
    }
    
    if (!description.trim() || description.trim().length < 20) {
      toast.error('La description doit contenir au moins 20 caractères');
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
        toast.success('Signalement mis à jour');
      } else {
        const newIncident = await incidentService.createIncident(incidentData);
        
        // Les problèmes critiques sont automatiquement gérés par le backend
        // pour mettre le vélo en maintenance
        if (criticalTypes.includes(incidentType)) {
          toast.success('Signalement créé. Le vélo a été mis en maintenance pour sécurité.');
        } else {
          toast.success('Signalement créé avec succès');
        }
      }

      haptics.success();
      onBack();
      
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || 'Erreur lors de la création du signalement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBikeSourceLabel = (source: string) => {
    switch (source) {
      case 'reserved': return 'Vélo réservé';
      case 'current': return 'Trajet en cours';
      case 'recent': return 'Récemment utilisé';
      default: return '';
    }
  };

  const selectedTypeData = incidentTypes.find(type => type.value === incidentType);

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
          {incidentId ? 'Modifier le signalement' : 'Signaler un problème'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Bike Selection */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>Vélo concerné *</Label>
          
          {availableBikes.length > 0 ? (
            <Select value={selectedBike} onValueChange={setSelectedBike}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un vélo" />
              </SelectTrigger>
              <SelectContent>
                {availableBikes.map((bike) => (
                  <SelectItem key={bike.id} value={bike.id}>
                    <View style={[styles.row, styles.spaceBetween, styles.alignCenter, { width: '100%' }]}>
                      <Text>{bike.code} - {bike.model}</Text>
                      <Text size="xs" color="#16a34a">
                        {getBikeSourceLabel(bike.source)}
                      </Text>
                    </View>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Card style={[styles.p16, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
              <View style={[styles.row, styles.gap12]}>
                <AlertTriangle size={20} color="#f59e0b" />
                <Text size="sm" color="#92400e">
                  Aucun vélo disponible pour signalement. Vous devez avoir réservé, utilisé ou être en cours d'utilisation d'un vélo.
                </Text>
              </View>
            </Card>
          )}
        </Card>

        {/* Incident Type */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>Type de problème *</Label>
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
                      ⚠️ Ce problème mettra le vélo en maintenance
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

        {/* Description */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>Description détaillée *</Label>
          <Textarea
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez le problème en détail (minimum 20 caractères)..."
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
              {description.trim().length < 20 ? 'Minimum 20 caractères requis' : ''}
            </Text>
            <Text size="xs" color="#6b7280">
              {description.length}/1000
            </Text>
          </View>
        </Card>

        {/* Warning for critical incidents */}
        {selectedTypeData?.severity === 'critical' && (
          <Card style={[styles.p16, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
            <View style={[styles.row, styles.gap12]}>
              <AlertTriangle size={20} color="#dc2626" />
              <View style={styles.flex1}>
                <Text size="sm" color="#991b1b" weight="bold">
                  Signalement critique
                </Text>
                <Text size="sm" color="#991b1b" style={styles.mt4}>
                  Ce type de problème mettra automatiquement le vélo en maintenance jusqu'à validation par un administrateur. Ceci est important pour la sécurité de tous les utilisateurs.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Photos */}
        <Card style={styles.p16}>
          <Label style={styles.mb8}>
            Photos {criticalTypes.includes(incidentType) ? '(recommandées)' : '(optionnelles)'}
          </Label>
          <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb12}>
            Ajoutez des photos pour nous aider à comprendre le problème
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
                  Photo {index + 1}
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
                Ajouter une photo
              </Text>
            </Button>
          )}
        </Card>

        {/* Submit Button */}
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
              ? (incidentId ? 'Modification...' : 'Création...') 
              : (incidentId ? 'Modifier le signalement' : 'Créer le signalement')
            }
          </Text>
        </Button>

        {availableBikes.length === 0 && (
          <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
            Pour signaler un problème, vous devez avoir un vélo réservé, être en cours de trajet, ou avoir récemment utilisé un vélo.
          </Text>
        )}

        {availableBikes.length > 0 && (
          <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
            Nous traiterons votre signalement dans les plus brefs délais. Vous recevrez une notification dès qu'il sera pris en charge.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}