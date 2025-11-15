import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { incidentService, type Incident } from '@/services/incidentService';
import { AlertCircle, ArrowLeft, Camera, Check, Clock, Edit, Plus, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';
import * as ImagePicker from 'expo-image-picker';

interface MobileReportIssueProps {
  bikeId?: string;
  bikeName?: string;
  onBack: () => void;
}

interface ReportFormData {
  type: string;
  description: string;
  photos: string[];
  bikeId?: string;
}

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export function MobileReportIssue({ bikeId, bikeName, onBack }: MobileReportIssueProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ReportFormData>({
    type: '',
    description: '',
    photos: [],
    bikeId: bikeId
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

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setIsLoading(true);
      const data = await incidentService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Error loading incidents:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '#f59e0b';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'RESOLVED':
        return '#16a34a';
      case 'CLOSED':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    return t(`incident.status.${status.toLowerCase()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = (incident: Incident) => {
    return incident.status === 'OPEN';
  };

  const canDelete = (incident: Incident) => {
    return incident.status === 'OPEN';
  };

  const resetForm = () => {
    setFormData({
      type: '',
      description: '',
      photos: [],
      bikeId: bikeId
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<ReportFormData> = {};
    
    if (!formData.type) {
      errors.type = 'required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'required';
    } else if (formData.description.length < 20) {
      errors.description = 'minLength';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPhoto = async () => {
    if (formData.photos.length >= 5) {
      haptics.error();
      toast.error(t('report.maxPhotos'));
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        toast.error(t('report.photoPermissionDenied'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        if (imageUri) {
          setFormData(prev => ({ ...prev, photos: [...prev.photos, imageUri] }));
          haptics.light();
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error(t('report.photoError'));
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
    haptics.light();
  };

  const handleCreateReport = () => {
    haptics.light();
    setViewMode('create');
    resetForm();
  };

  const handleEditIncident = (incident: Incident) => {
    haptics.light();
    setSelectedIncident(incident);
    setFormData({
      type: incident.type,
      description: incident.description,
      photos: [], // Photos from existing incident would be loaded here
      bikeId: incident.bikeId || undefined
    });
    setViewMode('edit');
  };

  const handleViewIncident = (incident: Incident) => {
    haptics.light();
    setSelectedIncident(incident);
    setViewMode('view');
  };

  const handleDeleteIncident = async (incident: Incident) => {
    try {
      setIsLoading(true);
      await incidentService.deleteIncident(incident.id);
      haptics.success();
      toast.success(t('incident.deleted'));
      await loadIncidents();
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error(t('report.fillRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      
      const submitData = {
        type: formData.type,
        description: formData.description,
        bikeId: formData.bikeId,
        photos: formData.photos
      };

      if (viewMode === 'create') {
        await incidentService.createIncident(submitData);
        toast.success(t('report.success'));
      } else if (viewMode === 'edit' && selectedIncident) {
        await incidentService.updateIncident(selectedIncident.id, submitData);
        toast.success(t('incident.updated'));
      }

      haptics.success();
      await loadIncidents();
      setViewMode('list');
      resetForm();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (viewMode === 'list') {
      onBack();
    } else {
      setViewMode('list');
      setSelectedIncident(null);
      resetForm();
    }
  };

  const renderHeader = () => {
    let title = t('report.title');
    
    if (viewMode === 'create') title = t('report.createNew');
    else if (viewMode === 'edit') title = t('report.edit');
    else if (viewMode === 'view') title = t('report.details');

    return (
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
            handleBack();
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
          <Text variant="subtitle" color="#16a34a">
            {title}
          </Text>
          {bikeName && viewMode === 'list' && (
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
              {bikeName}
            </Text>
          )}
        </View>
        {viewMode === 'list' && (
          <TouchableOpacity
            onPress={handleCreateReport}
            style={[
              styles.p8,
              styles.rounded8,
              { backgroundColor: '#16a34a' }
            ]}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderIncidentsList = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={[styles.p16, styles.gap16]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={loadIncidents}
          colors={['#16a34a']}
          tintColor="#16a34a"
        />
      }
    >
      {incidents.length === 0 ? (
        <Card style={[styles.p48, styles.alignCenter]}>
          <View 
            style={[
              styles.w64,
              styles.h64,
              styles.rounded32,
              styles.alignCenter,
              styles.justifyCenter,
              styles.mb16,
              { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
            ]}
          >
            <AlertCircle size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
          </View>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
            {t('report.noReports')}
          </Text>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
            {t('report.noReportsDescription')}
          </Text>
        </Card>
      ) : (
        incidents.map((incident) => (
          <TouchableOpacity
            key={incident.id}
            onPress={() => handleViewIncident(incident)}
            style={[styles.card, styles.p16]}
          >
            <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb12]}>
              <Badge 
                variant="secondary" 
                style={{ backgroundColor: getStatusColor(incident.status) + '20' }}
              >
                <Text size="xs" color={getStatusColor(incident.status)}>
                  {getStatusText(incident.status)}
                </Text>
              </Badge>
              <View style={[styles.row, styles.gap8]}>
                {canEdit(incident) && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEditIncident(incident);
                    }}
                    style={[
                      styles.p8,
                      styles.rounded8,
                      { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
                    ]}
                  >
                    <Edit size={16} color="#3b82f6" />
                  </TouchableOpacity>
                )}
                {canDelete(incident) && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteIncident(incident);
                    }}
                    style={[
                      styles.p8,
                      styles.rounded8,
                      { backgroundColor: colorScheme === 'light' ? '#fef2f2' : '#7f1d1d' }
                    ]}
                  >
                    <Trash2 size={16} color="#dc2626" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
              {issueTypes.find(type => type.value === incident.type)?.label[language] || incident.type}
            </Text>
            
            <Text 
              size="sm" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} 
              style={styles.mb12}
              numberOfLines={2}
            >
              {incident.description}
            </Text>
            
            <View style={[styles.row, styles.alignCenter, styles.gap8]}>
              <Clock size={12} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
              <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {formatDate(incident.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderForm = () => {
    const isSubmitDisabled = !formData.type || !formData.description.trim() || formData.description.length < 20 || isSubmitting;

    return (
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
              <Text size="sm" color={colorScheme === 'light' ? '#1e3a8a' : '#dbeafe'}>
                {t('report.infoDescription')}
              </Text>
            </View>
          </View>
        </View>

        {/* Issue Type */}
        <View style={[styles.card, styles.p16]}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
            {t('report.type')} *
          </Text>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger placeholder={t('report.selectType')}>
              <SelectValue placeholder={t('report.selectType')} />
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
              {t('common.required')}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={[styles.card, styles.p16]}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
            {t('report.detailedDescription')} *
          </Text>
          <Input
            value={formData.description}
            onChangeText={(value) => setFormData({ ...formData, description: value })}
            placeholder={t('report.descriptionPlaceholder')}
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
              {formErrors.description === 'required' ? t('common.required') : t('report.minLength')}
            </Text>
          )}
          <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mt8}>
            {`${t('report.characterCount')} ${ formData.description.length, 20 }`}
          </Text>
        </View>

        {/* Photos */}
        <View style={[styles.card, styles.p16]}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
            {t('report.photos')}
          </Text>
          <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb12}>
            {t('report.photosDescription')}
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
                    <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                      {`${t('report.photoNumber')} ${ index + 1 }`}
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
            <Button variant="outline" onPress={handleAddPhoto} fullWidth>
              <View style={[styles.row, styles.alignCenter, styles.gap8]}>
                <Camera size={16} color={colorScheme === 'light' ? '#374151' : '#f9fafb'} />
                <Text color={colorScheme === 'light' ? '#374151' : '#f9fafb'}>
                  {t('report.addPhoto')}
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
              {isSubmitting ? t('common.loading') : 
                viewMode === 'create' ? t('report.submit') : t('common.save')}
            </Text>
          </View>
        </Button>

        <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
          {t('report.processingNotice')}
        </Text>
      </ScrollView>
    );
  };

  const renderIncidentDetails = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={[styles.p16, styles.gap16]}
      showsVerticalScrollIndicator={false}
    >
      {selectedIncident && (
        <>
          <Card style={styles.p16}>
            <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb16]}>
              <Badge 
                variant="secondary" 
                style={{ backgroundColor: getStatusColor(selectedIncident.status) + '20' }}
              >
                <Text size="sm" color={getStatusColor(selectedIncident.status)}>
                  {getStatusText(selectedIncident.status)}
                </Text>
              </Badge>
              <View style={[styles.row, styles.gap8]}>
                {canEdit(selectedIncident) && (
                  <TouchableOpacity
                    onPress={() => handleEditIncident(selectedIncident)}
                    style={[
                      styles.p8,
                      styles.rounded8,
                      { backgroundColor: '#3b82f6' }
                    ]}
                  >
                    <Edit size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
              {t('report.type')}: {issueTypes.find(type => type.value === selectedIncident.type)?.label[language] || selectedIncident.type}
            </Text>
            
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb16}>
              {t('report.createdAt')}: {formatDate(selectedIncident.createdAt)}
            </Text>
            
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
              {t('report.description')}:
            </Text>
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb16}>
              {selectedIncident.description}
            </Text>

            {selectedIncident.adminNote && (
              <>
                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
                  {t('incident.adminNote')}:
                </Text>
                <View style={[
                  styles.p12,
                  styles.rounded8,
                  { backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d' }
                ]}>
                  <Text size="sm" color={colorScheme === 'light' ? '#166534' : '#dcfce7'}>
                    {selectedIncident.adminNote}
                  </Text>
                </View>
              </>
            )}
          </Card>
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {viewMode === 'list' && renderIncidentsList()}
      {(viewMode === 'create' || viewMode === 'edit') && renderForm()}
      {viewMode === 'view' && renderIncidentDetails()}
    </View>
  );
}