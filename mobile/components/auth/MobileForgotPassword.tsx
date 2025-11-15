import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyboardAvoidingContainer } from '@/components/ui/KeyboardAvoidingContainer';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileForgotPasswordProps {
  onNavigate: (screen: string) => void;
}

export function MobileForgotPassword({ onNavigate }: MobileForgotPasswordProps) {
  const { forgotPassword } = useMobileAuth();
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    
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
    if (!email) {
      haptics.error();
      toast.error(
        language === 'fr'
          ? 'Veuillez saisir votre adresse email'
          : 'Please enter your email address'
      );
      return;
    }

    if (!validateEmail(email)) {
      haptics.error();
      toast.error(
        language === 'fr'
          ? 'Adresse email invalide'
          : 'Invalid email address'
      );
      return;
    }

    haptics.light();
    setIsLoading(true);

    try {
      await forgotPassword(email);
      haptics.success();
      setIsSubmitted(true);
    } catch (error: any) {
      haptics.error();
      
      let errorMessage = t('common.error');
      switch (error.message) {
        case 'user_not_found':
          errorMessage = language === 'fr' 
            ? 'Aucun compte trouvé avec cette adresse email' 
            : 'No account found with this email address';
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
        default:
          errorMessage = language === 'fr' 
            ? 'Une erreur est survenue' 
            : 'An error occurred';
          break;
      }
      
      toast.error(errorMessage);
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
              {language === 'fr' ? 'Email envoyé !' : 'Email sent!'}
            </Text>
            
            <Text 
              variant="body" 
              style={[styles.mb16, styles.textCenter]}
              color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
            >
              {language === 'fr'
                ? 'Nous avons envoyé un lien de réinitialisation à votre adresse email.'
                : 'We have sent a reset link to your email address.'}
            </Text>
            
            <Text 
              size="sm" 
              style={[styles.mb32, styles.textCenter]}
              color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
            >
              {language === 'fr'
                ? 'Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.'
                : 'Check your inbox and click the link to reset your password.'}
            </Text>
            
            <Button
              variant="primary"
              fullWidth
              onPress={() => {
                haptics.light();
                onNavigate('login');
              }}
            >
              {language === 'fr' ? 'Retour à la connexion' : 'Back to login'}
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
            <Mail size={32} color="#16a34a" />
          </View>
          
          <Text 
            variant="title" 
            style={[styles.mb8, styles.textCenter]}
            color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
          >
            {language === 'fr' ? 'Mot de passe oublié' : 'Forgot Password'}
          </Text>
          
          <Text 
            variant="body" 
            style={styles.textCenter}
            color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
          >
            {language === 'fr'
              ? 'Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.'
              : 'Enter your email and we will send you a link to reset your password.'}
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.wT100, styles.gap16]}>
          <View style={styles.inputGroup}>
            <Label>{t('auth.email')}</Label>
            <Input
              value={email}
              onChangeText={handleEmailChange}
              placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
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

          <Button
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            onPress={handleSubmit}
          >
            {isLoading
              ? (language === 'fr' ? 'Envoi en cours...' : 'Sending...')
              : (language === 'fr' ? 'Envoyer le lien' : 'Send link')}
          </Button>
        </View>

        {/* Back to Login Link */}
        <View style={[styles.mt24, styles.alignCenter]}>
          <TouchableOpacity 
            onPress={() => {
              haptics.light();
              onNavigate('login');
            }}
          >
            <Text variant="body" color="primary" weight="medium">
              {language === 'fr' ? 'Retour à la connexion' : 'Back to login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingContainer>
  );
}