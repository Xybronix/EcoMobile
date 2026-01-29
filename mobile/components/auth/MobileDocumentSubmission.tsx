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
import { useMobileAuth } from '@/lib/mobile-auth';
import { 
  FileText, 
  MapPin, 
  Camera, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Image as ImageIcon,
  Video
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  Alert,
  RefreshControl,
  Platform,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { OSMMap } from '@/components/maps/OSMMap';

interface MobileDocumentSubmissionProps {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

export default function MobileDocumentSubmission({ onNavigate }: MobileDocumentSubmissionProps) {
  const { t } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  const [documentsStatus, setDocumentsStatus] = useState<DocumentsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal state for image source selection (web)
  const [imageSourceModal, setImageSourceModal] = useState<{
    visible: boolean;
    side: 'front' | 'back' | 'residence' | 'selfie' | 'activity' | null;
  }>({
    visible: false,
    side: null
  });

  // Identity document state
  const [documentType, setDocumentType] = useState<'CNI' | 'RECEPISSE'>('CNI');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  // Residence proof state
  const [proofType, setProofType] = useState<'DOCUMENT' | 'MAP_COORDINATES'>('DOCUMENT');
  const [residenceDocument, setResidenceDocument] = useState<string | null>(null);
  const [residenceLocation, setResidenceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [residenceAddress, setResidenceAddress] = useState('');
  const [residenceDetails, setResidenceDetails] = useState('');

  // Activity location proof state
  const [activityProofType, setActivityProofType] = useState<'DOCUMENT' | 'MAP_COORDINATES'>('DOCUMENT');
  const [activityDocument, setActivityDocument] = useState<string | null>(null);
  const [activityLocation, setActivityLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activityAddress, setActivityAddress] = useState('');
  const [activityDetails, setActivityDetails] = useState('');

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
      if (status.activityLocationProof) {
        const proof = status.activityLocationProof;
        setActivityProofType(proof.proofType);
        if (proof.latitude && proof.longitude) {
          setActivityLocation({ lat: proof.latitude, lng: proof.longitude });
        }
        setActivityAddress(proof.address || '');
        setActivityDetails(proof.details || '');
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


  const pickImage = async (_side: 'front' | 'back' | 'residence' | 'selfie' | 'activity', allowVideo: boolean = false): Promise<string | null> => {
    const isWeb = Platform.OS === 'web';
    
    // Gestion web avec input file HTML
    if (isWeb && typeof (globalThis as any).window !== 'undefined' && typeof (globalThis as any).window.document !== 'undefined') {
      return new Promise((resolve) => {
        const window = (globalThis as any).window;
        const input = window.document.createElement('input') as any;
        input.type = 'file';
        input.accept = allowVideo ? 'image/*,video/*' : 'image/*';
        input.multiple = false;
        
        input.onchange = async (event: Event) => {
          const target = event.target as any;
          const files = target.files;
          if (files && files[0]) {
            const file = files[0] as File;
            
            // Validation du type de fichier
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/mov', 'video/webm'];
            
            if (!validImageTypes.includes(file.type) && !(allowVideo && validVideoTypes.includes(file.type))) {
              toast.error(t('document.invalidImageFormat') || 'Format de fichier invalide');
              resolve(null);
              return;
            }
            
            // Validation de la taille (max 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
              toast.error(t('document.imageTooLarge') || 'Fichier trop volumineux (max 10MB)');
              resolve(null);
              return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              resolve(base64);
            };
            reader.onerror = () => {
              toast.error(t('document.imageError') || 'Erreur lors de la lecture du fichier');
              resolve(null);
            };
            reader.readAsDataURL(file);
          } else {
            resolve(null);
          }
        };
        
        input.oncancel = () => {
          resolve(null);
        };
        
        input.click();
      });
    }

    // Gestion mobile avec ImagePicker
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error(t('document.cameraPermissionDenied'));
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: allowVideo ? ImagePicker.MediaTypeOptions.All : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
        videoMaxDuration: allowVideo ? 30 : undefined,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.type === 'video' && asset.uri) {
          try {
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any,
            });
            const mimeType = asset.uri.includes('.mov') ? 'video/quicktime' : 'video/mp4';
            return `data:${mimeType};base64,${base64}`;
          } catch (error) {
            console.error('Error converting video to base64:', error);
            toast.error(t('document.videoError'));
            return null;
          }
        } else if (asset.base64) {
          const mimeType = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
          return `data:${mimeType};base64,${asset.base64}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error(t('document.imageError'));
      return null;
    }
  };


  const takePhoto = async (_side: 'front' | 'back' | 'residence' | 'selfie' | 'activity', allowVideo: boolean = false): Promise<string | null> => {
    const isWeb = Platform.OS === 'web';
    
    // Gestion web avec input file HTML (capture="camera")
    if (isWeb && typeof (globalThis as any).window !== 'undefined' && typeof (globalThis as any).window.document !== 'undefined') {
      return new Promise((resolve) => {
        const window = (globalThis as any).window;
        const input = window.document.createElement('input') as any;
        input.type = 'file';
        input.accept = allowVideo ? 'image/*,video/*' : 'image/*';
        input.capture = 'environment'; // Utilise la caméra arrière si disponible
        input.multiple = false;
        
        input.onchange = async (event: Event) => {
          const target = event.target as any;
          const files = target.files;
          if (files && files[0]) {
            const file = files[0] as File;
            
            // Validation du type de fichier
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/mov', 'video/webm'];
            
            if (!validImageTypes.includes(file.type) && !(allowVideo && validVideoTypes.includes(file.type))) {
              toast.error(t('document.invalidImageFormat') || 'Format de fichier invalide');
              resolve(null);
              return;
            }
            
            // Validation de la taille (max 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
              toast.error(t('document.imageTooLarge') || 'Fichier trop volumineux (max 10MB)');
              resolve(null);
              return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              resolve(base64);
            };
            reader.onerror = () => {
              toast.error(t('document.imageError') || 'Erreur lors de la lecture du fichier');
              resolve(null);
            };
            reader.readAsDataURL(file);
          } else {
            resolve(null);
          }
        };
        
        input.oncancel = () => {
          resolve(null);
        };
        
        input.click();
      });
    }

    // Gestion mobile avec ImagePicker
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        toast.error(t('document.cameraPermissionDenied'));
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: allowVideo ? ImagePicker.MediaTypeOptions.All : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
        videoMaxDuration: allowVideo ? 30 : undefined,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.type === 'video' && asset.uri) {
          try {
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any,
            });
            const mimeType = asset.uri.includes('.mov') ? 'video/quicktime' : 'video/mp4';
            return `data:${mimeType};base64,${base64}`;
          } catch (error) {
            console.error('Error converting video to base64:', error);
            toast.error(t('document.videoError'));
            return null;
          }
        } else if (asset.base64) {
          const mimeType = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
          return `data:${mimeType};base64,${asset.base64}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.error(t('document.imageError'));
      return null;
    }
  };

  const recordVideo = async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        toast.error(t('document.cameraPermissionDenied'));
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30, // Max 30 seconds
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri) {
          // Convert video to base64
          try {
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any,
            });
            // Determine MIME type from URI or default to mp4
            const mimeType = asset.uri.includes('.mov') ? 'video/quicktime' : 'video/mp4';
            return `data:${mimeType};base64,${base64}`;
          } catch (error) {
            console.error('Error converting video to base64:', error);
            toast.error(t('document.videoError'));
            return null;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error recording video:', error);
      toast.error(t('document.videoError'));
      return null;
    }
  };

  const showImageSourceOptions = (side: 'front' | 'back' | 'residence' | 'selfie' | 'activity') => {
    const isWeb = Platform.OS === 'web';
    const isSelfie = side === 'selfie';
    
    // Sur web, afficher un modal personnalisé
    if (isWeb) {
      setImageSourceModal({ visible: true, side });
      return;
    }
    
    // Sur mobile, utiliser Alert
    const options: any[] = [
      { text: t('common.cancel'), style: 'cancel' },
      { 
        text: t('document.takePhoto'), 
        onPress: async () => {
          const image = await takePhoto(side, isSelfie);
          if (image) {
            if (side === 'front') setFrontImage(image);
            else if (side === 'back') setBackImage(image);
            else if (side === 'selfie') setSelfieImage(image);
            else if (side === 'activity') setActivityDocument(image);
            else setResidenceDocument(image);
          }
        }
      },
      { 
        text: t('document.chooseFromGallery'), 
        onPress: async () => {
          const image = await pickImage(side, isSelfie);
          if (image) {
            if (side === 'front') setFrontImage(image);
            else if (side === 'back') setBackImage(image);
            else if (side === 'selfie') setSelfieImage(image);
            else if (side === 'activity') setActivityDocument(image);
            else setResidenceDocument(image);
          }
        }
      },
    ];

    // Add video recording option for selfie
    if (isSelfie) {
      options.push({
        text: t('document.recordVideo'),
        onPress: async () => {
          const video = await recordVideo();
          if (video) {
            setSelfieImage(video);
          }
        }
      });
    }

    Alert.alert(
      isSelfie ? t('document.selectMediaSource') : t('document.selectImageSource'),
      '',
      options
    );
  };

  const handleImageSourceSelection = async (source: 'camera' | 'gallery' | 'video') => {
    if (!imageSourceModal.side) return;
    
    const side = imageSourceModal.side;
    const isSelfie = side === 'selfie';
    let result: string | null = null;
    
    setImageSourceModal({ visible: false, side: null });
    
    try {
      if (source === 'camera') {
        result = await takePhoto(side, isSelfie);
      } else if (source === 'gallery') {
        result = await pickImage(side, isSelfie);
      } else if (source === 'video' && isSelfie) {
        result = await recordVideo();
      }
      
      if (result) {
        if (side === 'front') setFrontImage(result);
        else if (side === 'back') setBackImage(result);
        else if (side === 'selfie') setSelfieImage(result);
        else if (side === 'activity') setActivityDocument(result);
        else setResidenceDocument(result);
      }
    } catch (error) {
      console.error('Error handling image source selection:', error);
    }
  };

  const getCurrentLocation = async (type: 'residence' | 'activity') => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.error(t('document.locationPermissionDenied'));
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const locationData = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      
      if (type === 'residence') {
        setResidenceLocation(locationData);
      } else {
        setActivityLocation(locationData);
      }
      
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
        const address = addressParts.join(', ');
        if (type === 'residence') {
          setResidenceAddress(address);
        } else {
          setActivityAddress(address);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error(t('document.locationError'));
    }
  };

  const handleSubmitActivityLocationProof = async () => {
    if (activityProofType === 'DOCUMENT' && !activityDocument) {
      toast.error(t('document.activityDocumentRequired'));
      return;
    }
    
    if (activityProofType === 'MAP_COORDINATES' && !activityLocation) {
      toast.error(t('document.activityLocationRequired'));
      return;
    }

    haptics.light();
    setIsSubmitting(true);

    try {
      await documentService.submitActivityLocationProof({
        proofType: activityProofType,
        documentFile: activityDocument || undefined,
        latitude: activityLocation?.lat,
        longitude: activityLocation?.lng,
        address: activityAddress || undefined,
        details: activityDetails || undefined,
      });
      
      haptics.success();
      toast.success(t('document.submitted'));
      await loadDocumentsStatus();
      setActivityDocument(null);
    } catch (error: any) {
      haptics.error();
      const errorMessage = getErrorMessageWithFallback(error, t);
      toast.error(errorMessage || t('document.submissionFailed'));
    } finally {
      setIsSubmitting(false);
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
        selfieImage: selfieImage || undefined,
      });
      
      haptics.success();
      toast.success(t('document.submitted'));
      await loadDocumentsStatus();
      setFrontImage(null);
      setBackImage(null);
      setSelfieImage(null);
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
          <ActivityIndicator size="large" color="#16a34a" />
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
        onBack={() => {
          if (documentsStatus?.allDocumentsApproved && user?.status === 'active') {
            onNavigate('home');
          } else {
            onNavigate('login');
          }
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, { paddingVertical: 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadDocumentsStatus}
            tintColor="#16a34a"
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
            <FileText size={24} color="#16a34a" />
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
                        backgroundColor: documentType === 'CNI' ? '#16a34a' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: documentType === 'CNI' ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
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
                        backgroundColor: documentType === 'RECEPISSE' ? '#16a34a' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: documentType === 'RECEPISSE' ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
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

              <View style={[styles.mb16]}>
                <Label>{t('document.selfie')} ({t('common.optional')})</Label>
                <TouchableOpacity
                  onPress={() => showImageSourceOptions('selfie')}
                  style={[
                    styles.p12,
                    styles.rounded8,
                    { 
                      borderWidth: 2,
                      borderColor: colorScheme === 'light' ? '#d1d5db' : '#4b5563',
                      borderStyle: selfieImage ? 'solid' : 'dashed',
                      minHeight: 150,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#1f2937'
                    }
                  ]}
                >
                  {selfieImage ? (
                    <View style={{ position: 'relative', width: '100%', height: 150 }}>
                      {selfieImage.startsWith('data:video/') ? (
                        <View style={[
                          styles.alignCenter,
                          styles.justifyCenter,
                          {
                            width: '100%',
                            height: 150,
                            borderRadius: 8,
                            backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151'
                          }
                        ]}>
                          <Video size={48} color={colorScheme === 'light' ? '#16a34a' : '#818cf8'} />
                          <Text style={[styles.text, styles.textSemiBold, styles.mt8, { color: colorScheme === 'light' ? '#16a34a' : '#818cf8' }]}>
                            {t('document.videoSelected')}
                          </Text>
                        </View>
                      ) : (
                        <Image 
                          source={{ uri: selfieImage }} 
                          style={{ 
                            width: '100%', 
                            height: 150, 
                            borderRadius: 8,
                            backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151'
                          }} 
                          resizeMode="cover" 
                        />
                      )}
                    </View>
                  ) : (
                    <View style={[styles.alignCenter]}>
                      <Camera size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
                      <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }, styles.mt8]}>
                        {t('document.takeSelfie')}
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
        <Card style={[styles.mb24]}>
          <View style={[styles.row, styles.alignCenter, styles.mb16]}>
            <MapPin size={24} color="#16a34a" />
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
                        backgroundColor: proofType === 'DOCUMENT' ? '#16a34a' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: proofType === 'DOCUMENT' ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
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
                        backgroundColor: proofType === 'MAP_COORDINATES' ? '#16a34a' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: proofType === 'MAP_COORDINATES' ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
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
                      onPress={() => getCurrentLocation('residence')}
                      variant="outline"
                      style={[styles.mb12]}
                      fullWidth
                    >
                      <View style={[styles.row, styles.alignCenter, styles.justifyCenter]}>
                        <MapPin size={20} color="#16a34a" />
                        <Text style={[styles.ml8, { color: '#16a34a', fontWeight: '500' }]}>
                          {t('document.getCurrentLocation')}
                        </Text>
                      </View>
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

        {/* Activity Location Proof Section */}
        <Card>
          <View style={[styles.row, styles.alignCenter, styles.mb16]}>
            <MapPin size={24} color="#16a34a" />
            <View style={styles.flex1}>
              <Text style={[styles.textXl, styles.textBold, styles.ml8]}>
                {t('document.activityLocationProof')}
              </Text>
              <Text style={[styles.textSm, styles.ml8, styles.mt4, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
                {t('document.activityLocationProofDesc')}
              </Text>
            </View>
          </View>

          {documentsStatus?.activityLocationProof && (
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
                  {documentsStatus.activityLocationProof.proofType === 'DOCUMENT' 
                    ? t('document.document') 
                    : t('document.mapCoordinates')}
                </Text>
                {getStatusBadge(documentsStatus.activityLocationProof.status)}
              </View>
              {documentsStatus.activityLocationProof.rejectionReason && (
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
                    {documentsStatus.activityLocationProof.rejectionReason}
                  </Text>
                </View>
              )}
            </View>
          )}

          {!documentsStatus?.activityLocationProof || 
           (documentsStatus.activityLocationProof.status !== 'PENDING' && 
            documentsStatus.activityLocationProof.status !== 'APPROVED') ? (
            <>
              <View style={[styles.mb16]}>
                <Label>{t('document.proofType')}</Label>
                <View style={[styles.row, styles.gap8]}>
                  <TouchableOpacity
                    onPress={() => setActivityProofType('DOCUMENT')}
                    style={[
                      styles.flex1,
                      styles.p12,
                      styles.rounded8,
                      { 
                        backgroundColor: activityProofType === 'DOCUMENT' ? '#16a34a' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: activityProofType === 'DOCUMENT' ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
                      }
                    ]}
                  >
                    <Text style={[
                      styles.text,
                      styles.textSemiBold,
                      { 
                        color: activityProofType === 'DOCUMENT' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                        textAlign: 'center'
                      }
                    ]}>
                      {t('document.document')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActivityProofType('MAP_COORDINATES')}
                    style={[
                      styles.flex1,
                      styles.p12,
                      styles.rounded8,
                      { 
                        backgroundColor: activityProofType === 'MAP_COORDINATES' ? '#16a34a' : (colorScheme === 'light' ? '#f3f4f6' : '#374151'),
                        borderWidth: 1,
                        borderColor: activityProofType === 'MAP_COORDINATES' ? '#16a34a' : (colorScheme === 'light' ? '#e5e7eb' : '#4b5563'),
                      }
                    ]}
                  >
                    <Text style={[
                      styles.text,
                      styles.textSemiBold,
                      { 
                        color: activityProofType === 'MAP_COORDINATES' ? 'white' : (colorScheme === 'light' ? '#374151' : '#d1d5db'),
                        textAlign: 'center'
                      }
                    ]}>
                      {t('document.mapCoordinates')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {activityProofType === 'DOCUMENT' ? (
                <View style={[styles.mb16]}>
                  <Label>{t('document.activityDocument')} *</Label>
                  <TouchableOpacity
                    onPress={() => showImageSourceOptions('activity')}
                    style={[
                      styles.p12,
                      styles.rounded8,
                      { 
                        borderWidth: 2,
                        borderColor: colorScheme === 'light' ? '#d1d5db' : '#4b5563',
                        borderStyle: activityDocument ? 'solid' : 'dashed',
                        minHeight: 150,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#1f2937'
                      }
                    ]}
                  >
                    {activityDocument ? (
                      <Image 
                        source={{ uri: activityDocument }} 
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
                    <Label>{t('document.activityLocation')} *</Label>
                    <Button
                      onPress={() => getCurrentLocation('activity')}
                      variant="outline"
                      style={[styles.mb12]}
                      fullWidth
                    >
                      <View style={[styles.row, styles.alignCenter, styles.justifyCenter]}>
                        <MapPin size={20} color="#16a34a" />
                        <Text style={[styles.ml8, { color: '#16a34a', fontWeight: '500' }]}>
                          {t('document.getCurrentLocation')}
                        </Text>
                      </View>
                    </Button>
                    
                    {activityLocation && (
                      <View style={[styles.mt8, { height: 200, borderRadius: 8, overflow: 'hidden' }]}>
                        <OSMMap
                          userLocation={activityLocation}
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
                      value={activityAddress}
                      onChangeText={setActivityAddress}
                      placeholder={t('document.addressPlaceholder')}
                      placeholderTextColor={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
                    />
                  </View>

                  <View style={[styles.mb16]}>
                    <Label>{t('document.details')}</Label>
                    <Input
                      value={activityDetails}
                      onChangeText={setActivityDetails}
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
                onPress={handleSubmitActivityLocationProof}
                disabled={isSubmitting || (activityProofType === 'DOCUMENT' && !activityDocument) || (activityProofType === 'MAP_COORDINATES' && !activityLocation)}
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
                {documentsStatus.activityLocationProof.status === 'APPROVED' 
                  ? t('document.alreadyApproved')
                  : t('document.waitingForReview')}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Modal pour la sélection de source d'image (Web) */}
      <Modal
        visible={imageSourceModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageSourceModal({ visible: false, side: null })}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }}
          activeOpacity={1}
          onPress={() => setImageSourceModal({ visible: false, side: null })}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8
            }}
          >
            <Text style={[
              styles.textXl,
              styles.textBold,
              styles.mb16,
              { color: colorScheme === 'light' ? '#111827' : '#f9fafb', textAlign: 'center' }
            ]}>
              {imageSourceModal.side === 'selfie' 
                ? t('document.selectMediaSource') 
                : t('document.selectImageSource')}
            </Text>

            <View style={styles.gap12}>
              {/* Option Caméra */}
              <TouchableOpacity
                onPress={() => handleImageSourceSelection('camera')}
                style={[
                  styles.row,
                  styles.alignCenter,
                  styles.p16,
                  styles.rounded8,
                  {
                    backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151',
                    borderWidth: 1,
                    borderColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563'
                  }
                ]}
              >
                <Camera size={24} color="#16a34a" />
                <Text style={[
                  styles.text,
                  styles.textSemiBold,
                  styles.ml12,
                  { color: colorScheme === 'light' ? '#111827' : '#f9fafb' }
                ]}>
                  {t('document.takePhoto')}
                </Text>
              </TouchableOpacity>

              {/* Option Galerie */}
              <TouchableOpacity
                onPress={() => handleImageSourceSelection('gallery')}
                style={[
                  styles.row,
                  styles.alignCenter,
                  styles.p16,
                  styles.rounded8,
                  {
                    backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151',
                    borderWidth: 1,
                    borderColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563'
                  }
                ]}
              >
                <ImageIcon size={24} color="#16a34a" />
                <Text style={[
                  styles.text,
                  styles.textSemiBold,
                  styles.ml12,
                  { color: colorScheme === 'light' ? '#111827' : '#f9fafb' }
                ]}>
                  {t('document.chooseFromGallery')}
                </Text>
              </TouchableOpacity>

              {/* Option Vidéo (uniquement pour selfie) */}
              {imageSourceModal.side === 'selfie' && (
                <TouchableOpacity
                  onPress={() => handleImageSourceSelection('video')}
                  style={[
                    styles.row,
                    styles.alignCenter,
                    styles.p16,
                    styles.rounded8,
                    {
                      backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151',
                      borderWidth: 1,
                      borderColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563'
                    }
                  ]}
                >
                  <Video size={24} color="#16a34a" />
                  <Text style={[
                    styles.text,
                    styles.textSemiBold,
                    styles.ml12,
                    { color: colorScheme === 'light' ? '#111827' : '#f9fafb' }
                  ]}>
                    {t('document.recordVideo')}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Bouton Annuler */}
              <TouchableOpacity
                onPress={() => setImageSourceModal({ visible: false, side: null })}
                style={[
                  styles.p16,
                  styles.rounded8,
                  styles.mt8,
                  {
                    backgroundColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563',
                    borderWidth: 1,
                    borderColor: colorScheme === 'light' ? '#d1d5db' : '#6b7280'
                  }
                ]}
              >
                <Text style={[
                  styles.text,
                  styles.textSemiBold,
                  { 
                    color: colorScheme === 'light' ? '#111827' : '#f9fafb',
                    textAlign: 'center'
                  }
                ]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}