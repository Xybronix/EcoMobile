/* eslint-disable @typescript-eslint/no-unused-vars */
// components/mobile/MobileReportIssue.tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertCircle, ArrowLeft, Camera, Check, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '../../lib/mobile-i18n';

interface MobileReportIssueProps {
  bikeId?: string;
  bikeName?: string;
  onBack: () => void;
}

interface ReportFormData {
  type: string;
  description: string;
  photos: string[];
}

export function MobileReportIssue({ bikeId, bikeName, onBack }: MobileReportIssueProps) {
  const { language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [formData, setFormData] = useState<ReportFormData>({
    type: '',
    description: '',
    photos: []
  });

  const [formErrors, setFormErrors] = useState<Partial<ReportFormData>>({});

  const issueTypes = [
    { value: 'brakes', label: { fr: 'Freins défectueux', en: 'Faulty Brakes' } },
    { value: 'battery', label: { fr: 'Problème de batterie', en: 'Battery Issue' } },
    { value: 'tire', label: { fr: 'Pneu crevé/dégonflé', en: 'Flat/Deflated Tire' } },
    { value: 'chain', label: { fr: 'Chaîne cassée', en: 'Broken Chain' } },
    { value: 'lights', label: { fr: 'Lumières ne fonctionnent pas', en: 'Lights Not Working' } },
    { value: 'lock', label: { fr: 'Problème de verrouillage', en: 'Lock Issue' } },
    { value: 'electronics', label: { fr: 'Problème électronique', en: 'Electronic Issue' } },
    { value: 'physical_damage', label: { fr: 'Dommage physique', en: 'Physical Damage' } },
    { value: 'other', label: { fr: 'Autre', en: 'Other' } }
  ];

  const validateForm = (): boolean => {
    const errors: Partial<ReportFormData> = {};
    
    if (!formData.type) {
      errors.type = 'required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPhoto = () => {
    // Simulate adding a photo
    if (formData.photos.length < 5) {
      const newPhotos = [...formData.photos, `photo-${Date.now()}.jpg`];
      setFormData({ ...formData, photos: newPhotos });
      haptics.light();
    } else {
      toast.error(language === 'fr' ? 'Maximum 5 photos' : 'Maximum 5 photos');
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
    haptics.light();
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error(
        language === 'fr' 
          ? 'Veuillez remplir tous les champs requis' 
          : 'Please fill in all required fields'
      );
      return;
    }

    try {
      // Here you would send the report to your API
      toast.success(
        language === 'fr' 
          ? 'Signalement envoyé avec succès' 
          : 'Report sent successfully'
      );
      haptics.success();
      onBack();
    } catch (error) {
      toast.error(
        language === 'fr' 
          ? 'Erreur lors de l\'envoi du signalement' 
          : 'Error sending report'
      );
    }
  };

  const isSubmitDisabled = !formData.type || !formData.description.trim() || formData.description.length < 20;

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
          style={[
            styles.p8,
            styles.roundedFull,
            { backgroundColor: colorScheme === 'light' ? 'transparent' : '#374151' }
          ]}
        >
          <ArrowLeft size={20} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
        </TouchableOpacity>
        <View style={styles.flex1}>
          <Text 
            variant="subtitle" 
            color="#16a34a"
          >
            {language === 'fr' ? 'Signaler un problème' : 'Report an Issue'}
          </Text>
          {bikeName && (
            <Text 
              size="sm" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
            >
              {bikeName}
            </Text>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Alert */}
        <View 
          style={[
            styles.p16,
            styles.rounded12,
            { 
              backgroundColor: colorScheme === 'light' ? '#dbeafe' : '#1e3a8a',
              borderWidth: 1,
              borderColor: colorScheme === 'light' ? '#93c5fd' : '#3730a3'
            }
          ]}
        >
          <View style={[styles.row, styles.gap12]}>
            <AlertCircle size={20} color="#2563eb" />
            <View style={styles.flex1}>
              <Text 
                size="sm" 
                color={colorScheme === 'light' ? '#1e3a8a' : '#dbeafe'}
              >
                {language === 'fr' 
                  ? 'Décrivez le problème rencontré avec ce vélo. Votre signalement nous aidera à améliorer la qualité du service.'
                  : 'Describe the problem encountered with this bike. Your report will help us improve service quality.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Issue Type */}
        <View style={[styles.card, styles.p16]}>
          <Text 
            variant="body" 
            color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
            style={styles.mb8}
          >
            {language === 'fr' ? 'Type de problème *' : 'Problem Type *'}
          </Text>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger placeholder={language === 'fr' ? 'Sélectionner le type de problème' : 'Select problem type'}>
              <SelectValue placeholder={language === 'fr' ? 'Sélectionner le type de problème' : 'Select problem type'} />
            </SelectTrigger>
            <SelectContent>
              {issueTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <Text>{type.label[language as 'fr' | 'en']}</Text>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.type && (
            <Text size="xs" color="#ef4444" style={styles.mt8}>
              {language === 'fr' ? 'Ce champ est requis' : 'This field is required'}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={[styles.card, styles.p16]}>
          <Text 
            variant="body" 
            color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
            style={styles.mb8}
          >
            {language === 'fr' ? 'Description détaillée *' : 'Detailed Description *'}
          </Text>
          <Input
            value={formData.description}
            onChangeText={(value) => setFormData({ ...formData, description: value })}
            placeholder={language === 'fr' ? 'Décrivez le problème en détail...' : 'Describe the problem in detail...'}
            multiline
            numberOfLines={5}
            style={[
              { 
                height: 120, 
                textAlignVertical: 'top',
                borderColor: formErrors.description ? '#ef4444' : undefined
              }
            ]}
          />
          {formErrors.description && (
            <Text size="xs" color="#ef4444" style={styles.mt8}>
              {language === 'fr' ? 'Ce champ est requis' : 'This field is required'}
            </Text>
          )}
          <Text 
            size="xs" 
            color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
            style={styles.mt8}
          >
            {language === 'fr' 
              ? `Minimum 20 caractères (${formData.description.length}/20)`
              : `Minimum 20 characters (${formData.description.length}/20)`}
          </Text>
        </View>

        {/* Photos */}
        <View style={[styles.card, styles.p16]}>
          <Text 
            variant="body" 
            color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
            style={styles.mb8}
          >
            {language === 'fr' ? 'Photos (optionnel)' : 'Photos (optional)'}
          </Text>
          <Text 
            size="xs" 
            color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
            style={styles.mb12}
          >
            {language === 'fr' 
              ? 'Ajoutez jusqu\'à 5 photos pour illustrer le problème'
              : 'Add up to 5 photos to illustrate the problem'}
          </Text>
          
          {/* Photo Grid */}
          {formData.photos.length > 0 && (
            <View style={[styles.row, { flexWrap: 'wrap' }, styles.gap8, styles.mb12]}>
              {formData.photos.map((photo, index) => (
                <View key={index} style={{ position: 'relative' }}>
                  <View 
                    style={[
                      styles.w80,
                      styles.h80,
                      styles.rounded12,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
                    ]}
                  >
                    <Text 
                      size="xs" 
                      color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                    >
                      {language === 'fr' ? 'Photo' : 'Photo'} {index + 1}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(index)}
                    style={[
                      styles.absolute,
                      styles.w24,
                      styles.h24,
                      styles.rounded12,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { 
                        backgroundColor: '#ef4444',
                        top: -8,
                        right: -8
                      }
                    ]}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {formData.photos.length < 5 && (
            <Button 
              variant="outline" 
              onPress={handleAddPhoto}
              fullWidth
            >
              <View style={[styles.row, styles.alignCenter, styles.gap8]}>
                <Camera size={16} color={colorScheme === 'light' ? '#374151' : '#f9fafb'} />
                <Text color={colorScheme === 'light' ? '#374151' : '#f9fafb'}>
                  {language === 'fr' ? 'Ajouter une photo' : 'Add photo'}
                </Text>
              </View>
            </Button>
          )}
        </View>

        {/* Submit Button */}
        <Button 
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          fullWidth
          style={{ 
            backgroundColor: '#16a34a',
            opacity: isSubmitDisabled ? 0.6 : 1
          }}
        >
          <View style={[styles.row, styles.alignCenter, styles.gap8]}>
            <Check size={16} color="white" />
            <Text color="white">
              {language === 'fr' ? 'Envoyer le signalement' : 'Send Report'}
            </Text>
          </View>
        </Button>

        <Text 
          size="xs" 
          color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
          style={styles.textCenter}
        >
          {language === 'fr' 
            ? 'Nous traiterons votre signalement dans les plus brefs délais'
            : 'We will process your report as soon as possible'}
        </Text>
      </ScrollView>
    </View>
  );
}