import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '../../lib/mobile-i18n';

interface MobileResetPasswordProps {
  onNavigate: (screen: string) => void;
}

export function MobileResetPassword({ onNavigate }: MobileResetPasswordProps) {
  const { language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const params = useLocalSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Récupérer le token depuis les paramètres d'URL
  const resetToken = params.token as string;

  const handleSubmit = async () => {
    setError('');
    
    if (!resetToken) {
      setError(
        language === 'fr'
          ? 'Lien de réinitialisation invalide'
          : 'Invalid reset link'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        language === 'fr'
          ? 'Les mots de passe ne correspondent pas'
          : 'Passwords do not match'
      );
      return;
    }

    if (password.length < 8) {
      setError(
        language === 'fr'
          ? 'Le mot de passe doit contenir au moins 8 caractères'
          : 'Password must be at least 8 characters'
      );
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(resetToken, password);
      setIsSubmitted(true);
      haptics.success();
    } catch (error: any) {
      haptics.error();
      
      let errorMessage = language === 'fr'
        ? 'Erreur lors de la réinitialisation'
        : 'Error resetting password';
      
      switch (error.message) {
        case 'invalid_token':
          errorMessage = language === 'fr'
            ? 'Lien de réinitialisation invalide ou expiré'
            : 'Invalid or expired reset link';
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
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <View style={[styles.container, styles.justifyCenter, styles.px24]}>
        <View style={[styles.card, styles.p32, styles.alignCenter]}>
          <View 
            style={[
              styles.w64,
              styles.h64,
              styles.rounded32,
              styles.alignCenter,
              styles.justifyCenter,
              styles.mb24,
              { backgroundColor: colorScheme === 'light' ? '#dcfce7' : '#166534' }
            ]}
          >
            <CheckCircle size={32} color="#16a34a" />
          </View>
          
          <Text 
            variant="title" 
            style={[styles.mb16, styles.textCenter]}
            color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
          >
            {language === 'fr' ? 'Mot de passe réinitialisé !' : 'Password reset!'}
          </Text>
          
          <Text 
            variant="body" 
            style={[styles.mb32, styles.textCenter]}
            color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
          >
            {language === 'fr'
              ? 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
              : 'Your password has been reset successfully. You can now log in with your new password.'}
          </Text>
          
          <Button
            onPress={() => {
              haptics.light();
              onNavigate('login');
            }}
            fullWidth
            style={{ backgroundColor: '#16a34a' }}
          >
            {language === 'fr' ? 'Se connecter' : 'Log In'}
          </Button>
        </View>
      </View>
    );
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
          styles.gap12,
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
            onNavigate('login');
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
          {language === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, { paddingTop: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.alignCenter, styles.mb32]}>
          <View 
            style={[
              styles.w64,
              styles.h64,
              styles.rounded32,
              styles.alignCenter,
              styles.justifyCenter,
              styles.mb16,
              { backgroundColor: colorScheme === 'light' ? '#dcfce7' : '#166534' }
            ]}
          >
            <Lock size={32} color="#16a34a" />
          </View>
          
          <Text 
            variant="title" 
            style={[styles.mb8, styles.textCenter]}
            color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
          >
            {language === 'fr' ? 'Créez un nouveau mot de passe' : 'Create a new password'}
          </Text>
          
          <Text 
            variant="body" 
            style={styles.textCenter}
            color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
          >
            {language === 'fr'
              ? 'Votre nouveau mot de passe doit être différent des mots de passe précédents.'
              : 'Your new password must be different from previous passwords.'}
          </Text>
        </View>

        <View style={styles.gap24}>
          {/* Password Input */}
          <View style={styles.gap8}>
            <Text 
              variant="body" 
              color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
            >
              {language === 'fr' ? 'Nouveau mot de passe' : 'New password'}
            </Text>
            <View style={styles.relative}>
              <Input
                placeholder={language === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.pr32}
              />
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  setShowPassword(!showPassword);
                }}
                style={[styles.absolute, { right: 12, top: 14 }]}
              >
                {showPassword ? 
                  <EyeOff size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} /> : 
                  <Eye size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                }
              </TouchableOpacity>
            </View>
            <Text 
              size="sm" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
            >
              {language === 'fr'
                ? 'Au moins 8 caractères'
                : 'At least 8 characters'}
            </Text>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.gap8}>
            <Text 
              variant="body" 
              color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
            >
              {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
            </Text>
            <View style={styles.relative}>
              <Input
                placeholder={language === 'fr' ? 'Confirmez votre mot de passe' : 'Confirm your password'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={styles.pr32}
              />
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  setShowConfirmPassword(!showConfirmPassword);
                }}
                style={[styles.absolute, { right: 12, top: 14 }]}
              >
                {showConfirmPassword ? 
                  <EyeOff size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} /> : 
                  <Eye size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View 
              style={[
                styles.p16, 
                styles.rounded12,
                { 
                  backgroundColor: colorScheme === 'light' ? '#fef2f2' : '#450a0a',
                  borderWidth: 1,
                  borderColor: colorScheme === 'light' ? '#fecaca' : '#7f1d1d'
                }
              ]}
            >
              <Text 
                size="sm" 
                color={colorScheme === 'light' ? '#dc2626' : '#fca5a5'}
                style={styles.textCenter}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            disabled={isLoading || !resetToken}
            fullWidth
            style={{ 
              backgroundColor: '#16a34a',
              height: 48
            }}
          >
            {isLoading
              ? (language === 'fr' ? 'Réinitialisation...' : 'Resetting...')
              : (language === 'fr' ? 'Réinitialiser le mot de passe' : 'Reset password')}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}