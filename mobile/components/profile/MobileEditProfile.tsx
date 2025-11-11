import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Edit, Mail, Save, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '../../lib/mobile-auth';
import { useMobileI18n } from '../../lib/mobile-i18n';

interface MobileEditProfileProps {
  onNavigate: (screen: string) => void;
}

export default function MobileEditProfile({ onNavigate }: MobileEditProfileProps) {
  const { user, updateProfile, refreshUser } = useMobileAuth();
  const { language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [originalData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error(
        language === 'fr'
          ? 'Veuillez remplir tous les champs obligatoires'
          : 'Please fill in all required fields'
      );
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      });
      
      await refreshUser();
      
      haptics.success();
      toast.success(
        language === 'fr'
          ? 'Profil mis à jour avec succès'
          : 'Profile updated successfully'
      );
      setIsEditing(false);
    } catch (error: any) {
      haptics.error();
      
      let errorMessage = language === 'fr'
        ? 'Erreur lors de la mise à jour du profil'
        : 'Error updating profile';
      
      switch (error.message) {
        case 'invalid_data':
          errorMessage = language === 'fr'
            ? 'Données invalides'
            : 'Invalid data';
          break;
        case 'user_already_exists':
          errorMessage = language === 'fr'
            ? 'Un compte existe déjà avec cet email'
            : 'An account already exists with this email';
          break;
        case 'network_error':
          errorMessage = language === 'fr'
            ? 'Erreur de connexion'
            : 'Network error';
          break;
        case 'server_error':
          errorMessage = language === 'fr'
            ? 'Erreur serveur'
            : 'Server error';
          break;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = () => {
    return `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase();
  };

  const openImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        toast.error(
          language === 'fr' 
            ? 'Permission d\'accéder à la galerie refusée' 
            : 'Permission to access gallery denied'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        if (imageUri) {
          setSelectedImage(imageUri);
          setShowImageModal(true);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error(
        language === 'fr' 
          ? 'Erreur lors de la sélection de l\'image' 
          : 'Error selecting image'
      );
    }
  };

  const confirmImageChange = () => {
    // TODO: Implémenter l'upload de l'image vers le backend
    toast.success(
      language === 'fr' 
        ? 'Photo de profil mise à jour' 
        : 'Profile picture updated'
    );
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const cancelImageChange = () => {
    setSelectedImage(null);
    setShowImageModal(false);
  };

  const showImageSourceOptions = () => {
    haptics.light();
    openImagePicker();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View 
        style={[
          styles.px16, 
          styles.py16, 
          styles.row, 
          styles.alignCenter,
          styles.spaceBetween,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
          }
        ]}
      >
        <View style={[styles.row, styles.alignCenter, styles.gap12]}>
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              onNavigate('profile');
            }}
            style={[
              styles.p8,
              styles.roundedFull,
              { backgroundColor: colorScheme === 'light' ? 'transparent' : '#374151' }
            ]}
          >
            <ArrowLeft size={24} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
          </TouchableOpacity>
          <Text 
            variant="subtitle" 
            color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
          >
            {language === 'fr' ? 'Modifier le profil' : 'Edit Profile'}
          </Text>
        </View>
        
        {!isEditing && (
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              setIsEditing(true);
            }}
            style={[
              styles.p8,
              styles.roundedFull,
              { backgroundColor: '#16a34a' }
            ]}
          >
            <Edit size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gap24}>
          {/* Profile Picture */}
          <View style={[styles.alignCenter, styles.gap8]}>
            <View style={{ position: 'relative' }}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={[
                    styles.w96,
                    styles.h96,
                    styles.rounded32
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <View 
                  style={[
                    styles.w96,
                    styles.h96,
                    styles.rounded32,
                    styles.alignCenter,
                    styles.justifyCenter,
                    { backgroundColor: '#16a34a' }
                  ]}
                >
                  <Text variant="title" color="white" size="xl">
                    {getInitials()}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={showImageSourceOptions}
                style={[
                  styles.absolute,
                  styles.w32,
                  styles.h32,
                  styles.rounded16,
                  styles.alignCenter,
                  styles.justifyCenter,
                  { 
                    backgroundColor: '#16a34a',
                    bottom: 0,
                    right: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5
                  }
                ]}
              >
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text 
              size="sm" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
            >
              {language === 'fr' ? 'Changer la photo' : 'Change photo'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.gap16}>
            {/* First Name & Last Name Row */}
            <View style={[styles.row, styles.gap12]}>
              <View style={styles.flex1}>
                <View style={styles.gap8}>
                  <Text 
                    variant="body" 
                    color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                  >
                    {language === 'fr' ? 'Prénom' : 'First Name'}
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <User 
                      size={20} 
                      color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} 
                      style={{ position: 'absolute', left: 12, top: 14, zIndex: 1 }}
                    />
                    <Input
                      value={formData.firstName}
                      onChangeText={(value) => handleChange('firstName', value)}
                      style={{ paddingLeft: 40 }}
                      editable={isEditing}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.flex1}>
                <View style={styles.gap8}>
                  <Text 
                    variant="body" 
                    color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                  >
                    {language === 'fr' ? 'Nom' : 'Last Name'}
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <User 
                      size={20} 
                      color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} 
                      style={{ position: 'absolute', left: 12, top: 14, zIndex: 1 }}
                    />
                    <Input
                      value={formData.lastName}
                      onChangeText={(value) => handleChange('lastName', value)}
                      style={{ paddingLeft: 40 }}
                      editable={isEditing}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Email */}
            <View style={styles.gap8}>
              <Text 
                variant="body" 
                color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
              >
                {language === 'fr' ? 'Adresse email' : 'Email address'}
              </Text>
              <View style={{ position: 'relative' }}>
                <Mail 
                  size={20} 
                  color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} 
                  style={{ position: 'absolute', left: 12, top: 14, zIndex: 1 }}
                />
                <Input
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ paddingLeft: 40 }}
                  editable={isEditing}
                />
              </View>
              {user?.verificationStatus?.email && (
                <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                  <Text size="xs" color="#16a34a">✓</Text>
                  <Text size="xs" color="#16a34a">
                    {language === 'fr' ? 'Email vérifié' : 'Email verified'}
                  </Text>
                </View>
              )}
            </View>

            {/* Phone */}
            <View style={styles.gap8}>
              <Text 
                variant="body" 
                color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
              >
                {language === 'fr' ? 'Numéro de téléphone' : 'Phone number'}
              </Text>
              <View style={{ position: 'relative' }}>
                <PhoneInput
                  value={formData.phone}
                  onChangeText={(value) => handleChange('phone', value)}
                  placeholder={language === 'fr' ? '6 90 63 58 27' : '6 90 63 58 27'}
                  defaultCountry="CM"
                  disabled={!isEditing}
                />
              </View>
              {user?.verificationStatus?.phone && (
                <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                  <Text size="xs" color="#16a34a">✓</Text>
                  <Text size="xs" color="#16a34a">
                    {language === 'fr' ? 'Téléphone vérifié' : 'Phone verified'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={[styles.column, styles.gap12, styles.pt16]}>
              <Button
                variant="outline"
                onPress={() => {
                  haptics.light();
                  handleCancel();
                }}
                fullWidth
                style={{ height: 48 }}
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button
                onPress={handleSubmit}
                disabled={isLoading}
                fullWidth
                style={{ 
                  backgroundColor: '#16a34a',
                  height: 48
                }}
              >
                <View style={[styles.row, styles.alignCenter, styles.gap8]}>
                  <Save size={20} color="white" />
                  <Text color="white">
                    {isLoading
                      ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
                      : (language === 'fr' ? 'Enregistrer' : 'Save')}
                  </Text>
                </View>
              </Button>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={cancelImageChange}
      >
        <View style={[
          styles.flex1,
          styles.justifyCenter,
          styles.alignCenter,
          { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
          styles.p24
        ]}>
          <View style={[
            styles.card,
            styles.rounded16,
            styles.p24,
            { width: '100%', maxWidth: 400 }
          ]}>
            <View style={[styles.row, styles.alignCenter, styles.spaceBetween, styles.mb16]}>
              <Text 
                variant="subtitle" 
                color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
              >
                {language === 'fr' ? 'Prévisualisation' : 'Preview'}
              </Text>
              <TouchableOpacity
                onPress={cancelImageChange}
                style={[
                  styles.p8,
                  styles.roundedFull,
                  { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
                ]}
              >
                <X size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
              </TouchableOpacity>
            </View>

            {selectedImage && (
              <View style={[styles.alignCenter, styles.mb24]}>
                <Image
                  source={{ uri: selectedImage }}
                  style={[
                    styles.w64,
                    styles.h64,
                    styles.rounded16
                  ]}
                  resizeMode="cover"
                />
                <Text 
                  size="sm" 
                  color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                  style={[styles.textCenter, styles.mt12]}
                >
                  {language === 'fr' 
                    ? 'Aperçu de votre nouvelle photo de profil'
                    : 'Preview of your new profile picture'}
                </Text>
              </View>
            )}

            <Text 
              size="sm" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
              style={[styles.textCenter, styles.mb24]}
            >
              {language === 'fr' 
                ? 'Voulez-vous utiliser cette image comme photo de profil ?'
                : 'Do you want to use this image as your profile picture?'}
            </Text>

            <View style={[styles.row, styles.gap12]}>
              <TouchableOpacity
                style={[
                  styles.flex1,
                  styles.p12,
                  styles.rounded8,
                  { borderWidth: 1, borderColor: '#d1d5db' }
                ]}
                onPress={cancelImageChange}
              >
                <Text 
                  style={styles.textCenter}
                  color={colorScheme === 'light' ? '#374151' : '#f9fafb'}
                  weight="medium"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.flex1,
                  styles.p12,
                  styles.rounded8,
                  { backgroundColor: '#16a34a' }
                ]}
                onPress={confirmImageChange}
              >
                <Text 
                  style={styles.textCenter}
                  color="white"
                  weight="medium"
                >
                  {language === 'fr' ? 'Confirmer' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}