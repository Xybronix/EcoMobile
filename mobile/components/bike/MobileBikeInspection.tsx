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
import { ScrollView, TouchableOpacity, View, Alert, Image, Platform } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileBikeInspectionProps {
  bikeId: string;
  bikeName: string;
  inspectionType: 'pickup' | 'return';
  bikeEquipment?: string[];
  onNavigate?: (route: string, params?: any) => void;
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
  required: boolean;
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

    const requiredItems: InspectionItem[] = [
      { id: 'brakes', label: { fr: 'Freins', en: 'Brakes' }, isGood: null, required: true },
      { id: 'tires', label: { fr: 'Pneus', en: 'Tires' }, isGood: null, required: true },
      { id: 'battery', label: { fr: 'Batterie', en: 'Battery' }, isGood: null, required: true },
      { id: 'chain', label: { fr: 'Chaîne', en: 'Chain' }, isGood: null, required: true },
    ];

    const optionalItems: InspectionItem[] = [
      { id: 'seat', label: { fr: 'Selle', en: 'Seat' }, isGood: null, required: false },
      { id: 'handlebars', label: { fr: 'Guidon', en: 'Handlebars' }, isGood: null, required: false },
      { id: 'frame', label: { fr: 'Cadre', en: 'Frame' }, isGood: null, required: false }
    ];

    const equipmentItems: InspectionItem[] = (bikeEquipment || []).map(equipId => ({
      id: equipId,
      label: equipmentLabels[equipId] || { fr: equipId, en: equipId },
      isGood: null,
      required: false
    }));

    setInspectionItems([...requiredItems, ...optionalItems, ...equipmentItems]);
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
    const isWeb = typeof window !== 'undefined' && window.navigator && 
      ((window.navigator.userAgent && 
        (window.navigator.userAgent.includes('Windows') || 
        window.navigator.userAgent.includes('Mac') || 
        window.navigator.userAgent.includes('Linux'))) ||
      (window.navigator.platform && 
        (window.navigator.platform.includes('Win') ||
        window.navigator.platform.includes('Mac') ||
        window.navigator.platform.includes('Linux'))));
      
    if (isWeb) {
      handleAddPhoto('library');
    } else {
      Alert.alert(
        'Ajouter une photo',
        'Choisissez une option',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Appareil photo', onPress: () => handleAddPhoto('camera') },
          { text: 'Galerie', onPress: () => handleAddPhoto('library') }
        ]
      );
    }
  };

  const handleAddPhoto = async (source: 'camera' | 'library') => {
    if (photos.length >= 5) {
      haptics.error();
      toast.error(t('inspection.maxPhotos'));
      return;
    }

    try {
      haptics.light();

      const isWeb = Platform.OS === 'web';

      if (isWeb && source === 'library') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = false;
        input.onchange = (event: Event) => {
          const target = event.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
              toast.error('Seuls les fichiers images sont autorisés (JPEG, PNG, GIF, WebP)');
              return;
            }
            
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
              toast.error('La taille de l\'image ne doit pas dépasser 5 Mo');
              return;
            }
            
            const photoUrl = URL.createObjectURL(file);
            const newPhotos = [...photos, photoUrl];
            setPhotos(newPhotos);
          }
        };
        input.click();
        return;
      }
      
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
        const asset = result.assets[0];
        
        if (asset.fileSize) {
          const maxSize = 5 * 1024 * 1024;
          if (asset.fileSize > maxSize) {
            toast.error('La taille de l\'image ne doit pas dépasser 5 Mo');
            return;
          }
        }
        
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
    const requiredInspected = inspectionItems
      .filter(item => item.required)
      .every(item => item.isGood !== null);
    
    if (!requiredInspected) {
      haptics.error();
      toast.error(t('inspection.requiredItems'));
      return;
    }

    const requiredIssues = inspectionItems
      .filter(item => item.required && !item.isGood)
      .map(item => item.label[language]);

    const optionalIssues = inspectionItems
      .filter(item => !item.required && !item.isGood)
      .map(item => item.label[language]);

    const allIssues = [...requiredIssues, ...optionalIssues];
    const hasRequiredIssues = requiredIssues.length > 0;
    const hasAnyIssues = allIssues.length > 0;

    if (hasRequiredIssues && !notes.trim()) {
      haptics.error();
      toast.error(t('inspection.notesRequiredForIssues'));
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const inspectionData = {
        condition: hasRequiredIssues ? 'damaged' : (hasAnyIssues ? 'acceptable' : 'good'),
        issues: allIssues,
        notes,
        photos,
        metadata: {
          inspection: {
            type: inspectionType,
            condition: hasRequiredIssues ? 'damaged' : (hasAnyIssues ? 'acceptable' : 'good'),
            issues: allIssues,
            notes,
            photos,
            inspectedAt: new Date().toISOString(),
            hasIssues: hasAnyIssues,
            hasCriticalIssues: hasRequiredIssues
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

  const requiredItems = inspectionItems.filter(item => item.required);
  const optionalItems = inspectionItems.filter(item => !item.required);
  
  const requiredInspected = requiredItems.every(item => item.isGood !== null);
  const allInspected = inspectionItems.every(item => item.isGood !== null);
  
  const requiredIssues = requiredItems.filter(item => item.isGood === false);
  const optionalIssues = optionalItems.filter(item => item.isGood === false);
  const allIssues = [...requiredIssues, ...optionalIssues];
  
  const hasRequiredIssues = requiredIssues.length > 0;
  const hasAnyIssues = allIssues.length > 0;

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
        <Card style={[styles.p16, { backgroundColor: colorScheme === 'light' ? '#1e40af' : '#1e3a8a', borderColor: '#3b82f6' }]}>
          <View style={[styles.row, styles.gap12]}>
            <AlertTriangle size={20} color="#fbbf24" style={{ marginTop: 2 }} />
            <View style={styles.flex1}>
              <Text size="sm" color="#fbbf24" style={{ fontWeight: 'bold' }}>
                {t(`inspection.description.${inspectionType}`)}
              </Text>
              <Text size="xs" color="#fef3c7" style={styles.mt4}>
                {inspectionType === 'pickup' 
                  ? 'Notez les éventuels problèmes pour documenter l\'état du vélo. Seuls les éléments marqués (*) sont obligatoires pour le déverrouillage.'
                  : 'Documentez l\'état du vélo au moment du retour.'
                }
              </Text>
            </View>
          </View>
        </Card>

        {/* Inspection Items */}
        <Card style={styles.p16}>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb16]}>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {t('inspection.checkItems')}
            </Text>
            <Text size="xs" color={colorScheme === 'light' ? '#4b5563' : '#9ca3af'}>
              (*) = obligatoire
            </Text>
          </View>
          <View style={styles.gap12}>
            {/* Section des éléments obligatoires */}
            {requiredItems.length > 0 && (
              <View style={styles.mb8}>
                <Text size="xs" color="#dc2626" style={[styles.mb8]}>
                  Éléments essentiels *
                </Text>
                {requiredItems.map((item) => (
                  <InspectionItemRow
                    key={item.id}
                    item={item}
                    language={language}
                    colorScheme={colorScheme}
                    updateInspectionItem={updateInspectionItem}
                    styles={styles}
                  />
                ))}
              </View>
            )}

            {/* Section des éléments optionnels */}
            {optionalItems.length > 0 && (
              <View>
                <Text size="xs" color={colorScheme === 'light' ? '#4b5563' : '#9ca3af'} style={[styles.mb8]}>
                  Éléments non essentiels
                </Text>
                {optionalItems.map((item) => (
                  <InspectionItemRow
                    key={item.id}
                    item={item}
                    language={language}
                    colorScheme={colorScheme}
                    updateInspectionItem={updateInspectionItem}
                    styles={styles}
                  />
                ))}
              </View>
            )}
          </View>
        </Card>

        {/* Progress */}
        <Card style={styles.p16}>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb8]}>
            <Text size="sm" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              Progression
            </Text>
            <View style={[styles.row, styles.gap8]}>
              <Text size="sm" color="#dc2626">
                {requiredItems.filter(item => item.isGood !== null).length}/{requiredItems.length} *
              </Text>
              <Text size="sm" color={colorScheme === 'light' ? '#4b5563' : '#9ca3af'}>
                ({allInspected ? 'Complet' : 'Optionnel'})
              </Text>
            </View>
          </View>
          
          {/* Barre de progression pour les éléments requis */}
          <View style={styles.mb4}>
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="xs" color="#dc2626">Essentiels</Text>
              <Text size="xs" color="#dc2626">
                {requiredItems.filter(item => item.isGood !== null).length}/{requiredItems.length}
              </Text>
            </View>
            <View 
              style={[
                styles.wT100,
                { height: 6 },
                styles.rounded4,
                { backgroundColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563' }
              ]}
            >
              <View 
                style={[
                  { height: 6 },
                  styles.rounded4,
                  { 
                    backgroundColor: requiredInspected ? '#16a34a' : '#dc2626',
                    width: `${(requiredItems.filter(item => item.isGood !== null).length / requiredItems.length) * 100}%`
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.mb16} />

          {/* Barre de progression pour les éléments optionnels */}
          <View>
            <View style={[styles.row, styles.spaceBetween, styles.mb4]}>
              <Text size="xs" color={colorScheme === 'light' ? '#4b5563' : '#9ca3af'}>Optionnels</Text>
              <Text size="xs" color={colorScheme === 'light' ? '#4b5563' : '#9ca3af'}>
                {optionalItems.filter(item => item.isGood !== null).length}/{optionalItems.length}
              </Text>
            </View>
            <View 
              style={[
                styles.wT100,
                { height: 6 },
                styles.rounded4,
                { backgroundColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563' }
              ]}
            >
              <View 
                style={[
                  { height: 6 },
                  styles.rounded4,
                  { 
                    backgroundColor: '#3b82f6',
                    width: `${(optionalItems.filter(item => item.isGood !== null).length / Math.max(optionalItems.length, 1)) * 100}%`
                  }
                ]}
              />
            </View>
          </View>
        </Card>

        {/* Issues Alert */}
        {hasAnyIssues && (
          <Card style={[styles.p16, { 
            backgroundColor: colorScheme === 'light' ? '#fef3c7' : '#cf580e94', 
            borderColor: hasRequiredIssues ? '#dc2626' : '#f59e0b' 
          }]}>
            <View style={[styles.row, styles.gap12]}>
              <AlertTriangle 
                size={20} 
                color={hasRequiredIssues ? '#dc2626' : '#f59e0b'} 
                style={{ marginTop: 2 }} 
              />
              <View style={styles.flex1}>
                <Text size="sm" color={hasRequiredIssues ? '#ffffff' : '#ffffff'} style={[styles.mb4]}>
                  {hasRequiredIssues 
                    ? 'Problèmes critiques détectés *' 
                    : 'Problèmes mineurs détectés'}
                </Text>
                
                {/* Problèmes critiques */}
                {hasRequiredIssues && (
                  <View style={styles.mb8}>
                    <Text size="xs" color="#ffffff" style={[styles.mb4]}>
                      Éléments essentiels :
                    </Text>
                    {requiredIssues.map(item => (
                      <Text key={item.id} size="sm" color="#ffffff" style={styles.ml4}>
                        • {item.label[language]} *
                      </Text>
                    ))}
                  </View>
                )}

                {/* Problèmes mineurs */}
                {optionalIssues.length > 0 && (
                  <View>
                    <Text size="xs" color="#ffffff" style={[styles.mb4]}>
                      Éléments non essentiels :
                    </Text>
                    {optionalIssues.map(item => (
                      <Text key={item.id} size="sm" color="#ffffff" style={styles.ml4}>
                        • {item.label[language]}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Notes */}
        {(hasAnyIssues || allInspected) && (
          <Card style={styles.p16}>
            <Label>
              {t('inspection.notes')} 
              {hasRequiredIssues && <Text color="#dc2626"> *</Text>}
            </Label>
            <Textarea
              value={notes}
              onChangeText={setNotes}
              placeholder={hasRequiredIssues 
                ? 'Description des problèmes critiques (obligatoire)'
                : (hasAnyIssues 
                    ? 'Description des problèmes (recommandé)'
                    : t('inspection.notesPlaceholderOptional')
                  )}
              style={[
                styles.mt8,
                hasRequiredIssues && !notes.trim() && { borderColor: '#dc2626', borderWidth: 2 }
              ]}
            />
            {hasRequiredIssues && !notes.trim() && (
              <Text size="xs" color="#dc2626" style={styles.mt4}>
                Une description est requise pour les problèmes critiques
              </Text>
            )}
            {!hasRequiredIssues && hasAnyIssues && notes.trim() && (
              <Text size="xs" color="#16a34a" style={styles.mt4}>
                Merci pour votre retour détaillé
              </Text>
            )}
          </Card>
        )}

        {/* Photos */}
        {allInspected && (
          <Card style={styles.p16}>
            <Label>{t('inspection.photos')} {hasAnyIssues && `(${t('inspection.recommended')})`}</Label>
            <Text size="xs" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={[styles.mt4, styles.mb12]}>
              {hasRequiredIssues 
                ? 'Des photos sont nécessaires pour documenter les problèmes critiques'
                : (hasAnyIssues 
                    ? 'Des photos sont recommandées pour documenter les problèmes'
                    : 'Photos optionnelles pour documenter l\'état du vélo'
                  )}
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
                  {photo ? (
                    <Image
                      source={{ uri: photo }}
                      style={[
                        styles.wT100,
                        styles.hT100,
                        styles.rounded8,
                        { resizeMode: 'cover' }
                      ]}
                    />
                  ) : (
                    <View style={[styles.alignCenter, styles.justifyCenter, styles.wT100, styles.hT100]}>
                      <Text size="xs" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                        Photo {index + 1}
                      </Text>
                    </View>
                  )}

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
              <>
                <Button 
                  variant="secondary" 
                  onPress={showPhotoOptions}
                  style={styles.mb8}
                  fullWidth
                >
                  <View style={[styles.row, styles.gap4, styles.alignCenter]}>
                    <Camera size={16} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
                    <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                      {t('inspection.addPhoto')}
                    </Text>
                  </View>
                </Button>
                <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
                  Formats supportés : JPEG, PNG, GIF, WebP • Max 5 Mo
                </Text>
              </>
            )}
          </Card>
        )}

        {/* Complete Button */}
        <Button 
          onPress={handleComplete}
          variant="primary"
          fullWidth
          disabled={!requiredInspected || (hasRequiredIssues && !notes.trim()) || isLoading || isSubmitting}
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

interface InspectionItemRowProps {
  item: InspectionItem;
  language: 'fr' | 'en';
  colorScheme: string;
  updateInspectionItem: (id: string, isGood: boolean) => void;
  styles: any;
}

function InspectionItemRow({ item, language, colorScheme, updateInspectionItem, styles }: InspectionItemRowProps) {
  return (
    <View 
      style={[
        styles.row, 
        styles.spaceBetween, 
        styles.alignCenter, 
        styles.p12, 
        styles.rounded8,
        styles.mb8,
        { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' }
      ]}
    >
      <View style={[styles.row, styles.alignCenter, styles.gap8]}>
        <Text size="sm" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
          {item.label[language]}
        </Text>
        {item.required && (
          <Text size="xs" color="#dc2626">*</Text>
        )}
      </View>
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
            color={item.isGood === true ? 'white' : (colorScheme === 'light' ? '#111827' : '#9ca3af')} 
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
            color={item.isGood === false ? 'white' : (colorScheme === 'light' ? '#111827' : '#9ca3af')} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}