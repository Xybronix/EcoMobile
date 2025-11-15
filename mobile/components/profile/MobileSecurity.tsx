import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { userService } from '@/services/userService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Lock, Shield, Smartphone } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileSecurityProps {
  onNavigate: (screen: string) => void;
}

export function MobileSecurity({ onNavigate }: MobileSecurityProps) {
  const { language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(
        language === 'fr'
          ? 'Veuillez remplir tous les champs'
          : 'Please fill in all fields'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        language === 'fr'
          ? 'Les mots de passe ne correspondent pas'
          : 'Passwords do not match'
      );
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        language === 'fr'
          ? 'Le mot de passe doit contenir au moins 8 caractères'
          : 'Password must be at least 8 characters'
      );
      return;
    }

    setIsLoading(true);

    try {
      await userService.updatePassword(currentPassword, newPassword);
      
      haptics.success();
      toast.success(
        language === 'fr'
          ? 'Mot de passe modifié avec succès'
          : 'Password changed successfully'
      );
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      haptics.error();
      
      let errorMessage = language === 'fr'
        ? 'Erreur lors du changement de mot de passe'
        : 'Error changing password';
      
      switch (error.message) {
        case 'invalid_credentials':
          errorMessage = language === 'fr'
            ? 'Mot de passe actuel incorrect'
            : 'Current password is incorrect';
          break;
        case 'same_password':
          errorMessage = language === 'fr'
            ? 'Le nouveau mot de passe doit être différent de l\'ancien'
            : 'New password must be different from current password';
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

  const handleDeleteAccount = async () => {
    setIsLoading(true);

    try {
      await userService.deleteAccount();
      
      haptics.success();
      toast.success(
        language === 'fr'
          ? 'Compte supprimé avec succès'
          : 'Account deleted successfully'
      );
      setShowDeleteDialog(false);
      
      // La déconnexion est gérée automatiquement par le service
    } catch (error: any) {
      haptics.error();
      
      let errorMessage = language === 'fr'
        ? 'Erreur lors de la suppression du compte'
        : 'Error deleting account';
      
      switch (error.message) {
        case 'unauthorized':
          errorMessage = language === 'fr'
            ? 'Non autorisé'
            : 'Unauthorized';
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[
        styles.px16, 
        styles.py16, 
        styles.row, 
        styles.alignCenter,
        styles.gap12,
        { 
          backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
          borderBottomWidth: 1,
          borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
        }
      ]}>
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
        <Text variant="subtitle" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
          {language === 'fr' ? 'Sécurité' : 'Security'}
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p24, styles.pb32]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gap24}>
          {/* Password Section */}
          <View style={styles.gap12}>
            <Text 
              size="sm" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
              style={styles.px8}
            >
              {language === 'fr' ? 'Mot de passe' : 'Password'}
            </Text>
            <View style={[styles.card, styles.rounded12]}>
              {!showPasswordForm ? (
                <View style={[styles.p12, styles.gap12]}>
                  <View style={[styles.row, styles.alignCenter, styles.gap12]}>
                    <View 
                      style={[
                        styles.roundedFull,
                        styles.alignCenter,
                        styles.justifyCenter,
                        { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
                      ]}
                    >
                      <Lock size={20} color="#2563eb" />
                    </View>
                    <View>
                      <Text 
                        variant="body" 
                        color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                      >
                        {language === 'fr' ? 'Modifier le mot de passe' : 'Change password'}
                      </Text>
                      <Text 
                        size="sm" 
                        color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                      >
                        {language === 'fr'
                          ? 'Dernière modification il y a 30 jours'
                          : 'Last changed 30 days ago'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      haptics.light();
                      setShowPasswordForm(true);
                    }}
                    style={[
                      styles.px12,
                      styles.py12,
                      styles.rounded8,
                      { borderWidth: 1, borderColor: '#d1d5db' }
                    ]}
                  >
                    <Text 
                      variant="body" 
                      color={colorScheme === 'light' ? '#374151' : '#f9fafb'}
                      style={styles.textCenter}
                    >
                      {language === 'fr' ? 'Modifier' : 'Change'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.p12}>
                  <View style={styles.gap16}>
                    <View style={styles.gap8}>
                      <Text 
                        variant="body" 
                        color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                      >
                        {language === 'fr' ? 'Mot de passe actuel' : 'Current password'}
                      </Text>
                      <View style={{ position: 'relative' }}>
                        <Input
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          secureTextEntry={!showCurrentPassword}
                          placeholder={language === 'fr' ? 'Mot de passe actuel' : 'Current password'}
                          style={{ paddingRight: 48 }}
                        />
                        <TouchableOpacity
                          onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={[styles.absolute, { right: 12, top: 14 }]}
                        >
                          {showCurrentPassword ? 
                            <EyeOff size={20} color="#6b7280" /> : 
                            <Eye size={20} color="#6b7280" />
                          }
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.gap8}>
                      <Text 
                        variant="body" 
                        color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                      >
                        {language === 'fr' ? 'Nouveau mot de passe' : 'New password'}
                      </Text>
                      <View style={{ position: 'relative' }}>
                        <Input
                          value={newPassword}
                          onChangeText={setNewPassword}
                          secureTextEntry={!showNewPassword}
                          placeholder={language === 'fr' ? 'Nouveau mot de passe' : 'New password'}
                          style={{ paddingRight: 48 }}
                        />
                        <TouchableOpacity
                          onPress={() => setShowNewPassword(!showNewPassword)}
                          style={[styles.absolute, { right: 12, top: 14 }]}
                        >
                          {showNewPassword ? 
                            <EyeOff size={20} color="#6b7280" /> : 
                            <Eye size={20} color="#6b7280" />
                          }
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.gap8}>
                      <Text 
                        variant="body" 
                        color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                      >
                        {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                      </Text>
                      <View style={{ position: 'relative' }}>
                        <Input
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry={!showConfirmPassword}
                          placeholder={language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                          style={{ paddingRight: 48 }}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={[styles.absolute, { right: 12, top: 14 }]}
                        >
                          {showConfirmPassword ? 
                            <EyeOff size={20} color="#6b7280" /> : 
                            <Eye size={20} color="#6b7280" />
                          }
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[styles.row, styles.gap8]}>
                      <TouchableOpacity
                        style={[
                          styles.flex1,
                          styles.p12,
                          styles.rounded8,
                          { borderWidth: 1, borderColor: '#d1d5db' }
                        ]}
                        onPress={() => {
                          setShowPasswordForm(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
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
                          { backgroundColor: '#16a34a' },
                          isLoading && { opacity: 0.6 }
                        ]}
                        onPress={handlePasswordChange}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text 
                            style={styles.textCenter}
                            color="white"
                            weight="medium"
                          >
                            {language === 'fr' ? 'Enregistrer' : 'Save'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Authentication Methods */}
          <View style={styles.gap12}>
            <Text 
              size="sm" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
              style={styles.px8}
            >
              {language === 'fr' ? 'Méthodes d\'authentification' : 'Authentication methods'}
            </Text>
            <View style={[styles.card, styles.rounded12]}>
              <View style={[
                styles.row, 
                styles.alignCenter, 
                styles.spaceBetween, 
                styles.p12
              ]}>
                <View style={[styles.row, styles.alignCenter, styles.gap12]}>
                  <View 
                    style={[
                      styles.w12,
                      styles.h12,
                      styles.roundedFull,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { backgroundColor: '#e0e7ff' }
                    ]}
                  >
                    <Shield size={20} color="#4f46e5" />
                  </View>
                  <View>
                    <Text 
                      variant="body" 
                      color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                    >
                      {language === 'fr' ? 'Authentification à deux facteurs' : 'Two-factor authentication'}
                    </Text>
                    <Text 
                      size="sm" 
                      color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                    >
                      {language === 'fr' ? 'Protection supplémentaire' : 'Extra security'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    // TODO: Implémenter l'authentification à deux facteurs
                    setTwoFactorAuth(!twoFactorAuth);
                  }}
                  style={[
                    styles.w12,
                    styles.h8,
                    styles.roundedFull,
                    styles.relative,
                    {
                      backgroundColor: twoFactorAuth ? '#16a34a' : 
                        colorScheme === 'light' ? '#d1d5db' : '#4b5563',
                    }
                  ]}
                >
                  <View 
                    style={[
                      styles.absolute,
                      styles.w8,
                      styles.h8,
                      styles.roundedFull,
                      {
                        backgroundColor: 'white',
                        left: twoFactorAuth ? 18 : 0,
                        transform: [{ translateX: twoFactorAuth ? 0 : -6 }],
                      }
                    ]} 
                  />
                </TouchableOpacity>
              </View>

              <View style={{ 
                height: 1, 
                backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151',
                marginHorizontal: 16 
              }} />

              <View style={[
                styles.row, 
                styles.alignCenter, 
                styles.spaceBetween, 
                styles.p12
              ]}>
                <View style={[styles.row, styles.alignCenter, styles.gap12]}>
                  <View 
                    style={[
                      styles.w12,
                      styles.h12,
                      styles.roundedFull,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { backgroundColor: '#dbeafe' }
                    ]}
                  >
                    <Smartphone size={20} color="#2563eb" />
                  </View>
                  <View>
                    <Text 
                      variant="body" 
                      color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                    >
                      {language === 'fr' ? 'Authentification biométrique' : 'Biometric authentication'}
                    </Text>
                    <Text 
                      size="sm" 
                      color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                    >
                      {language === 'fr' ? 'Empreinte digitale / Face ID' : 'Fingerprint / Face ID'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    // TODO: Implémenter l'authentification biométrique
                    setBiometricAuth(!biometricAuth);
                  }}
                  style={[
                    styles.w12,
                    styles.h8,
                    styles.roundedFull,
                    styles.relative,
                    {
                      backgroundColor: biometricAuth ? '#16a34a' : 
                        colorScheme === 'light' ? '#d1d5db' : '#4b5563',
                    }
                  ]}
                >
                  <View 
                    style={[
                      styles.absolute,
                      styles.w8,
                      styles.h8,
                      styles.roundedFull,
                      {
                        backgroundColor: 'white',
                        left: biometricAuth ? 18 : 0,
                        transform: [{ translateX: biometricAuth ? 0 : -6 }],
                      }
                    ]} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.gap12}>
            <Text 
              size="sm" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
              style={styles.px8}
            >
              {language === 'fr' ? 'Zone de danger' : 'Danger zone'}
            </Text>
            <View style={[
              styles.card, 
              styles.rounded12,
              { borderWidth: 1, borderColor: '#fecaca' }
            ]}>
              <View style={[styles.p12, styles.gap16]}>
                <View style={[styles.row, styles.alignCenter, styles.gap12]}>
                  <View 
                    style={[
                      styles.w12,
                      styles.h12,
                      styles.roundedFull,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { backgroundColor: '#fef2f2' }
                    ]}
                  >
                    <AlertTriangle size={20} color="#dc2626" />
                  </View>
                  <View style={styles.flex1}>
                    <Text 
                      variant="body" 
                      color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                    >
                      {language === 'fr' ? 'Supprimer le compte' : 'Delete account'}
                    </Text>
                    <Text 
                      size="sm" 
                      color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                    >
                      {language === 'fr'
                        ? 'Cette action est irréversible. Toutes vos données seront définitivement supprimées.'
                        : 'This action is irreversible. All your data will be permanently deleted.'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    setShowDeleteDialog(true);
                  }}
                  style={[
                    styles.p12,
                    styles.rounded8,
                    { borderWidth: 1, borderColor: '#dc2626' }
                  ]}
                >
                  <Text 
                    style={styles.textCenter}
                    color="#dc2626"
                    weight="medium"
                  >
                    {language === 'fr' ? 'Supprimer mon compte' : 'Delete my account'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Dialog */}
      <Modal
        visible={showDeleteDialog}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <View style={[
          styles.flex1,
          styles.justifyCenter,
          styles.alignCenter,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          styles.p24
        ]}>
          <View style={[
            styles.card,
            styles.rounded16,
            styles.p24,
            { width: '100%', maxWidth: 400 }
          ]}>
            <Text 
              variant="subtitle" 
              color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
              style={styles.mb8}
            >
              {language === 'fr' ? 'Supprimer le compte ?' : 'Delete account?'}
            </Text>
            <Text 
              size="sm" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
              style={styles.mb24}
            >
              {language === 'fr'
                ? 'Cette action est irréversible. Êtes-vous absolument sûr de vouloir supprimer votre compte et toutes vos données ?'
                : 'This action is irreversible. Are you absolutely sure you want to delete your account and all your data?'}
            </Text>
            <View style={[styles.row, styles.gap12]}>
              <TouchableOpacity
                style={[
                  styles.flex1,
                  styles.p12,
                  styles.rounded8,
                  styles.alignCenter, 
                  styles.justifyCenter,
                  { borderWidth: 1, borderColor: '#d1d5db' }
                ]}
                onPress={() => setShowDeleteDialog(false)}
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
                  styles.alignCenter, 
                  styles.justifyCenter,
                  { backgroundColor: '#dc2626' }
                ]}
                onPress={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text 
                    style={styles.textCenter}
                    color="white"
                    weight="medium"
                  >
                    {language === 'fr' ? 'Supprimer définitivement' : 'Delete permanently'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}