// components/mobile/MobileWelcome.tsx
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { ArrowRight, Bike, MapPin, Shield, Zap } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '../lib/mobile-i18n';

interface MobileWelcomeProps {
  onNavigate: (screen: string) => void;
}

export default function MobileWelcome({ onNavigate }: MobileWelcomeProps) {
  const { language, setLanguage } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  const handleLanguageChange = (newLanguage: 'fr' | 'en') => {
    setLanguage(newLanguage);
    toast.success(
      newLanguage === 'fr' 
        ? 'Langue changée en français' 
        : 'Language changed to English'
    );
  };

  const features = [
    {
      icon: Zap,
      title: language === 'fr' ? 'Rapide' : 'Fast',
      description: language === 'fr' ? 'Trouvez un vélo en quelques secondes' : 'Find a bike in seconds',
    },
    {
      icon: Shield,
      title: language === 'fr' ? 'Sécurisé' : 'Secure',
      description: language === 'fr' ? 'Paiements sécurisés' : 'Secure payments',
    },
    {
      icon: MapPin,
      title: language === 'fr' ? 'Partout' : 'Everywhere',
      description: language === 'fr' ? 'Des vélos dans toute la ville' : 'Bikes all over the city',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#16a34a' }]}>
      {/* Language Switcher */}
      <View style={[styles.absolute, { top: 56, right: 16, zIndex: 10 }, styles.row, styles.gap8]}>
        <TouchableOpacity
          onPress={() => handleLanguageChange('fr')}
          style={[
            styles.button,
            styles.rounded20,
            { paddingHorizontal: 12, paddingVertical: 4, height: 'auto' },
            language === 'fr' 
              ? { backgroundColor: '#16a34a' }
              : { backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db' }
          ]}
        >
          <Text
            size="sm"
            weight="semibold"
            color={language === 'fr' ? 'white' : '#6b7280'}
          >
            FR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleLanguageChange('en')}
          style={[
            styles.button,
            styles.rounded20,
            { paddingHorizontal: 12, paddingVertical: 4, height: 'auto' },
            language === 'en'
              ? { backgroundColor: '#16a34a' }
              : { backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db' }
          ]}
        >
          <Text
            size="sm"
            weight="semibold"
            color={language === 'en' ? 'white' : '#6b7280'}
          >
            EN
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter, styles.p24, styles.pt80]}>
          <View style={[styles.w100, styles.h96, { backgroundColor: 'white', borderRadius: 48 }, styles.alignCenter, styles.justifyCenter, styles.mb24, styles.shadowLg]}>
            <Bike color="#16a34a" size={48} />
          </View>
          
          <Text size="4xl" weight="bold" color="white" style={styles.mb16}>
            Eco-Mobile 
          </Text>
          
          <Text size="lg" color="white" align="center" style={[styles.mb32, { opacity: 0.9, maxWidth: 300 }]}>
            {language === 'fr'
              ? 'Louez un vélo électrique en un clin d\'œil'
              : 'Rent an electric bike in a flash'}
          </Text>

          {/* Features */}
          <View style={[styles.row, styles.gap16, styles.mb32, styles.wT100, { maxWidth: 400 }]}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <View key={feature.title} style={[styles.flex1, styles.alignCenter]}>
                  <View style={[styles.wT64, styles.h64, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }, styles.rounded16, styles.alignCenter, styles.justifyCenter, styles.mb8]}>
                    <Icon color="white" size={32} />
                  </View>
                  <Text size="sm" weight="semibold" color="white" align="center" style={styles.mb4}>
                    {feature.title}
                  </Text>
                  <Text size="xs" color="white" align="center" style={{ opacity: 0.7 }}>
                    {feature.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.p24, styles.pb32, styles.gap12]}>
          <TouchableOpacity
            onPress={() => onNavigate('register')}
            style={[styles.button, styles.h56, { backgroundColor: 'white' }, styles.rounded12, styles.row, styles.shadowLg]}
            activeOpacity={0.8}
          >
            <Text size="lg" weight="semibold" color="#16a34a" style={styles.mr8}>
              {language === 'fr' ? 'S\'inscrire' : 'Sign Up'}
            </Text>
            <ArrowRight color="#16a34a" size={20} />
          </TouchableOpacity>
          
          <Button
            variant="outline"
            size="lg"
            onPress={() => onNavigate('login')}
            style={{ borderColor: 'white', borderWidth: 2 }}
          >
            <Text color="white">
              {language === 'fr' ? 'Se connecter' : 'Log In'}
            </Text>
          </Button>
          
          <Text size="sm" color="white" align="center" style={[styles.pt16, { opacity: 0.7 }]}>
            {language === 'fr'
              ? 'En continuant, vous acceptez nos conditions d\'utilisation'
              : 'By continuing, you accept our terms of service'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}