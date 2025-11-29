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
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';

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
      setEmailError(t('validation.invalidEmail'));
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      haptics.error();
      toast.error(t('validation.fillAllFields'));
      return;
    }

    if (!validateEmail(formData.email)) {
      haptics.error();
      toast.error(t('validation.invalidEmail'));
      return;
    }

    if (!isPhoneValid) {
      haptics.error();
      toast.error(t('validation.invalidPhone'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      haptics.error();
      toast.error(t('validation.passwordsNoMatch'));
      return;
    }

    if (formData.password.length < 8) {
      haptics.error();
      toast.error(t('validation.passwordMinLength'));
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
      toast.success(t('success.accountCreated'));
    } catch (error: any) {
      haptics.error();
      
      let errorMessage = t('common.error');
      switch (error.message) {
        case 'user_already_exists':
          errorMessage = t('error.userAlreadyExists');
          break;
        case 'invalid_data':
          errorMessage = t('error.invalidData');
          break;
        case 'validation_error':
          errorMessage = t('error.validationError');
          break;
        case 'network_error':
          errorMessage = t('error.networkError');
          break;
        case 'server_error':
          errorMessage = t('error.serverError');
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
                  placeholder={t('placeholder.firstName')}
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
                  placeholder={t('placeholder.lastName')}
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
              placeholder={t('placeholder.email')}
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
              placeholder={t('placeholder.phone')}
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
                placeholder={t('placeholder.password')}
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
              {t('auth.atLeast8Chars')}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Label required>
              {t('auth.confirmPassword')}
            </Label>
            <Input
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              placeholder={t('placeholder.password')}
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