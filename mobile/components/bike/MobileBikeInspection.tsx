// components/mobile/MobileBikeInspection.tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertTriangle, ArrowLeft, Camera, Check, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '../../lib/mobile-i18n';

interface MobileBikeInspectionProps {
  bikeId: string;
  bikeName: string;
  inspectionType: 'pickup' | 'return';
  bikeEquipment?: string[]; // Équipements configurés pour ce vélo
  onComplete: (data: InspectionData) => void;
  onBack: () => void;
}

interface InspectionData {
  condition: string;
  issues: string[];
  notes: string;
  photos: string[];
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

  // Mapping des équipements vers leurs labels multilingues
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

  // Éléments de base à toujours vérifier
  const baseItems: InspectionItem[] = [
    { id: 'brakes', label: { fr: 'Freins', en: 'Brakes' }, isGood: null },
    { id: 'tires', label: { fr: 'Pneus', en: 'Tires' }, isGood: null },
    { id: 'battery', label: { fr: 'Batterie', en: 'Battery' }, isGood: null },
    { id: 'chain', label: { fr: 'Chaîne', en: 'Chain' }, isGood: null },
    { id: 'seat', label: { fr: 'Selle', en: 'Seat' }, isGood: null },
    { id: 'handlebars', label: { fr: 'Guidon', en: 'Handlebars' }, isGood: null },
    { id: 'frame', label: { fr: 'Cadre', en: 'Frame' }, isGood: null }
  ];

  // Ajouter les équipements spécifiques du vélo
  const equipmentItems: InspectionItem[] = (bikeEquipment || []).map(equipId => ({
    id: equipId,
    label: equipmentLabels[equipId] || { fr: equipId, en: equipId },
    isGood: null
  }));

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    ...baseItems,
    ...equipmentItems
  ]);

  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const updateInspectionItem = (id: string, isGood: boolean) => {
    haptics.selection();
    setInspectionItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isGood } : item
      )
    );
  };

  const handleAddPhoto = () => {
    if (photos.length < 5) {
      haptics.light();
      const newPhotos = [...photos, `photo-${Date.now()}.jpg`];
      setPhotos(newPhotos);
    } else {
      haptics.error();
      toast.error('Maximum 5 photos');
    }
  };

  const handleRemovePhoto = (index: number) => {
    haptics.light();
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleComplete = () => {
    // Check if all items have been inspected
    const allInspected = inspectionItems.every(item => item.isGood !== null);
    
    if (!allInspected) {
      haptics.error();
      toast.error('Veuillez inspecter tous les éléments');
      return;
    }

    const issues = inspectionItems
      .filter(item => !item.isGood)
      .map(item => item.label[language]);

    const hasIssues = issues.length > 0;

    if (hasIssues && !notes.trim()) {
      haptics.error();
      toast.error('Veuillez ajouter des notes pour les problèmes identifiés');
      return;
    }

    const data: InspectionData = {
      condition: hasIssues ? 'damaged' : 'good',
      issues,
      notes,
      photos
    };

    haptics.success();
    onComplete(data);
  };

  const allInspected = inspectionItems.every(item => item.isGood !== null);
  const hasIssues = inspectionItems.some(item => item.isGood === false);

  const titleText = inspectionType === 'pickup' 
    ? 'Inspection avant prise'
    : 'Inspection avant retour';

  const descriptionText = inspectionType === 'pickup'
    ? 'Vérifiez l\'état du vélo avant de commencer votre trajet'
    : 'Vérifiez l\'état du vélo avant de le retourner';

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
              {titleText}
            </Text>
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
              {bikeName}
            </Text>
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
                {descriptionText}. Signalez tout problème constaté.
              </Text>
            </View>
          </View>
        </Card>

        {/* Inspection Items */}
        <Card style={styles.p16}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb16}>
            Éléments à vérifier
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
              Progression
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
                  Problèmes identifiés :
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

        {/* Notes (required if issues) */}
        {(hasIssues || allInspected) && (
          <Card style={styles.p16}>
            <Label>Notes {hasIssues && '*'}</Label>
            <Textarea
              value={notes}
              onChangeText={setNotes}
              placeholder={hasIssues 
                ? "Décrivez les problèmes identifiés en détail..."
                : "Ajoutez des notes (optionnel)"}
              style={[
                styles.mt8,
                hasIssues && !notes.trim() && { borderColor: '#f59e0b', borderWidth: 2 }
              ]}
            />
            {hasIssues && !notes.trim() && (
              <Text size="xs" color="#f59e0b" style={styles.mt4}>
                Des notes sont requises lorsque des problèmes sont identifiés
              </Text>
            )}
          </Card>
        )}

        {/* Photos (optional but recommended if issues) */}
        {allInspected && (
          <Card style={styles.p16}>
            <Label>Photos {hasIssues && '(recommandé)'}</Label>
            <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mt4, styles.mb12]}>
              {hasIssues 
                ? 'Ajoutez des photos des problèmes identifiés'
                : 'Ajoutez des photos de l\'état du vélo (optionnel)'}
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
        )}

        {/* Complete Button */}
        <Button 
          onPress={handleComplete}
          variant="primary"
          fullWidth
          disabled={!allInspected || (hasIssues && !notes.trim())}
        >
          <Check size={16} color="white" />
          <Text style={styles.ml8} color="white">
            {inspectionType === 'pickup' ? 'Commencer le trajet' : 'Retourner le vélo'}
          </Text>
        </Button>

        <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
          {inspectionType === 'pickup' 
            ? 'En confirmant, vous déclarez avoir vérifié l\'état du vélo'
            : 'En confirmant, vous déclarez retourner le vélo dans l\'état indiqué'}
        </Text>
      </ScrollView>
    </View>
  );
}