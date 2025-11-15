import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyboardAvoidingContainer } from '@/components/ui/KeyboardAvoidingContainer';
import { Label } from '@/components/ui/Label';
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

interface MobileLoginProps {
  onNavigate: (screen: string) => void;
}

export default function MobileLogin({ onNavigate }: MobileLoginProps) {
  const { login } = useMobileAuth();
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      haptics.error();
      toast.error(
        language === 'fr' 
          ? 'Veuillez remplir tous les champs' 
          : 'Please fill in all fields'
      );
      return;
    }

    haptics.light();
    setIsLoading(true);

    try {
      await login({ email, password });
      haptics.success();
      toast.success(
        language === 'fr' 
          ? 'Connexion réussie !' 
          : 'Login successful!'
      );
    } catch (error: any) {
      haptics.error();
      
      let errorMessage = t('common.error');
      switch (error.message) {
        case 'invalid_credentials':
          errorMessage = language === 'fr' 
            ? 'Email ou mot de passe incorrect' 
            : 'Invalid email or password';
          break;
        case 'network_error':
          errorMessage = language === 'fr' 
            ? 'Erreur de connexion' 
            : 'Network error';
          break;
        case 'validation_error':
          errorMessage = language === 'fr' 
            ? 'Données invalides' 
            : 'Invalid data';
          break;
        case 'user_already_exists':
          errorMessage = language === 'fr' 
            ? 'Utilisateur déjà existant' 
            : 'User already exists';
          break;
        case 'server_error':
          errorMessage = language === 'fr' 
            ? 'Erreur serveur' 
            : 'Server error';
          break;
        case 'service_unavailable':
          errorMessage = language === 'fr' 
            ? 'Service indisponible' 
            : 'Service unavailable';
          break;
        default:
          errorMessage = language === 'fr' 
            ? 'Email ou mot de passe incorrect' 
            : 'Invalid email or password';
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

      <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter, styles.formContainer, { maxWidth: 400, marginHorizontal: 'auto', width: '100%' }]}>
        {/* Logo & Title */}
        <View style={[styles.alignCenter, styles.mb32]}>
          <View style={[styles.w80, styles.h80, { backgroundColor: '#16a34a' }, styles.rounded24, styles.alignCenter, styles.justifyCenter, styles.mb16]}>
            <Bike color="white" size={32} />
          </View>
          <Text variant="title" color="#16a34a" style={styles.mb8}>
            EcoMobile
          </Text>
          <Text variant="subtitle">
            {language === 'fr'
              ? 'Votre mobilité électrique'
              : 'Your electric mobility'}
          </Text>
        </View>

        {/* Login Form */}
        <View style={[styles.wT100, styles.gap16]}>
          <View style={styles.inputGroup}>
            <Label>{t('auth.email')}</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="exemple@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputGroup}>
            <Label>{t('auth.password')}</Label>
            <View style={styles.relative}>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                style={{ paddingRight: 48 }}
                autoComplete="password"
                textContentType="password"
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
          </View>

          <TouchableOpacity
            onPress={() => {
              haptics.light();
              onNavigate('forgot-password');
            }}
            style={{ alignSelf: 'flex-start' }}
          >
            <Text size="sm" color="primary">
              {t('auth.forgotPassword')}
            </Text>
          </TouchableOpacity>

          <Button
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            onPress={handleLogin}
          >
            {isLoading ? t('common.loading') : t('auth.login')}
          </Button>
        </View>

        {/* Register Link */}
        <View style={[styles.mt24, styles.alignCenter]}>
          <View style={styles.row}>
            <Text variant="body" color="muted">
              {t('auth.noAccount')}{' '}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                haptics.light();
                onNavigate('register');
              }}
            >
              <Text variant="body" color="primary" weight="medium">
                {t('auth.register')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingContainer>
  );
}