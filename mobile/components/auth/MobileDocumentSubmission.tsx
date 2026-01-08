<<<<<<< HEAD
/* eslint-disable react-hooks/exhaustive-deps */
=======
>>>>>>> origin/main
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
<<<<<<< HEAD
import { documentService, type DocumentsStatus } from '@/services/documentService';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { MobileHeader } from '@/components/layout/MobileHeader';
=======
import { documentService, type DocumentsStatus, type IdentityDocument, type ResidenceProof } from '@/services/documentService';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
>>>>>>> origin/main
import { 
  FileText, 
  MapPin, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
<<<<<<< HEAD
=======
  Upload,
>>>>>>> origin/main
  Image as ImageIcon
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  Alert,
<<<<<<< HEAD
  RefreshControl,
  Dimensions
=======
  RefreshControl
>>>>>>> origin/main
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { OSMMap } from '@/components/maps/OSMMap';

interface MobileDocumentSubmissionProps {
  onNavigate: (screen: string) => void;
}

<<<<<<< HEAD
const { width: screenWidth } = Dimensions.get('window');

export default function MobileDocumentSubmission({ onNavigate }: MobileDocumentSubmissionProps) {
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
=======
export default function MobileDocumentSubmission({ onNavigate }: MobileDocumentSubmissionProps) {
  const { user, refreshUser } = useMobileAuth();
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

>>>>>>> origin/main
  const [documentsStatus, setDocumentsStatus] = useState<DocumentsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Identity document state
  const [documentType, setDocumentType] = useState<'CNI' | 'RECEPISSE'>('CNI');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  // Residence proof state
  const [proofType, setProofType] = useState<'DOCUMENT' | 'MAP_COORDINATES'>('DOCUMENT');
  const [residenceDocument, setResidenceDocument] = useState<string | null>(null);
  const [residenceLocation, setResidenceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [residenceAddress, setResidenceAddress] = useState('');
  const [residenceDetails, setResidenceDetails] = useState('');

  useEffect(() => {
    loadDocumentsStatus();
  }, []);

  const loadDocumentsStatus = async () => {
    try {
      setIsLoading(true);
      const status = await documentService.getDocumentsStatus();
      setDocumentsStatus(status);
      
      // Pre-fill with existing data if available
      if (status.identityDocuments.length > 0) {
        const doc = status.identityDocuments[0];
        setDocumentType(doc.documentType);
      }
      if (status.residenceProof) {
        const proof = status.residenceProof;
        setProofType(proof.proofType);
        if (proof.latitude && proof.longitude) {
          setResidenceLocation({ lat: proof.latitude, lng: proof.longitude });
        }
        setResidenceAddress(proof.address || '');
        setResidenceDetails(proof.details || '');
      }
    } catch (error: any) {
      console.error('Error loading documents status:', error);
<<<<<<< HEAD
      
      // Si erreur d'autorisation, le service a déjà géré la déconnexion
      if (error.message === 'unauthorized' || error.message === 'not_authenticated') {
        // Ne pas afficher d'erreur, la déconnexion est gérée par le service
        // L'utilisateur sera redirigé automatiquement
        return;
      }
      
=======
>>>>>>> origin/main
      toast.error(error.message || t('common.error'));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

<<<<<<< HEAD
  const pickImage = async (_side: 'front' | 'back' | 'residence'): Promise<string | null> => {
=======
  const pickImage = async (side: 'front' | 'back' | 'residence'): Promise<string | null> => {
>>>>>>> origin/main
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error(t('document.cameraPermissionDenied'));
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          return `data:image/jpeg;base64,${asset.base64}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error(t('document.imageError'));
      return null;
    }
  };

<<<<<<< HEAD
  const takePhoto = async (_side: 'front' | 'back' | 'residence'): Promise<string | null> => {
=======
  const takePhoto = async (side: 'front' | 'back' | 'residence'): Promise<string | null> => {
>>>>>>> origin/main
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        toast.error(t('document.cameraPermissionDenied'));
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          return `data:image/jpeg;base64,${asset.base64}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.error(t('document.imageError'));
      return null;
    }
  };

  const showImageSourceOptions = (side: 'front' | 'back' | 'residence') => {
    Alert.alert(
      t('document.selectImageSource'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('document.takePhoto'), 
          onPress: async () => {
            const image = await takePhoto(side);
            if (image) {
              if (side === 'front') setFrontImage(image);
              else if (side === 'back') setBackImage(image);
              else setResidenceDocument(image);
            }
          }
        },
        { 
          text: t('document.chooseFromGallery'), 
          onPress: async () => {
            const image = await pickImage(side);
            if (image) {
              if (side === 'front') setFrontImage(image);
              else if (side === 'back') setBackImage(image);
              else setResidenceDocument(image);
            }
          }
        },
      ]
    );
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.error(t('document.locationPermissionDenied'));
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setResidenceLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      
      // Reverse geocoding
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (addresses.length > 0) {
        const addr = addresses[0];
        const addressParts = [
          addr.street,
          addr.district,
          addr.city,
          addr.country,
        ].filter(Boolean);
        setResidenceAddress(addressParts.join(', '));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error(t('document.locationError'));
    }
  };

  const handleSubmitIdentityDocument = async () => {
    if (!frontImage) {
      toast.error(t('document.frontImageRequired'));
      return;
    }

    haptics.light();
    setIsSubmitting(true);

    try {
      await documentService.submitIdentityDocument({
        documentType,
        frontImage,
        backImage: backImage || undefined,
      });
      
      haptics.success();
      toast.success(t('document.submitted'));
      await loadDocumentsStatus();
      setFrontImage(null);
      setBackImage(null);
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('document.submissionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResidenceProof = async () => {
    if (proofType === 'DOCUMENT' && !residenceDocument) {
      toast.error(t('document.residenceDocumentRequired'));
      return;
    }
    
    if (proofType === 'MAP_COORDINATES' && !residenceLocation) {
      toast.error(t('document.residenceLocationRequired'));
      return;
    }

    haptics.light();
    setIsSubmitting(true);

    try {
      await documentService.submitResidenceProof({
        proofType,
        documentFile: residenceDocument || undefined,
        latitude: residenceLocation?.lat,
        longitude: residenceLocation?.lng,
        address: residenceAddress || undefined,
        details: residenceDetails || undefined,
      });
      
      haptics.success();
      toast.success(t('document.submitted'));
      await loadDocumentsStatus();
      setResidenceDocument(null);
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('document.submissionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
<<<<<<< HEAD
        return (
          <Badge variant="default" style={[styles.row, styles.alignCenter, { backgroundColor: '#16a34a' }]}>
            <CheckCircle size={14} color="white" style={styles.mr4} />
            <Text style={[styles.textSm, { color: 'white' }]}>{t('document.approved')}</Text>
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" style={[styles.row, styles.alignCenter]}>
            <XCircle size={14} color="white" style={styles.mr4} />
            <Text style={[styles.textSm, { color: 'white' }]}>{t('document.rejected')}</Text>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" style={[styles.row, styles.alignCenter]}>
            <Clock size={14} color={colorScheme === 'light' ? '#374151' : '#d1d5db'} style={styles.mr4} />
            <Text style={[styles.textSm, { color: colorScheme === 'light' ? '#374151' : '#d1d5db' }]}>{t('document.pending')}</Text>
          </Badge>
        );
=======
        return <Badge variant="success"><CheckCircle size={14} /> {t('document.approved')}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle size={14} /> {t('document.rejected')}</Badge>;
      default:
        return <Badge variant="secondary"><Clock size={14} /> {t('document.pending')}</Badge>;
>>>>>>> origin/main
    }
  };

  if (isLoading) {
    return (
<<<<<<< HEAD
      <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }]}>
        <MobileHeader title={t('document.submission')} />
        <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter]}>
          <ActivityIndicator size="large" color="#5D5CDE" />
          <Text style={[styles.mt16, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
            {t('common.loading')}
          </Text>
        </View>
=======
      <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter]}>
        <ActivityIndicator size="large" color="#5D5CDE" />
        <Text style={[styles.text, styles.mt4, styles.textGray]}>
          {t('common.loading')}
        </Text>
>>>>>>> origin/main
      </View>
    );
  }

  const allApproved = documentsStatus?.allDocumentsApproved;
  const allSubmitted = documentsStatus?.allDocumentsSubmitted;

  return (
<<<<<<< HEAD
    <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }]}>
      <MobileHeader 
        title={t('document.submission')}
        showBackButton
        onBack={() => onNavigate('home')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, { paddingVertical: 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadDocumentsStatus}
            tintColor="#5D5CDE"
          />
        }
      >
        {allApproved ? (
          <Card style={[styles.mb24, styles.p16, { backgroundColor: colorScheme === 'light' ? '#d1fae5' : '#064e3b' }]}>
            <View style={[styles.row, styles.alignCenter, styles.mb8]}>
              <CheckCircle size={24} color={colorScheme === 'light' ? '#16a34a' : '#34d399'} />
              <Text style={[styles.textLg, styles.textSemiBold, styles.ml8, { color: colorScheme === 'light' ? '#16a34a' : '#34d399' }]}>
                {t('document.allApproved')}
              </Text>
            </View>
            <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
=======
    <ScrollView
      style={styles.flex1}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadDocumentsStatus} />
      }
    >
      <View style={[styles.p16]}>
        {allApproved ? (
          <Card style={[styles.p6, styles.mb6, { backgroundColor: '#d1fae5' }]}>
            <View style={[styles.row, styles.alignCenter, styles.mb2]}>
              <CheckCircle size={24} color="#16a34a" />
              <Text style={[styles.textLg, styles.fontBold, styles.ml2, { color: '#16a34a' }]}>
                {t('document.allApproved')}
              </Text>
            </View>
            <Text style={[styles.text, styles.textGray]}>
>>>>>>> origin/main
              {t('document.waitingAdminValidation')}
            </Text>
          </Card>
        ) : allSubmitted ? (
<<<<<<< HEAD
          <Card style={[styles.mb24, styles.p16, { backgroundColor: colorScheme === 'light' ? '#fef3c7' : '#92400e' }]}>
            <View style={[styles.row, styles.alignCenter, styles.mb8]}>
              <Clock size={24} color={colorScheme === 'light' ? '#d97706' : '#fbbf24'} />
              <Text style={[styles.textLg, styles.textSemiBold, styles.ml8, { color: colorScheme === 'light' ? '#d97706' : '#fbbf24' }]}>
                {t('document.allSubmitted')}
              </Text>
            </View>
            <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
=======
          <Card style={[styles.p6, styles.mb6, { backgroundColor: '#fef3c7' }]}>
            <View style={[styles.row, styles.alignCenter, styles.mb2]}>
              <Clock size={24} color="#d97706" />
              <Text style={[styles.textLg, styles.fontBold, styles.ml2, { color: '#d97706' }]}>
                {t('document.allSubmitted')}
              </Text>
            </View>
            <Text style={[styles.text, styles.textGray]}>
>>>>>>> origin/main
              {t('document.waitingAdminReview')}
            </Text>
          </Card>
        ) : null}

        {/* Identity Document Section */}
<<<<<<< HEAD
        <Card style={[styles.mb24]}>
          <View style={[styles.row, styles.alignCenter, styles.mb16]}>
            <FileText size={24} color="#5D5CDE" />
            <Text style={[styles.textXl, styles.textBold, styles.ml8]}>
=======
        <Card style={[styles.p6, styles.mb6]}>
          <View style={[styles.row, styles.alignCenter, styles.mb4]}>
            <FileText size={24} color="#5D5CDE" />
            <Text style={[styles.textXl, styles.fontBold, styles.ml2]}>
>>>>>>> origin/main
              {t('document.identityDocument')}
            </Text>
          </View>

          {documentsStatus?.identityDocuments.map((doc) => (
<<<<<<< HEAD
            <View 
              key={doc.id} 
              style={[
                styles.mb16, 
                styles.p12, 
                { 
                  backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#1f2937',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
                }
              ]}
            >
              <View style={[styles.row, styles.alignCenter, styles.justifyBetween, styles.mb8]}>
                <Text style={[styles.text, styles.textSemiBold]}>
=======
            <View key={doc.id} style={[styles.mb4, styles.p4, { backgroundColor: '#f3f4f6', borderRadius: 8 }]}>
              <View style={[styles.row, styles.alignCenter, styles.justifyBetween, styles.mb2]}>
                <Text style={[styles.text, styles.fontSemibold]}>
>>>>>>> origin/main
                  {doc.documentType === 'CNI' ? t('document.cni') : t('document.recepisse')}
                </Text>
                {getStatusBadge(doc.status)}
              </View>
              {doc.rejectionReason && (
<<<<<<< HEAD
                <View style={[
                  styles.mt8, 
                  styles.p8, 
                  { 
                    backgroundColor: colorScheme === 'light' ? '#fee2e2' : '#7f1d1d',
                    borderRadius: 6 
                  }
                ]}>
                  <View style={[styles.row, styles.alignStart, styles.mb4]}>
                    <AlertCircle size={16} color={colorScheme === 'light' ? '#dc2626' : '#fca5a5'} />
                    <Text style={[styles.textSm, styles.textSemiBold, styles.ml4, { color: colorScheme === 'light' ? '#dc2626' : '#fca5a5' }]}>
                      {t('document.rejectionReason')}
                    </Text>
                  </View>
                  <Text style={[styles.textSm, { color: colorScheme === 'light' ? '#991b1b' : '#fca5a5' }]}>
=======
                <View style={[styles.mt2, styles.p3, { backgroundColor: '#fee2e2', borderRadius: 6 }]}>
                  <View style={[styles.row, styles.alignStart, styles.mb1]}>
                    <AlertCircle size={16} color="#dc2626" />
                    <Text style={[styles.textSm, styles.fontSemibold, styles.ml1, { color: '#dc2626' }]}>
                      {t('document.rejectionReason')}
                    </Text>
                  </View>
                  <Text style={[styles.textSm, { color: '#991b1b' }]}>
>>>>>>> origin/main
                    {doc.rejectionReason}
                  </Text>
                </View>
              )}
            </View>
          ))}

<<<<<<< HEAD
          <View style={[styles.mb16]}>
            <Label>{t('document.documentType')}</Label>
            <View style={[styles.row, styles.gap8]}>
=======
          <View style={[styles.mb4]}>
            <Label>{t('document.documentType')}</Label>
            <View style={[styles.row, styles.gap2]}>
>>>>>>> origin/main
              <TouchableOpacity
                onPress={() => setDocumentType('CNI')}
                style={[
                  styles.flex1,
<<<<<<< HEAD
                  styles.p12,
                  styles.rounded8,
                  { 
                    backgroundColor: documentType === 'CNI' ? '#5D5CDE' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                    borderWidth: 1,
                    borderColor: documentType === 'CNI' ? '#5D5CDE' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
=======
                  styles.p4,
                  styles.rounded,
                  { 
                    backgroundColor: documentType === 'CNI' ? '#5D5CDE' : '#f3f4f6',
                    borderWidth: 1,
                    borderColor: documentType === 'CNI' ? '#5D5CDE' : '#e5e7eb',
>>>>>>> origin/main
                  }
                ]}
              >
                <Text style={[
                  styles.text,
<<<<<<< HEAD
                  styles.textSemiBold,
                  { 
                    color: documentType === 'CNI' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                    textAlign: 'center'
                  }
=======
                  styles.fontSemibold,
                  { color: documentType === 'CNI' ? 'white' : '#374151' }
>>>>>>> origin/main
                ]}>
                  {t('document.cni')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDocumentType('RECEPISSE')}
                style={[
                  styles.flex1,
<<<<<<< HEAD
                  styles.p12,
                  styles.rounded8,
                  { 
                    backgroundColor: documentType === 'RECEPISSE' ? '#5D5CDE' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                    borderWidth: 1,
                    borderColor: documentType === 'RECEPISSE' ? '#5D5CDE' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
=======
                  styles.p4,
                  styles.rounded,
                  { 
                    backgroundColor: documentType === 'RECEPISSE' ? '#5D5CDE' : '#f3f4f6',
                    borderWidth: 1,
                    borderColor: documentType === 'RECEPISSE' ? '#5D5CDE' : '#e5e7eb',
>>>>>>> origin/main
                  }
                ]}
              >
                <Text style={[
                  styles.text,
<<<<<<< HEAD
                  styles.textSemiBold,
                  { 
                    color: documentType === 'RECEPISSE' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                    textAlign: 'center'
                  }
=======
                  styles.fontSemibold,
                  { color: documentType === 'RECEPISSE' ? 'white' : '#374151' }
>>>>>>> origin/main
                ]}>
                  {t('document.recepisse')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

<<<<<<< HEAD
          <View style={[styles.mb16]}>
=======
          <View style={[styles.mb4]}>
>>>>>>> origin/main
            <Label>{t('document.frontImage')} *</Label>
            <TouchableOpacity
              onPress={() => showImageSourceOptions('front')}
              style={[
<<<<<<< HEAD
                styles.p12,
                styles.rounded8,
                { 
                  borderWidth: 2,
                  borderColor: colorScheme === 'light' ? '#d1d5db' : '#4b5563',
                  borderStyle: frontImage ? 'solid' : 'dashed',
                  minHeight: 150,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#1f2937'
                }
              ]}
            >
              {frontImage ? (
                <Image 
                  source={{ uri: frontImage }} 
                  style={{ 
                    width: '100%', 
                    height: 150, 
                    borderRadius: 8,
                    backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151'
                  }} 
                  resizeMode="cover" 
                />
              ) : (
                <View style={[styles.alignCenter]}>
                  <Camera size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }, styles.mt8]}>
=======
                styles.p4,
                styles.rounded,
                styles.border,
                { borderColor: '#d1d5db', minHeight: 150, justifyContent: 'center', alignItems: 'center' }
              ]}
            >
              {frontImage ? (
                <Image source={{ uri: frontImage }} style={{ width: '100%', height: 150, borderRadius: 8 }} resizeMode="cover" />
              ) : (
                <View style={[styles.alignCenter]}>
                  <Camera size={32} color="#9ca3af" />
                  <Text style={[styles.text, styles.textGray, styles.mt2]}>
>>>>>>> origin/main
                    {t('document.takeOrSelectPhoto')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

<<<<<<< HEAD
          <View style={[styles.mb16]}>
=======
          <View style={[styles.mb4]}>
>>>>>>> origin/main
            <Label>{t('document.backImage')} ({t('common.optional')})</Label>
            <TouchableOpacity
              onPress={() => showImageSourceOptions('back')}
              style={[
<<<<<<< HEAD
                styles.p12,
                styles.rounded8,
                { 
                  borderWidth: 2,
                  borderColor: colorScheme === 'light' ? '#d1d5db' : '#4b5563',
                  borderStyle: backImage ? 'solid' : 'dashed',
                  minHeight: 150,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#1f2937'
                }
              ]}
            >
              {backImage ? (
                <Image 
                  source={{ uri: backImage }} 
                  style={{ 
                    width: '100%', 
                    height: 150, 
                    borderRadius: 8,
                    backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151'
                  }} 
                  resizeMode="cover" 
                />
              ) : (
                <View style={[styles.alignCenter]}>
                  <Camera size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }, styles.mt8]}>
=======
                styles.p4,
                styles.rounded,
                styles.border,
                { borderColor: '#d1d5db', minHeight: 150, justifyContent: 'center', alignItems: 'center' }
              ]}
            >
              {backImage ? (
                <Image source={{ uri: backImage }} style={{ width: '100%', height: 150, borderRadius: 8 }} resizeMode="cover" />
              ) : (
                <View style={[styles.alignCenter]}>
                  <Camera size={32} color="#9ca3af" />
                  <Text style={[styles.text, styles.textGray, styles.mt2]}>
>>>>>>> origin/main
                    {t('document.takeOrSelectPhoto')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Button
            onPress={handleSubmitIdentityDocument}
            disabled={isSubmitting || !frontImage}
<<<<<<< HEAD
            fullWidth
=======
>>>>>>> origin/main
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
<<<<<<< HEAD
              <Text style={{ color: 'white', fontWeight: '500' }}>
=======
              <Text style={[styles.textWhite, styles.fontSemibold]}>
>>>>>>> origin/main
                {t('document.submit')}
              </Text>
            )}
          </Button>
        </Card>

        {/* Residence Proof Section */}
<<<<<<< HEAD
        <Card>
          <View style={[styles.row, styles.alignCenter, styles.mb16]}>
            <MapPin size={24} color="#5D5CDE" />
            <Text style={[styles.textXl, styles.textBold, styles.ml8]}>
=======
        <Card style={[styles.p6]}>
          <View style={[styles.row, styles.alignCenter, styles.mb4]}>
            <MapPin size={24} color="#5D5CDE" />
            <Text style={[styles.textXl, styles.fontBold, styles.ml2]}>
>>>>>>> origin/main
              {t('document.residenceProof')}
            </Text>
          </View>

          {documentsStatus?.residenceProof && (
<<<<<<< HEAD
            <View 
              style={[
                styles.mb16, 
                styles.p12, 
                { 
                  backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#1f2937',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
                }
              ]}
            >
              <View style={[styles.row, styles.alignCenter, styles.justifyBetween, styles.mb8]}>
                <Text style={[styles.text, styles.textSemiBold]}>
=======
            <View style={[styles.mb4, styles.p4, { backgroundColor: '#f3f4f6', borderRadius: 8 }]}>
              <View style={[styles.row, styles.alignCenter, styles.justifyBetween, styles.mb2]}>
                <Text style={[styles.text, styles.fontSemibold]}>
>>>>>>> origin/main
                  {documentsStatus.residenceProof.proofType === 'DOCUMENT' 
                    ? t('document.document') 
                    : t('document.mapCoordinates')}
                </Text>
                {getStatusBadge(documentsStatus.residenceProof.status)}
              </View>
              {documentsStatus.residenceProof.rejectionReason && (
<<<<<<< HEAD
                <View style={[
                  styles.mt8, 
                  styles.p8, 
                  { 
                    backgroundColor: colorScheme === 'light' ? '#fee2e2' : '#7f1d1d',
                    borderRadius: 6 
                  }
                ]}>
                  <View style={[styles.row, styles.alignStart, styles.mb4]}>
                    <AlertCircle size={16} color={colorScheme === 'light' ? '#dc2626' : '#fca5a5'} />
                    <Text style={[styles.textSm, styles.textSemiBold, styles.ml4, { color: colorScheme === 'light' ? '#dc2626' : '#fca5a5' }]}>
                      {t('document.rejectionReason')}
                    </Text>
                  </View>
                  <Text style={[styles.textSm, { color: colorScheme === 'light' ? '#991b1b' : '#fca5a5' }]}>
=======
                <View style={[styles.mt2, styles.p3, { backgroundColor: '#fee2e2', borderRadius: 6 }]}>
                  <View style={[styles.row, styles.alignStart, styles.mb1]}>
                    <AlertCircle size={16} color="#dc2626" />
                    <Text style={[styles.textSm, styles.fontSemibold, styles.ml1, { color: '#dc2626' }]}>
                      {t('document.rejectionReason')}
                    </Text>
                  </View>
                  <Text style={[styles.textSm, { color: '#991b1b' }]}>
>>>>>>> origin/main
                    {documentsStatus.residenceProof.rejectionReason}
                  </Text>
                </View>
              )}
            </View>
          )}

<<<<<<< HEAD
          <View style={[styles.mb16]}>
            <Label>{t('document.proofType')}</Label>
            <View style={[styles.row, styles.gap8]}>
=======
          <View style={[styles.mb4]}>
            <Label>{t('document.proofType')}</Label>
            <View style={[styles.row, styles.gap2]}>
>>>>>>> origin/main
              <TouchableOpacity
                onPress={() => setProofType('DOCUMENT')}
                style={[
                  styles.flex1,
<<<<<<< HEAD
                  styles.p12,
                  styles.rounded8,
                  { 
                    backgroundColor: proofType === 'DOCUMENT' ? '#5D5CDE' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                    borderWidth: 1,
                    borderColor: proofType === 'DOCUMENT' ? '#5D5CDE' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
=======
                  styles.p4,
                  styles.rounded,
                  { 
                    backgroundColor: proofType === 'DOCUMENT' ? '#5D5CDE' : '#f3f4f6',
                    borderWidth: 1,
                    borderColor: proofType === 'DOCUMENT' ? '#5D5CDE' : '#e5e7eb',
>>>>>>> origin/main
                  }
                ]}
              >
                <Text style={[
                  styles.text,
<<<<<<< HEAD
                  styles.textSemiBold,
                  { 
                    color: proofType === 'DOCUMENT' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                    textAlign: 'center'
                  }
=======
                  styles.fontSemibold,
                  { color: proofType === 'DOCUMENT' ? 'white' : '#374151' }
>>>>>>> origin/main
                ]}>
                  {t('document.document')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setProofType('MAP_COORDINATES')}
                style={[
                  styles.flex1,
<<<<<<< HEAD
                  styles.p12,
                  styles.rounded8,
                  { 
                    backgroundColor: proofType === 'MAP_COORDINATES' ? '#5D5CDE' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                    borderWidth: 1,
                    borderColor: proofType === 'MAP_COORDINATES' ? '#5D5CDE' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
=======
                  styles.p4,
                  styles.rounded,
                  { 
                    backgroundColor: proofType === 'MAP_COORDINATES' ? '#5D5CDE' : '#f3f4f6',
                    borderWidth: 1,
                    borderColor: proofType === 'MAP_COORDINATES' ? '#5D5CDE' : '#e5e7eb',
>>>>>>> origin/main
                  }
                ]}
              >
                <Text style={[
                  styles.text,
<<<<<<< HEAD
                  styles.textSemiBold,
                  { 
                    color: proofType === 'MAP_COORDINATES' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                    textAlign: 'center'
                  }
=======
                  styles.fontSemibold,
                  { color: proofType === 'MAP_COORDINATES' ? 'white' : '#374151' }
>>>>>>> origin/main
                ]}>
                  {t('document.mapCoordinates')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {proofType === 'DOCUMENT' ? (
<<<<<<< HEAD
            <View style={[styles.mb16]}>
=======
            <View style={[styles.mb4]}>
>>>>>>> origin/main
              <Label>{t('document.residenceDocument')} *</Label>
              <TouchableOpacity
                onPress={() => showImageSourceOptions('residence')}
                style={[
<<<<<<< HEAD
                  styles.p12,
                  styles.rounded8,
                  { 
                    borderWidth: 2,
                    borderColor: colorScheme === 'light' ? '#d1d5db' : '#4b5563',
                    borderStyle: residenceDocument ? 'solid' : 'dashed',
                    minHeight: 150,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#1f2937'
                  }
                ]}
              >
                {residenceDocument ? (
                  <Image 
                    source={{ uri: residenceDocument }} 
                    style={{ 
                      width: '100%', 
                      height: 150, 
                      borderRadius: 8,
                      backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151'
                    }} 
                    resizeMode="cover" 
                  />
                ) : (
                  <View style={[styles.alignCenter]}>
                    <ImageIcon size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
                    <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }, styles.mt8]}>
=======
                  styles.p4,
                  styles.rounded,
                  styles.border,
                  { borderColor: '#d1d5db', minHeight: 150, justifyContent: 'center', alignItems: 'center' }
                ]}
              >
                {residenceDocument ? (
                  <Image source={{ uri: residenceDocument }} style={{ width: '100%', height: 150, borderRadius: 8 }} resizeMode="cover" />
                ) : (
                  <View style={[styles.alignCenter]}>
                    <ImageIcon size={32} color="#9ca3af" />
                    <Text style={[styles.text, styles.textGray, styles.mt2]}>
>>>>>>> origin/main
                      {t('document.takeOrSelectPhoto')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
<<<<<<< HEAD
              <View style={[styles.mb16]}>
=======
              <View style={[styles.mb4]}>
>>>>>>> origin/main
                <Label>{t('document.residenceLocation')} *</Label>
                <Button
                  onPress={getCurrentLocation}
                  variant="outline"
<<<<<<< HEAD
                  style={[styles.mb12]}
                  fullWidth
                >
                  <MapPin size={20} color="#5D5CDE" />
                  <Text style={[styles.ml8, { color: '#5D5CDE', fontWeight: '500' }]}>
=======
                  style={[styles.mb2]}
                >
                  <MapPin size={20} color="#5D5CDE" />
                  <Text style={[styles.textPrimary, styles.fontSemibold, styles.ml2]}>
>>>>>>> origin/main
                    {t('document.getCurrentLocation')}
                  </Text>
                </Button>
                
                {residenceLocation && (
<<<<<<< HEAD
                  <View style={[styles.mt8, { height: 200, borderRadius: 8, overflow: 'hidden' }]}>
=======
                  <View style={[styles.mt2, { height: 200, borderRadius: 8, overflow: 'hidden' }]}>
>>>>>>> origin/main
                    <OSMMap
                      userLocation={residenceLocation}
                      bikes={[]}
                      radius={0}
                      colorScheme={colorScheme}
                    />
                  </View>
                )}
              </View>

<<<<<<< HEAD
              <View style={[styles.mb16]}>
=======
              <View style={[styles.mb4]}>
>>>>>>> origin/main
                <Label>{t('document.address')}</Label>
                <Input
                  value={residenceAddress}
                  onChangeText={setResidenceAddress}
                  placeholder={t('document.addressPlaceholder')}
<<<<<<< HEAD
                  placeholderTextColor={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
                />
              </View>

              <View style={[styles.mb16]}>
=======
                />
              </View>

              <View style={[styles.mb4]}>
>>>>>>> origin/main
                <Label>{t('document.details')}</Label>
                <Input
                  value={residenceDetails}
                  onChangeText={setResidenceDetails}
                  placeholder={t('document.detailsPlaceholder')}
<<<<<<< HEAD
                  placeholderTextColor={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
                  multiline
                  numberOfLines={4}
                  style={{ height: 100 }}
=======
                  multiline
                  numberOfLines={4}
>>>>>>> origin/main
                />
              </View>
            </>
          )}

          <Button
            onPress={handleSubmitResidenceProof}
            disabled={isSubmitting || (proofType === 'DOCUMENT' && !residenceDocument) || (proofType === 'MAP_COORDINATES' && !residenceLocation)}
<<<<<<< HEAD
            fullWidth
=======
>>>>>>> origin/main
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
<<<<<<< HEAD
              <Text style={{ color: 'white', fontWeight: '500' }}>
=======
              <Text style={[styles.textWhite, styles.fontSemibold]}>
>>>>>>> origin/main
                {t('document.submit')}
              </Text>
            )}
          </Button>
        </Card>
<<<<<<< HEAD
      </ScrollView>
    </View>
  );
}
=======
      </View>
    </ScrollView>
  );
}
>>>>>>> origin/main
