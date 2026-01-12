/* eslint-disable react-hooks/exhaustive-deps */
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
import { MobileHeader } from '@/components/layout/MobileHeader';
import { documentService, type DocumentsStatus } from '@/services/documentService';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { getErrorMessageWithFallback } from '@/utils/errorHandler';
import { 
  FileText, 
  MapPin, 
  Camera, 
  CheckCircle, 
  Clock, 
  AlertCircle,
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
  RefreshControl
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { OSMMap } from '@/components/maps/OSMMap';

interface MobileDocumentSubmissionProps {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

export default function MobileDocumentSubmission({ onNavigate, onBack }: MobileDocumentSubmissionProps) {
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

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

      
      // Si erreur d'autorisation, le service a déjà géré la déconnexion
      if (error.message === 'unauthorized' || error.message === 'not_authenticated') {
        // Ne pas afficher d'erreur, la déconnexion est gérée par le service
        // L'utilisateur sera redirigé automatiquement
        return;
      }
      

      const errorMessage = getErrorMessageWithFallback(error, t);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };


  const pickImage = async (_side: 'front' | 'back' | 'residence'): Promise<string | null> => {

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


  const takePhoto = async (_side: 'front' | 'back' | 'residence'): Promise<string | null> => {

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
      const errorMessage = getErrorMessageWithFallback(error, t);
      toast.error(errorMessage || t('document.submissionFailed'));
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
      const errorMessage = getErrorMessageWithFallback(error, t);
      toast.error(errorMessage || t('document.submissionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeBaseStyle = {
      ...styles.row,
      ...styles.alignCenter,
    };
    
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="default" style={[badgeBaseStyle, { backgroundColor: '#16a34a' }]}>
            <Text style={[styles.textSm, { color: 'white' }]}>{t('document.approved')}</Text>
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" style={badgeBaseStyle}>
            <Text style={[styles.textSm, { color: 'white' }]}>{t('document.rejected')}</Text>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" style={badgeBaseStyle}>
            <Text style={[styles.textSm, { color: colorScheme === 'light' ? '#374151' : '#d1d5db' }]}>{t('document.pending')}</Text>
          </Badge>
        );

    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }]}>
        <MobileHeader title={t('document.submission')} />
        <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter]}>
          <ActivityIndicator size="large" color="#5D5CDE" />
          <Text style={[styles.mt16, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
            {t('common.loading')}
          </Text>
        </View>
      </View>
    );
  }

  const allApproved = documentsStatus?.allDocumentsApproved;
  const allSubmitted = documentsStatus?.allDocumentsSubmitted;
  const identityDocuments = documentsStatus?.identityDocuments || [];
  const residenceProof = documentsStatus?.residenceProof;
  
  // Vérifier si l'identité est en attente ou approuvée
  const identityHasPendingOrApproved = identityDocuments.some(doc => 
    doc.status === 'PENDING' || doc.status === 'APPROVED'
  );
  
  // Vérifier si la résidence est en attente ou approuvée
  const residenceHasPendingOrApproved = residenceProof && 
    (residenceProof.status === 'PENDING' || residenceProof.status === 'APPROVED');

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }]}>
      <MobileHeader 
        title={t('document.submission')}
        showBack
        onBack={(() => onNavigate('home'))}
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
              <Text style={[styles.textXl, styles.textSemiBold, styles.ml8, { color: colorScheme === 'light' ? '#16a34a' : '#34d399' }]}>
                {t('document.allApproved')}
              </Text>
            </View>
            <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
              {t('document.waitingAdminValidation')}
            </Text>
          </Card>
        ) : allSubmitted ? (
          <Card style={[styles.mb24, styles.p16, { backgroundColor: colorScheme === 'light' ? '#fef3c7' : '#92400e' }]}>
            <View style={[styles.row, styles.alignCenter, styles.mb8]}>
              <Clock size={24} color={colorScheme === 'light' ? '#d97706' : '#fbbf24'} />
              <Text style={[styles.textXl, styles.textSemiBold, styles.ml8, { color: colorScheme === 'light' ? '#d97706' : '#fbbf24' }]}>
                {t('document.allSubmitted')}
              </Text>
            </View>
            <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
              {t('document.waitingAdminReview')}
            </Text>
          </Card>
        ) : null}

        {/* Identity Document Section */}
        <Card style={[styles.mb24]}>
          <View style={[styles.row, styles.alignCenter, styles.mb16]}>
            <FileText size={24} color="#5D5CDE" />
            <Text style={[styles.textXl, styles.textBold, styles.ml8]}>
              {t('document.identityDocument')}
            </Text>
          </View>

          {identityDocuments.map((doc) => (
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
                  {doc.documentType === 'CNI' ? t('document.cni') : t('document.recepisse')}
                </Text>
                {getStatusBadge(doc.status)}
              </View>
              {doc.rejectionReason && (
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
                    {doc.rejectionReason}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Afficher les champs de soumission uniquement si aucun document n'est en attente ou approuvé */}
          {!identityHasPendingOrApproved ? (
            <>
              <View style={[styles.mb16]}>
                <Label>{t('document.documentType')}</Label>
                <View style={[styles.row, styles.gap8]}>
                  <TouchableOpacity
                    onPress={() => setDocumentType('CNI')}
                    style={[
                      styles.flex1,
                      styles.p12,
                      styles.rounded8,
                      { 
                        backgroundColor: documentType === 'CNI' ? '#5D5CDE' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: documentType === 'CNI' ? '#5D5CDE' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
                      }
                    ]}
                  >
                    <Text style={[
                      styles.text,
                      styles.textSemiBold,
                      { 
                        color: documentType === 'CNI' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                        textAlign: 'center'
                      }
                    ]}>
                      {t('document.cni')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDocumentType('RECEPISSE')}
                    style={[
                      styles.flex1,
                      styles.p12,
                      styles.rounded8,
                      { 
                        backgroundColor: documentType === 'RECEPISSE' ? '#5D5CDE' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: documentType === 'RECEPISSE' ? '#5D5CDE' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
                      }
                    ]}
                  >
                    <Text style={[
                      styles.text,
                      styles.textSemiBold,
                      { 
                        color: documentType === 'RECEPISSE' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                        textAlign: 'center'
                      }
                    ]}>
                      {t('document.recepisse')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.mb16]}>
                <Label>{t('document.frontImage')} *</Label>
                <TouchableOpacity
                  onPress={() => showImageSourceOptions('front')}
                  style={[
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
                        {t('document.takeOrSelectPhoto')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={[styles.mb16]}>
                <Label>{t('document.backImage')} ({t('common.optional')})</Label>
                <TouchableOpacity
                  onPress={() => showImageSourceOptions('back')}
                  style={[
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
                        {t('document.takeOrSelectPhoto')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Button
                onPress={handleSubmitIdentityDocument}
                disabled={isSubmitting || !frontImage}
                fullWidth
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '500' }}>
                    {t('document.submit')}
                  </Text>
                )}
              </Button>
            </>
          ) : (
            <View style={[styles.p12, styles.mb16, { 
              backgroundColor: colorScheme === 'light' ? '#f0f9ff' : '#0c4a6e',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colorScheme === 'light' ? '#bae6fd' : '#0369a1'
            }]}>
              <Text style={[
                styles.text,
                styles.textSemiBold,
                { 
                  color: colorScheme === 'light' ? '#0369a1' : '#bae6fd',
                  textAlign: 'center'
                }
              ]}>
                {identityDocuments.some(doc => doc.status === 'APPROVED') 
                  ? t('document.alreadyApproved')
                  : t('document.waitingForReview')}
              </Text>
            </View>
          )}
        </Card>

        {/* Residence Proof Section */}
        <Card>
          <View style={[styles.row, styles.alignCenter, styles.mb16]}>
            <MapPin size={24} color="#5D5CDE" />
            <Text style={[styles.textXl, styles.textBold, styles.ml8]}>
              {t('document.residenceProof')}
            </Text>
          </View>

          {residenceProof && (
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
                  {residenceProof.proofType === 'DOCUMENT' 
                    ? t('document.document') 
                    : t('document.mapCoordinates')}
                </Text>
                {getStatusBadge(residenceProof.status)}
              </View>
              {residenceProof.rejectionReason && (
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
                    {residenceProof.rejectionReason}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Afficher les champs de soumission uniquement si aucune preuve n'est en attente ou approuvée */}
          {!residenceHasPendingOrApproved ? (
            <>
              <View style={[styles.mb16]}>
                <Label>{t('document.proofType')}</Label>
                <View style={[styles.row, styles.gap8]}>
                  <TouchableOpacity
                    onPress={() => setProofType('DOCUMENT')}
                    style={[
                      styles.flex1,
                      styles.p12,
                      styles.rounded8,
                      { 
                        backgroundColor: proofType === 'DOCUMENT' ? '#5D5CDE' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: proofType === 'DOCUMENT' ? '#5D5CDE' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
                      }
                    ]}
                  >
                    <Text style={[
                      styles.text,
                      styles.textSemiBold,
                      { 
                        color: proofType === 'DOCUMENT' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                        textAlign: 'center'
                      }
                    ]}>
                      {t('document.document')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setProofType('MAP_COORDINATES')}
                    style={[
                      styles.flex1,
                      styles.p12,
                      styles.rounded8,
                      { 
                        backgroundColor: proofType === 'MAP_COORDINATES' ? '#5D5CDE' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: proofType === 'MAP_COORDINATES' ? '#5D5CDE' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
                      }
                    ]}
                  >
                    <Text style={[
                      styles.text,
                      styles.textSemiBold,
                      { 
                        color: proofType === 'MAP_COORDINATES' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                        textAlign: 'center'
                      }
                    ]}>
                      {t('document.mapCoordinates')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {proofType === 'DOCUMENT' ? (
                <View style={[styles.mb16]}>
                  <Label>{t('document.residenceDocument')} *</Label>
                  <TouchableOpacity
                    onPress={() => showImageSourceOptions('residence')}
                    style={[
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
                          {t('document.takeOrSelectPhoto')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={[styles.mb16]}>
                    <Label>{t('document.residenceLocation')} *</Label>
                    <Button
                      onPress={getCurrentLocation}
                      variant="outline"
                      style={[styles.mb12]}
                      fullWidth
                    >
                      <MapPin size={20} color="#5D5CDE" />
                      <Text style={[styles.ml8, { color: '#5D5CDE', fontWeight: '500' }]}>
                        {t('document.getCurrentLocation')}
                      </Text>
                    </Button>
                    
                    {residenceLocation && (
                      <View style={[styles.mt8, { height: 200, borderRadius: 8, overflow: 'hidden' }]}>
                        <OSMMap
                          userLocation={residenceLocation}
                          bikes={[]}
                          radius={0}
                          colorScheme={colorScheme}
                        />
                      </View>
                    )}
                  </View>

                  <View style={[styles.mb16]}>
                    <Label>{t('document.address')}</Label>
                    <Input
                      value={residenceAddress}
                      onChangeText={setResidenceAddress}
                      placeholder={t('document.addressPlaceholder')}
                      placeholderTextColor={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
                    />
                  </View>

                  <View style={[styles.mb16]}>
                    <Label>{t('document.details')}</Label>
                    <Input
                      value={residenceDetails}
                      onChangeText={setResidenceDetails}
                      placeholder={t('document.detailsPlaceholder')}
                      placeholderTextColor={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
                      multiline
                      numberOfLines={4}
                      style={{ height: 100 }}
                    />
                  </View>
                </>
              )}

              <Button
                onPress={handleSubmitResidenceProof}
                disabled={isSubmitting || (proofType === 'DOCUMENT' && !residenceDocument) || (proofType === 'MAP_COORDINATES' && !residenceLocation)}
                fullWidth
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '500' }}>
                    {t('document.submit')}
                  </Text>
                )}
              </Button>
            </>
          ) : (
            <View style={[styles.p12, styles.mb16, { 
              backgroundColor: colorScheme === 'light' ? '#f0f9ff' : '#0c4a6e',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colorScheme === 'light' ? '#bae6fd' : '#0369a1'
            }]}>
              <Text style={[
                styles.text,
                styles.textSemiBold,
                { 
                  color: colorScheme === 'light' ? '#0369a1' : '#bae6fd',
                  textAlign: 'center'
                }
              ]}>
                {residenceProof?.status === 'APPROVED' 
                  ? t('document.alreadyApproved')
                  : t('document.waitingForReview')}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}