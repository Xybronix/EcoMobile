import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { KeyboardAvoidingContainer } from '@/components/ui/KeyboardAvoidingContainer';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { ArrowLeft, Phone, CheckCircle } from 'lucide-react-native';
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
      <KeyboardAvoidingContainer>
        <View style={[styles.flex1, styles.p16]}>
          <View style={[styles.mb8]}>
            <Text style={[styles.text2xl, styles.fontBold, styles.mb2]}>
              {t('auth.phone.enterPhone')}
            </Text>
            <Text style={[styles.text, styles.textGray, styles.mb6]}>
              {t('auth.phone.enterPhoneDescription')}
            </Text>
          </View>

          <View style={[styles.mb6]}>
            <Label>{t('auth.phone.phoneNumber')}</Label>
            <Input
              value={phone}
              onChangeText={setPhone}
              placeholder={t('auth.phone.phonePlaceholder')}
              keyboardType="phone-pad"
              autoComplete="tel"
              leftIcon={<Phone size={20} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />}
            />
          </View>

          <Button
            onPress={handleSendCode}
            disabled={isLoading || !phone}
            style={[styles.mb4]}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={[styles.textWhite, styles.fontSemibold]}>
                {t('auth.phone.sendCode')}
              </Text>
            )}
          </Button>

          <TouchableOpacity
            onPress={() => onNavigate('home')}
            style={[styles.mt4, styles.alignCenter]}
          >
            <Text style={[styles.text, styles.textGray]}>
              {t('common.skipForNow')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingContainer>
    );
  }

  return (
    <KeyboardAvoidingContainer>
      <View style={[styles.flex1, styles.p16]}>
        <View style={[styles.mb8]}>
          <Text style={[styles.text2xl, styles.fontBold, styles.mb2]}>
            {t('auth.phone.enterCode')}
          </Text>
          <Text style={[styles.text, styles.textGray, styles.mb2]}>
            {t('auth.phone.enterCodeDescription', { phone })}
          </Text>
        </View>

        <View style={[styles.mb6]}>
          <Label>{t('auth.phone.verificationCode')}</Label>
          <Input
            ref={codeInputRef}
            value={code}
            onChangeText={setCode}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            style={[styles.textCenter, styles.text2xl, styles.fontBold]}
          />
        </View>

        <Button
          onPress={handleVerifyCode}
          disabled={isLoading || code.length < 4}
          style={[styles.mb4]}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={[styles.textWhite, styles.fontSemibold]}>
              {t('auth.phone.verify')}
            </Text>
          )}
        </Button>

        <View style={[styles.row, styles.alignCenter, styles.justifyCenter, styles.mt4]}>
          <Text style={[styles.text, styles.textGray, styles.mr2]}>
            {t('auth.phone.didntReceive')}
          </Text>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={countdown > 0 || isResending}
          >
            <Text
              style={[
                styles.text,
                countdown > 0 ? styles.textGray : styles.textPrimary,
                styles.fontSemibold,
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
          style={[styles.mt6, styles.alignCenter]}
        >
          <Text style={[styles.text, styles.textGray]}>
            {t('auth.phone.changePhone')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingContainer>
  );
}
