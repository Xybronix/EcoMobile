import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '../../lib/mobile-i18n';

interface MobileForgotPasswordProps {
  onNavigate: (screen: string) => void;
}

export function MobileForgotPassword({ onNavigate }: MobileForgotPasswordProps) {
  const { language } = useMobileI18n();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <CheckCircle size={32} color="#16a34a" />
          </View>
          
          <Text style={styles.successTitle}>
            {language === 'fr' ? 'Email envoyé !' : 'Email sent!'}
          </Text>
          
          <Text style={styles.successDescription}>
            {language === 'fr'
              ? 'Nous avons envoyé un lien de réinitialisation à votre adresse email.'
              : 'We have sent a reset link to your email address.'}
          </Text>
          
          <Text style={styles.successHint}>
            {language === 'fr'
              ? 'Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.'
              : 'Check your inbox and click the link to reset your password.'}
          </Text>
          
          <Button
            onPress={() => onNavigate('login')}
            style={styles.backButton}
          >
            {language === 'fr' ? 'Retour à la connexion' : 'Back to login'}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => onNavigate('login')}
            style={styles.backButtonHeader}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'fr' ? 'Mot de passe oublié' : 'Forgot Password'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.illustration}>
            <View style={styles.mailIcon}>
              <Mail size={32} color="#16a34a" />
            </View>
            
            <Text style={styles.title}>
              {language === 'fr' ? 'Réinitialisez votre mot de passe' : 'Reset your password'}
            </Text>
            
            <Text style={styles.description}>
              {language === 'fr'
                ? 'Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.'
                : 'Enter your email and we will send you a link to reset your password.'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Label>
                {language === 'fr' ? 'Adresse email' : 'Email address'}
              </Label>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Button
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            >
              {isLoading
                ? (language === 'fr' ? 'Envoi en cours...' : 'Sending...')
                : (language === 'fr' ? 'Envoyer le lien' : 'Send link')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  backButtonHeader: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    maxWidth: 400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  illustration: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mailIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dcfce7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  submitButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#16a34a',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  successIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dcfce7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  successHint: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#16a34a',
  },
});