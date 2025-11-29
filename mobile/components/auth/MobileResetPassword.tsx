import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyboardAvoidingContainer } from '@/components/ui/KeyboardAvoidingContainer';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileResetPasswordProps {
  onNavigate: (screen: string) => void;
  resetToken?: string;
}

export function MobileResetPassword({ onNavigate, resetToken }: MobileResetPasswordProps) {
  const { resetPassword } = useMobileAuth();
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resetToken) {
      setError(t('error.invalidResetLink'));
    }
  }, [resetToken, t]);

  const handleSubmit = async () => {
    setError('');
    
    if (!resetToken) {
      setError(t('error.invalidResetLink'));
      return;
    }

    if (password !== confirmPassword) {
      haptics.error();
      toast.error(t('validation.passwordsNoMatch'));
      return;
    }

    if (password.length < 8) {
      haptics.error();
      toast.error(t('validation.passwordMinLength'));
      return;
    }

    haptics.light();
    setIsLoading(true);

    try {
      await resetPassword(resetToken, password);
      haptics.success();
      setIsSubmitted(true);
    } catch (error: any) {
      haptics.error();
      
      let errorMessage = t('error.resetPasswordError');
      
      switch (error.message) {
        case 'invalid_token':
          errorMessage = t('error.invalidToken');
          break;
        case 'network_error':
          errorMessage = t('error.networkError');
          break;
        case 'server_error':
          errorMessage = t('error.serverError');
          break;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <KeyboardAvoidingContainer
        style={{ backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#0f172a' }}
      >
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
              {t('auth.passwordReset')}
            </Text>
            
            <Text 
              variant="body" 
              style={[styles.mb32, styles.textCenter]}
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
            >
              {t('auth.passwordResetSuccess')}
            </Text>
            
            <Button
              variant="primary"
              fullWidth
              onPress={() => {
                haptics.light();
                onNavigate('login');
              }}
            >
              {t('auth.login')}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingContainer>
    );
  }

  return (
    <KeyboardAvoidingContainer
      style={{ backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#0f172a' }}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => {
          haptics.light();
          onNavigate('login');
        }}
        style={[styles.absolute, { top: 16, left: 16, zIndex: 10 }, styles.p8, styles.rounded8]}
      >
        <ArrowLeft size={24} color="#374151" />
      </TouchableOpacity>

      <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter, styles.formContainer, { maxWidth: 400, marginHorizontal: 'auto', width: '100%' }]}>
        {/* Logo & Title */}
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
            {t('auth.newPassword')}
          </Text>
          
          <Text 
            variant="body" 
            style={styles.textCenter}
            color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
          >
            {t('auth.newPasswordDescription')}
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.wT100, styles.gap16]}>
          <View style={styles.inputGroup}>
            <Label>{t('auth.newPassword')}</Label>
            <View style={styles.relative}>
              <Input
                placeholder={t('auth.enterPassword')}
                value={password}
                onChangeText={setPassword}
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
                  <EyeOff size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} /> : 
                  <Eye size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                }
              </TouchableOpacity>
            </View>
            <Text 
              size="xs" 
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
              style={{ marginTop: 2 }}
            >
              {t('auth.atLeast8Chars')}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Label>{t('auth.confirmPassword')}</Label>
            <View style={styles.relative}>
              <Input
                placeholder={t('auth.confirmYourPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={{ paddingRight: 48 }}
                error={confirmPassword.length > 0 && password !== confirmPassword}
              />
              <TouchableOpacity
                onPress={() => {
                  haptics.selection();
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

          <Button
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={isLoading || !resetToken}
            onPress={handleSubmit}
          >
            {isLoading ? t('auth.resetting') : t('auth.resetPasswordAction')}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingContainer>
  );
}