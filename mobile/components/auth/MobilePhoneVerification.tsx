import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { KeyboardAvoidingContainer } from '@/components/ui/KeyboardAvoidingContainer';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { MobileHeader } from '@/components/layout/MobileHeader';
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { authService } from '@/services/authService';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobilePhoneVerificationProps {
  onNavigate: (screen: string) => void;
}

export default function MobilePhoneVerification({ onNavigate }: MobilePhoneVerificationProps) {
  const { user, refreshUser } = useMobileAuth();
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [phone, setPhone] = useState(user?.phone || '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const codeInputRef = useRef<any>(null);

  useEffect(() => {
    if (user?.phoneVerified) {
      onNavigate('home');
    } else if (user?.phone) {
      setPhone(user.phone);
      setStep('code');
      startCountdown();
    }
  }, [user]);

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!phone || phone.length < 8) {
      haptics.error();
      toast.error(t('validation.invalidPhone'));
      return;
    }

    haptics.light();
    setIsLoading(true);

    try {
      const result = await authService.initiatePhoneVerification(phone);
      haptics.success();
      toast.success(t('auth.phone.codeSent'));
      setStep('code');
      startCountdown();
      
      // In development, show the code
      if (__DEV__ && result.code) {
        Alert.alert(
          t('auth.phone.verificationCode'),
          `${t('auth.phone.devCode')}: ${result.code}`,
          [{ text: t('common.ok') }]
        );
      }
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 4) {
      haptics.error();
      toast.error(t('validation.invalidCode'));
      return;
    }

    haptics.light();
    setIsLoading(true);

    try {
      await authService.verifyPhoneCode(code);
      haptics.success();
      toast.success(t('auth.phone.verified'));
      await refreshUser();
      onNavigate('documents');
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('auth.phone.invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    haptics.light();
    setIsResending(true);

    try {
      await authService.resendPhoneVerification();
      haptics.success();
      toast.success(t('auth.phone.codeSent'));
      startCountdown();
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || t('common.error'));
    } finally {
      setIsResending(false);
    }
  };

  if (step === 'phone') {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }]}>
        <MobileHeader 
          title={t('auth.phone.verification')}
          showBackButton
          onBack={() => onNavigate('home')}
        />
        
        <KeyboardAvoidingContainer>
          <View style={[styles.scrollContentPadded, { paddingTop: 24 }]}>
            <View style={[styles.mb24]}>
              <Text style={[styles.text2xl, styles.textBold, styles.mb8, { color: colorScheme === 'light' ? '#111827' : '#f9fafb' }]}>
                {t('auth.phone.enterPhone')}
              </Text>
              <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
                {t('auth.phone.enterPhoneDescription')}
              </Text>
            </View>

            <View style={[styles.mb24]}>
              <Label>{t('auth.phone.phoneNumber')}</Label>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder={t('auth.phone.phonePlaceholder')}
                placeholderTextColor={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <Button
              onPress={handleSendCode}
              disabled={isLoading || !phone}
              style={[styles.mb16]}
              fullWidth
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '500' }}>
                  {t('auth.phone.sendCode')}
                </Text>
              )}
            </Button>

            <TouchableOpacity
              onPress={() => onNavigate('home')}
              style={[styles.mt8, styles.alignCenter]}
            >
              <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
                {t('common.skipForNow')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingContainer>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }]}>
      <MobileHeader 
        title={t('auth.phone.verification')}
        showBackButton
        onBack={() => onNavigate('home')}
      />
      
      <KeyboardAvoidingContainer>
        <View style={[styles.scrollContentPadded, { paddingTop: 24 }]}>
          <View style={[styles.mb24]}>
            <Text style={[styles.text2xl, styles.textBold, styles.mb8, { color: colorScheme === 'light' ? '#111827' : '#f9fafb' }]}>
              {t('auth.phone.enterCode')}
            </Text>
            <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
              {t('auth.phone.enterCodeDescription', { phone })}
            </Text>
          </View>

          <View style={[styles.mb24]}>
            <Label>{t('auth.phone.verificationCode')}</Label>
            <Input
              ref={codeInputRef}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              placeholderTextColor={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.textCenter, styles.text2xl, styles.textBold]}
            />
          </View>

          <Button
            onPress={handleVerifyCode}
            disabled={isLoading || code.length < 4}
            style={[styles.mb16]}
            fullWidth
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '500' }}>
                {t('auth.phone.verify')}
              </Text>
            )}
          </Button>

          <View style={[styles.row, styles.alignCenter, styles.justifyCenter, styles.mt16]}>
            <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }, styles.mr8]}>
              {t('auth.phone.didntReceive')}
            </Text>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={countdown > 0 || isResending}
            >
              <Text
                style={[
                  styles.text,
                  styles.textSemiBold,
                  { 
                    color: countdown > 0 
                      ? (colorScheme === 'light' ? '#9ca3af' : '#6b7280')
                      : '#5D5CDE'
                  }
                ]}
              >
                {countdown > 0
                  ? `${t('auth.phone.resendIn')} ${countdown}s`
                  : t('auth.phone.resend')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setStep('phone')}
            style={[styles.mt24, styles.alignCenter]}
          >
            <Text style={[styles.text, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
              {t('auth.phone.changePhone')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingContainer>
    </View>
  );
}
