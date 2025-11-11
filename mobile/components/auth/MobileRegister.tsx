import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyboardAvoidingContainer } from '@/components/ui/KeyboardAvoidingContainer';
import { Label } from '@/components/ui/Label';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { ArrowLeft, Bike, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '../../lib/mobile-auth';
import { useMobileI18n } from '../../lib/mobile-i18n';

interface MobileRegisterProps {
  onNavigate: (screen: string) => void;
}

export function MobileRegister({ onNavigate }: MobileRegisterProps) {
  const { register } = useMobileAuth();
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setFormData({ ...formData, email: text });
    
    if (text.length > 0 && !validateEmail(text)) {
      setEmailError(
        language === 'fr' 
          ? 'Adresse email invalide' 
          : 'Invalid email address'
      );
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      haptics.error();
      toast.error(
        language === 'fr'
          ? 'Veuillez remplir tous les champs'
          : 'Please fill in all fields'
      );
      return;
    }

    if (!validateEmail(formData.email)) {
      haptics.error();
      toast.error(
        language === 'fr'
          ? 'Adresse email invalide'
          : 'Invalid email address'
      );
      return;
    }

    if (!isPhoneValid) {
      haptics.error();
      toast.error(
        language === 'fr'
          ? 'Numéro de téléphone invalide'
          : 'Invalid phone number'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      haptics.error();
      toast.error(
        language === 'fr'
          ? 'Les mots de passe ne correspondent pas'
          : 'Passwords do not match'
      );
      return;
    }

    if (formData.password.length < 8) {
      haptics.error();
      toast.error(
        language === 'fr'
          ? 'Le mot de passe doit contenir au moins 8 caractères'
          : 'Password must be at least 8 characters'
      );
      return;
    }

    haptics.light();
    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        language,
      });
      haptics.success();
      toast.success(
        language === 'fr'
          ? 'Compte créé avec succès !'
          : 'Account created successfully!'
      );
      // La redirection est gérée automatiquement par le contexte d'authentification
    } catch (error: any) {
      haptics.error();
      
      let errorMessage = t('common.error');
      switch (error.message) {
        case 'user_already_exists':
          errorMessage = language === 'fr' 
            ? 'Un compte existe déjà avec cet email' 
            : 'An account already exists with this email';
          break;
        case 'invalid_data':
          errorMessage = language === 'fr' 
            ? 'Données invalides' 
            : 'Invalid data';
          break;
        case 'validation_error':
          errorMessage = language === 'fr' 
            ? 'Erreur de validation' 
            : 'Validation error';
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
    <KeyboardAvoidingContainer
      style={{ backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#0f172a' }}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => {
          haptics.light();
          onNavigate('welcome');
        }}
        style={[styles.absolute, { top: 16, left: 16, zIndex: 10 }, styles.p8, styles.rounded8]}
      >
        <ArrowLeft size={24} color="#374151" />
      </TouchableOpacity>

      <View style={[styles.formContainer, { maxWidth: 400, marginHorizontal: 'auto', width: '100%' }]}>
        {/* Logo & Title */}
        <View style={[styles.alignCenter, styles.mb24]}>
          <View style={[styles.w64, styles.h64, { backgroundColor: '#16a34a' }, styles.rounded20, styles.alignCenter, styles.justifyCenter, styles.mb12]}>
            <Bike color="white" size={24} />
          </View>
          <Text size="xl" weight="bold" color="primary" style={styles.mb8}>
            EcoMobile
          </Text>
          <Text variant="subtitle">
            {t('auth.register')}
          </Text>
        </View>

        {/* Register Form */}
        <View style={styles.gap16}>
          <View style={[styles.row, styles.gap16]}>
            <View style={styles.flex1}>
              <View style={styles.inputGroup}>
                <Label required>{t('auth.firstName')}</Label>
                <Input
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                  autoComplete="given-name"
                  textContentType="givenName"
                />
              </View>
            </View>

            <View style={styles.flex1}>
              <View style={styles.inputGroup}>
                <Label required>{t('auth.lastName')}</Label>
                <Input
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                  autoComplete="family-name"
                  textContentType="familyName"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Label required>{t('auth.email')}</Label>
            <Input
              value={formData.email}
              onChangeText={handleEmailChange}
              placeholder="exemple@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={!!emailError}
            />
            {emailError ? (
              <Text size="xs" color="#ef4444" style={styles.mt4}>
                {emailError}
              </Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Label required>{t('auth.phone')}</Label>
            <PhoneInput
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              onValidationChange={setIsPhoneValid}
              placeholder="+237 6 90 63 58 27"
              error={formData.phone.length > 0 && !isPhoneValid}
              defaultCountry="CM"
            />
          </View>

          <View style={styles.inputGroup}>
            <Label required>{t('auth.password')}</Label>
            <View style={styles.relative}>
              <Input
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                style={{ paddingRight: 48 }}
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <TouchableOpacity
                onPress={() => {
                  haptics.selection();
                  setShowPassword(!showPassword);
                }}
                style={[styles.absolute, { right: 12, top: 14 }]}
              >
                {showPassword ? 
                  <EyeOff color="#6B7280" size={20} /> : 
                  <Eye color="#6B7280" size={20} />
                }
              </TouchableOpacity>
            </View>
            <Text size="xs" color="#6b7280" style={{marginTop: 2}}>
              {language === 'fr' 
                ? 'Au moins 8 caractères' 
                : 'At least 8 characters'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Label required>
              {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'}
            </Label>
            <Input
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              error={formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword}
            />
          </View>

          <Button
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? t('common.loading') : t('auth.register')}
          </Button>
        </View>

        {/* Login Link */}
        <View style={[styles.mt24, styles.alignCenter]}>
          <View style={styles.row}>
            <Text variant="body" color="muted">
              {t('auth.hasAccount')}{' '}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                haptics.light();
                onNavigate('login');
              }}
            >
              <Text variant="body" color="primary" weight="medium">
                {t('auth.login')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingContainer>
  );
}