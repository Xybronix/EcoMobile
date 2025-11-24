/* eslint-disable react/no-unescaped-entities */
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
      toast.error('Erreur lors du chargement du signalement');
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
      'OPEN': 'Ouvert',
      'IN_PROGRESS': 'En cours',
      'RESOLVED': 'Résolu',
      'CLOSED': 'Fermé'
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
      'LOW': 'Basse',
      'MEDIUM': 'Moyenne',
      'HIGH': 'Haute',
      'URGENT': 'Urgente'
    };
    return priorityMap[priority] || priority;
  };

  const getIncidentTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'brakes': 'Problème de freins',
      'battery': 'Problème de batterie',
      'tire': 'Problème de pneu',
      'chain': 'Problème de chaîne',
      'lights': 'Problème de lumières',
      'lock': 'Problème de cadenas',
      'electronics': 'Problème électronique',
      'physical_damage': 'Dégât physique',
      'theft': 'Vol ou tentative',
      'other': 'Autre problème'
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
            Détails du signalement
          </Text>
        </View>
        
        <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter]}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text color="#6b7280" style={styles.mt16}>Chargement...</Text>
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
          Signalement #{incident.id.slice(0, 8)}
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
                Statut
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
                Priorité
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
            Informations du signalement
          </Text>
          
          <View style={styles.gap12}>
            <View>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                Type de problème
              </Text>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {getIncidentTypeText(incident.type)}
              </Text>
            </View>

            {incident.bike && (
              <View>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  Vélo concerné
                </Text>
                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                  {incident.bike.code} - {incident.bike.model}
                </Text>
              </View>
            )}

            <View>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                Date de création
              </Text>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {new Date(incident.createdAt).toLocaleDateString('fr-FR', {
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
                  Résolu le
                </Text>
                <Text variant="body" color="#16a34a">
                  {new Date(incident.resolvedAt).toLocaleDateString('fr-FR', {
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
            Description détaillée
          </Text>
          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ lineHeight: 20 }}>
            {incident.description}
          </Text>
        </Card>

        {/* Photos */}
        {incident.photos && incident.photos.length > 0 && (
          <Card style={styles.p16}>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb12}>
              Photos jointes ({incident.photos.length})
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
                    Photo {index + 1}
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
                  Remboursement effectué
                </Text>
                <Text size="sm" color="#6b7280" style={styles.mt4}>
                  Montant : {incident.refundAmount} XOF
                </Text>
                <Text size="xs" color="#6b7280">
                  Le montant a été crédité sur votre portefeuille
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
                Note de l'administrateur
              </Text>
            </View>
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ lineHeight: 20 }}>
              {incident.adminNote}
            </Text>
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
                Modifier le signalement
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
              Retour
            </Text>
          </Button>
        </View>

        {/* Help Text */}
        <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.textCenter, { lineHeight: 18 }]}>
          {incident.status === 'OPEN' 
            ? 'Votre signalement sera traité dans les plus brefs délais. Vous recevrez une notification dès qu\'il sera pris en charge.'
            : incident.status === 'IN_PROGRESS'
            ? 'Votre signalement est actuellement en cours de traitement par notre équipe technique.'
            : 'Ce signalement a été traité. Merci pour votre contribution à l\'amélioration de notre service.'
          }
        </Text>
      </ScrollView>
    </View>
  );
}