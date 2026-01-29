/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { incidentService } from '@/services/incidentService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertTriangle, ArrowLeft, Clock, CheckCircle, Edit, Image as ImageIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileIncidentDetailsProps {
  onBack: () => void;
  onEdit?: (incidentId: string) => void;
  incidentId: string;
}

export function MobileIncidentDetails({ onBack, onEdit, incidentId }: MobileIncidentDetailsProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [incident, setIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (incidentId) {
      loadIncident();
    }
  }, [incidentId]);

  const loadIncident = async () => {
    try {
      setIsLoading(true);
      const data = await incidentService.getIncident(incidentId);
      setIncident(data);
    } catch (error) {
      console.error('Error loading incident:', error);
      toast.error(t('error.loadingIncident'));
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': case 'CLOSED': return '#16a34a';
      case 'OPEN': return '#f59e0b';
      case 'IN_PROGRESS': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'OPEN': t('incident.status.open'),
      'IN_PROGRESS': t('incident.status.in_progress'),
      'RESOLVED': t('incident.status.resolved'),
      'CLOSED': t('incident.status.closed')
    };
    return statusMap[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#dc2626';
      case 'HIGH': return '#f59e0b';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'LOW': t('priority.low'),
      'MEDIUM': t('priority.medium'),
      'HIGH': t('priority.high'),
      'URGENT': t('priority.urgent')
    };
    return priorityMap[priority] || priority;
  };

  const getIncidentTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'brakes': t('incident.type.brakes'),
      'battery': t('incident.type.battery'),
      'tire': t('incident.type.tire'),
      'chain': t('incident.type.chain'),
      'lights': t('incident.type.lights'),
      'lock': t('incident.type.lock'),
      'electronics': t('incident.type.electronics'),
      'physical_damage': t('incident.type.physical_damage'),
      'theft': t('incident.type.theft'),
      'other': t('incident.type.other')
    };
    return typeMap[type] || type;
  };

  if (isLoading) {
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
          <Text variant="subtitle" color="#16a34a">
            {t('incident.details.title')}
          </Text>
        </View>
        
        <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter]}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text color="#6b7280" style={styles.mt16}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  if (!incident) {
    return null;
  }

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
          {`${t('incident.details.reportNumber')}: ${ incident.id.slice(0, 8) }`}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status & Priority Card */}
        <Card style={[styles.p16]}>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
            <View>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
                {t('incident.details.status')}
              </Text>
              <View style={[styles.row, styles.alignCenter, styles.gap8]}>
                {incident.status === 'RESOLVED' || incident.status === 'CLOSED' ? (
                  <CheckCircle size={20} color={getStatusColor(incident.status)} />
                ) : (
                  <Clock size={20} color={getStatusColor(incident.status)} />
                )}
                <Badge 
                  variant="default"
                  style={{ backgroundColor: getStatusColor(incident.status) }}
                >
                  <Text color="white" size="sm">
                    {getStatusText(incident.status)}
                  </Text>
                </Badge>
              </View>
            </View>
            
            <View style={styles.alignEnd}>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
                {t('incident.details.priority')}
              </Text>
              <Badge 
                variant="default"
                style={{ backgroundColor: getPriorityColor(incident.priority) }}
              >
                <Text color="white" size="sm">
                  {getPriorityText(incident.priority)}
                </Text>
              </Badge>
            </View>
          </View>
        </Card>

        {/* Incident Info */}
        <Card style={styles.p16}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb12}>
            {t('incident.details.information')}
          </Text>
          
          <View style={styles.gap12}>
            <View>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {t('incident.details.problemType')}
              </Text>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {getIncidentTypeText(incident.type)}
              </Text>
            </View>

            {incident.bike && (
              <View>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {t('incident.details.relatedBike')}
                </Text>
                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                  {incident.bike.code} - {incident.bike.model}
                </Text>
              </View>
            )}

            <View>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {t('incident.details.creationDate')}
              </Text>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {new Date(incident.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>

            {incident.resolvedAt && (
              <View>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {t('incident.details.resolvedDate')}
                </Text>
                <Text variant="body" color="#16a34a">
                  {new Date(incident.resolvedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.p16}>
          <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
            {t('incident.details.description')}
          </Text>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ lineHeight: 20 }}>
            {incident.description}
          </Text>
        </Card>

        {/* Photos */}
        {incident.photos && incident.photos.length > 0 && (
          <Card style={styles.p16}>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb12}>
              {`${t('incident.details.photosCount')}: ${ incident.photos.length }`}
            </Text>
            <View style={[styles.row, { flexWrap: 'wrap' }, styles.gap8]}>
              {incident.photos.map((photo: string, index: number) => (
                <View 
                  key={index} 
                  style={[
                    { width: 100, height: 100 },
                    styles.rounded8,
                    styles.alignCenter,
                    styles.justifyCenter,
                    { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
                  ]}
                >
                  <ImageIcon size={24} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
                  <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mt4}>
                    {`${t('common.photo')}: ${ index + 1 }`}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Refund */}
        {incident.refundAmount && incident.refundAmount > 0 && (
          <Card style={[styles.p16, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}>
            <View style={[styles.row, styles.alignCenter, styles.gap12]}>
              <CheckCircle size={24} color="#16a34a" />
              <View style={styles.flex1}>
                <Text variant="body" color="#16a34a" weight="bold">
                  {t('incident.details.refundIssued')}
                </Text>
                <Text size="sm" color="#6b7280" style={styles.mt4}>
                  {`${t('incident.details.refundAmount')}: ${ incident.refundAmount }`}
                </Text>
                <Text size="xs" color="#6b7280">
                  {t('incident.details.refundDescription')}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Admin Note */}
        {incident.adminNote && (
          <Card style={[styles.p16, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' }]}>
            <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb8]}>
              <AlertTriangle size={20} color="#3b82f6" />
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {t('incident.details.adminNote')}
              </Text>
            </View>
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ lineHeight: 20 }}>
              {incident.adminNote}
            </Text>
            {/* Afficher le nom de l'admin qui a assigné la charge */}
            {incident.type === 'admin_charge' && incident.resolvedByUser && (
              <View style={[styles.mt8, styles.pt8, { borderTopWidth: 1, borderTopColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563' }]}>
                <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {t('accountManagement.assignedBy')}: {incident.resolvedByUser.fullName}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.gap12}>
          {incident.status === 'OPEN' && onEdit && (
            <Button
              variant="primary"
              fullWidth
              onPress={() => {
                haptics.light();
                onEdit(incident.id);
              }}
            >
              <Edit size={16} color="white" />
              <Text style={styles.ml8} color="white">
                {t('incident.details.editReport')}
              </Text>
            </Button>
          )}
          
          <Button
            variant="outline"
            fullWidth
            onPress={() => {
              haptics.light();
              onBack();
            }}
          >
            <ArrowLeft size={16} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
            <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {t('incident.details.back')}
            </Text>
          </Button>
        </View>

        {/* Help Text */}
        <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.textCenter, { lineHeight: 18 }]}>
          {incident.status === 'OPEN' 
            ? t('incident.statusHelp.open')
            : incident.status === 'IN_PROGRESS'
            ? t('incident.statusHelp.inProgress')
            : t('incident.statusHelp.resolved')
          }
        </Text>
      </ScrollView>
    </View>
  );
}