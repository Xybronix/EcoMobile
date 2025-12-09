/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { subscriptionService } from '@/services/subscriptionService';
import { bikeRequestService } from '@/services/bikeRequestService';
import * as ImagePicker from 'expo-image-picker';
import { AlertTriangle, ArrowLeft, Camera, Check, X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileBikeInspectionProps {
  bikeId: string;
  bikeName: string;
  inspectionType: 'pickup' | 'return';
  bikeEquipment?: string[];
  onComplete: (data: InspectionData | { type: string; data: InspectionData }) => void;
  onBack: () => void;
}

interface InspectionData {
  condition: string;
  issues: string[];
  notes: string;
  photos: string[];
  metadata?: {
    inspection: {
      type: 'pickup' | 'return';
      condition: string;
      issues: string[];
      notes: string;
      photos: string[];
      inspectedAt: string;
      hasIssues: boolean;
    };
    paymentMethod: string;
  };
}

interface InspectionItem {
  id: string;
  label: { fr: string; en: string };
  isGood: boolean | null;
}

export function MobileBikeInspection({ bikeId, bikeName, inspectionType, bikeEquipment, onComplete, onBack }: MobileBikeInspectionProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCurrentSubscription();
    initializeInspectionItems();
  }, []);

  const loadCurrentSubscription = async () => {
    try {
      setIsLoading(true);
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
      setCurrentSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeInspectionItems = () => {
    const equipmentLabels: Record<string, { fr: string; en: string }> = {
      headlight: { fr: 'Phares avant', en: 'Headlight' },
      taillight: { fr: 'Feu arrière', en: 'Taillight' },
      basket: { fr: 'Panier', en: 'Basket' },
      rack: { fr: 'Porte-bagages', en: 'Rack' },
      bell: { fr: 'Sonnette', en: 'Bell' },
      mudguards: { fr: 'Garde-boue', en: 'Mudguards' },
      lock: { fr: 'Antivol', en: 'Lock' },
      reflectors: { fr: 'Réflecteurs', en: 'Reflectors' },
    };

    const baseItems: InspectionItem[] = [
      { id: 'brakes', label: { fr: 'Freins', en: 'Brakes' }, isGood: null },
      { id: 'tires', label: { fr: 'Pneus', en: 'Tires' }, isGood: null },
      { id: 'battery', label: { fr: 'Batterie', en: 'Battery' }, isGood: null },
      { id: 'chain', label: { fr: 'Chaîne', en: 'Chain' }, isGood: null },
      { id: 'seat', label: { fr: 'Selle', en: 'Seat' }, isGood: null },
      { id: 'handlebars', label: { fr: 'Guidon', en: 'Handlebars' }, isGood: null },
      { id: 'frame', label: { fr: 'Cadre', en: 'Frame' }, isGood: null }
    ];

    const equipmentItems: InspectionItem[] = (bikeEquipment || []).map(equipId => ({
      id: equipId,
      label: equipmentLabels[equipId] || { fr: equipId, en: equipId },
      isGood: null
    }));

    setInspectionItems([...baseItems, ...equipmentItems]);
  };

  const updateInspectionItem = (id: string, isGood: boolean) => {
    haptics.selection();
    setInspectionItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isGood } : item
      )
    );
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Ajouter une photo',
      'Choisissez une option',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appareil photo', onPress: () => handleAddPhoto('camera') },
        { text: 'Galerie', onPress: () => handleAddPhoto('library') }
      ]
    );
  };

  const handleAddPhoto = async (source: 'camera' | 'library') => {
    if (photos.length >= 5) {
      haptics.error();
      toast.error(t('inspection.maxPhotos'));
      return;
    }

    try {
      haptics.light();
      
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Permission caméra requise');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Permission galerie requise');
          return;
        }
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3] as [number, number],
        quality: 0.8,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        const newPhotos = [...photos, photoUri];
        setPhotos(newPhotos);
      }
      
    } catch (error) {
      console.error('Erreur lors de la capture de photo:', error);
      toast.error('Erreur lors de la capture de photo');
    }
  };

  const handleRemovePhoto = (index: number) => {
    haptics.light();
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleComplete = async () => {
    const allInspected = inspectionItems.every(item => item.isGood !== null);
    
    if (!allInspected) {
      haptics.error();
      toast.error(t('inspection.allItemsRequired'));
      return;
    }

    const issues = inspectionItems
      .filter(item => !item.isGood)
      .map(item => item.label[language]);

    const hasIssues = issues.length > 0;

    if (hasIssues && !notes.trim()) {
      haptics.error();
      toast.error(t('inspection.notesRequired'));
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const inspectionData = {
        condition: hasIssues ? 'damaged' : 'good',
        issues,
        notes,
        photos,
        metadata: {
          inspection: {
            type: inspectionType,
            condition: hasIssues ? 'damaged' : 'good',
            issues,
            notes,
            photos,
            inspectedAt: new Date().toISOString(),
            hasIssues
          },
          paymentMethod: currentSubscription ? 'SUBSCRIPTION' : 'WALLET'
        }
      };

      if (inspectionType === 'pickup') {
        await bikeRequestService.createUnlockRequest(bikeId, inspectionData.metadata);
        
        haptics.success();
        toast.success(t('unlock.requestSent'));
        onComplete({type: 'unlock_request_sent', data: inspectionData});
      } else {
        onComplete(inspectionData);
      }
      
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || 'Erreur lors de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allInspected = inspectionItems.every(item => item.isGood !== null);
  const hasIssues = inspectionItems.some(item => item.isGood === false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View 
        style={[
          styles.p16,
          styles.shadowLg,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
          }
        ]}
      >
        <View style={[styles.row, styles.alignCenter, styles.gap16]}>
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
              {t(`inspection.title.${inspectionType}`)}
            </Text>
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
              {bikeName}
            </Text>
            {currentSubscription && (
              <Text size="xs" color="#3b82f6" style={styles.mt4}>
                Forfait actif: {currentSubscription.planName}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Alert */}
        <Card style={[styles.p16, { backgroundColor: colorScheme === 'light' ? '#eff6ff' : '#1e3a8a', borderColor: '#3b82f6' }]}>
          <View style={[styles.row, styles.gap12]}>
            <AlertTriangle size={20} color="#3b82f6" style={{ marginTop: 2 }} />
            <View style={styles.flex1}>
              <Text size="sm" color="#1e40af">
                {t(`inspection.description.${inspectionType}`)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Inspection Items */}
        <Card style={styles.p16}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb16}>
            {t('inspection.checkItems')}
          </Text>
          <View style={styles.gap12}>
            {inspectionItems.map((item) => (
              <View 
                key={item.id} 
                style={[
                  styles.row, 
                  styles.spaceBetween, 
                  styles.alignCenter, 
                  styles.p12, 
                  styles.rounded8,
                  { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' }
                ]}
              >
                <Text size="sm" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                  {item.label[language]}
                </Text>
                <View style={[styles.row, styles.gap8]}>
                  <TouchableOpacity
                    onPress={() => updateInspectionItem(item.id, true)}
                    style={[
                      styles.w40,
                      styles.h40,
                      styles.rounded20,
                      styles.alignCenter,
                      styles.justifyCenter,
                      {
                        backgroundColor: item.isGood === true
                          ? '#16a34a'
                          : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563')
                      }
                    ]}
                  >
                    <Check 
                      size={20} 
                      color={item.isGood === true ? 'white' : (colorScheme === 'light' ? '#6b7280' : '#9ca3af')} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => updateInspectionItem(item.id, false)}
                    style={[
                      styles.w40,
                      styles.h40,
                      styles.rounded20,
                      styles.alignCenter,
                      styles.justifyCenter,
                      {
                        backgroundColor: item.isGood === false
                          ? '#ef4444'
                          : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563')
                      }
                    ]}
                  >
                    <X 
                      size={20} 
                      color={item.isGood === false ? 'white' : (colorScheme === 'light' ? '#6b7280' : '#9ca3af')} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Progress */}
        <Card style={styles.p16}>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb8]}>
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
              {t('inspection.progress')}
            </Text>
            <Text size="sm" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {inspectionItems.filter(item => item.isGood !== null).length} / {inspectionItems.length}
            </Text>
          </View>
          <View 
            style={[
              styles.wT100,
              { height: 8 },
              styles.rounded4,
              { backgroundColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563' }
            ]}
          >
            <View 
              style={[
                { height: 8 },
                styles.rounded4,
                { 
                  backgroundColor: '#16a34a',
                  width: `${(inspectionItems.filter(item => item.isGood !== null).length / inspectionItems.length) * 100}%`
                }
              ]}
            />
          </View>
        </Card>

        {/* Issues Alert */}
        {hasIssues && (
          <Card style={[styles.p16, { backgroundColor: colorScheme === 'light' ? '#fef3c7' : '#92400e', borderColor: '#f59e0b' }]}>
            <View style={[styles.row, styles.gap12]}>
              <AlertTriangle size={20} color="#f59e0b" style={{ marginTop: 2 }} />
              <View style={styles.flex1}>
                <Text size="sm" color="#92400e" style={styles.mb4}>
                  {t('inspection.issues')} :
                </Text>
                <View style={styles.gap4}>
                  {inspectionItems
                    .filter(item => item.isGood === false)
                    .map(item => (
                      <Text key={item.id} size="sm" color="#92400e">
                        • {item.label[language]}
                      </Text>
                    ))}
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Notes */}
        {(hasIssues || allInspected) && (
          <Card style={styles.p16}>
            <Label>{t('inspection.notes')} {hasIssues && '*'}</Label>
            <Textarea
              value={notes}
              onChangeText={setNotes}
              placeholder={hasIssues 
                ? t('inspection.notesPlaceholderRequired')
                : t('inspection.notesPlaceholderOptional')}
              style={[
                styles.mt8,
                hasIssues && !notes.trim() && { borderColor: '#f59e0b', borderWidth: 2 }
              ]}
            />
            {hasIssues && !notes.trim() && (
              <Text size="xs" color="#f59e0b" style={styles.mt4}>
                {t('inspection.notesRequired')}
              </Text>
            )}
          </Card>
        )}

        {/* Photos */}
        {allInspected && (
          <Card style={styles.p16}>
            <Label>{t('inspection.photos')} {hasIssues && `(${t('inspection.recommended')})`}</Label>
            <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mt4, styles.mb12]}>
              {hasIssues 
                ? t('inspection.photosHelpRequired')
                : t('inspection.photosHelpOptional')}
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
                variant="secondary" 
                onPress={showPhotoOptions}
                fullWidth
              >
                <View style={[styles.row, styles.gap4, styles.alignCenter]}>
                  <Camera size={16} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
                  <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                    {t('inspection.addPhoto')}
                  </Text>
                </View>
              </Button>
            )}
          </Card>
        )}

        {/* Complete Button */}
        <Button 
          onPress={handleComplete}
          variant="primary"
          fullWidth
          disabled={!allInspected || (hasIssues && !notes.trim()) || isLoading || isSubmitting}
        >
          <View style={[styles.row, styles.gap4, styles.alignCenter]}>
            <Check size={16} color="white" />
            <Text style={styles.ml8} color="white">
              {isSubmitting ? 
                'Envoi en cours...' : 
                t(`inspection.${inspectionType === 'pickup' ? 'sendUnlockRequest' : 'returnBike'}`)
              }
            </Text>
          </View>
        </Button>

        <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
          {inspectionType === 'pickup' ? 
            'En validant, vous envoyez une demande de déverrouillage qui sera examinée par un administrateur.' :
            'En validant, vous confirmez le retour du vélo.'
          }
        </Text>
      </ScrollView>
    </View>
  );
}