// components/ui/PhoneInput.tsx
import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { ChevronDown } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import { Fonts } from '@/constants/fonts';
import * as Haptics from 'expo-haptics';

interface PhoneInputProps {
  value: string;
  onChangeText: (phoneNumber: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  defaultCountry?: CountryCode;
}

export function PhoneInput({
  value,
  onChangeText,
  onValidationChange,
  placeholder = "Numéro de téléphone",
  error = false,
  disabled = false,
  style,
  defaultCountry = 'CM',
}: PhoneInputProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme];

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);
  const [countryCallingCode, setCountryCallingCode] = useState('237');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Valider le numéro de téléphone
  const validatePhoneNumber = useCallback((phone: string, countryCode: CountryCode, callingCode: string) => {
    if (!phone) return false;
    
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      
      if (!cleanPhone) return false;
      
      const fullNumber = `+${callingCode}${cleanPhone}`;
      
      return isValidPhoneNumber(fullNumber, countryCode as any);
    } catch {
      return false;
    }
  }, []);

  const handleCountrySelect = useCallback((country: Country) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCountry(country.cca2);
    setCountryCallingCode(country.callingCode[0]);
    setShowCountryPicker(false);

    // Recalculer le numéro complet avec le nouveau code pays
    const cleanPhone = value.replace(/\D/g, '');
    const fullNumber = `+${country.callingCode[0]}${cleanPhone}`;
    onChangeText(fullNumber);

    const isValid = validatePhoneNumber(value, country.cca2, country.callingCode[0]);
    onValidationChange?.(isValid);
  }, [value, validatePhoneNumber, onChangeText, onValidationChange]);

  const handlePhoneChange = useCallback((text: string) => {
    const cleanedText = text.replace(/\D/g, '');
    
    // Construire le numéro complet avec le code pays
    const fullNumber = `+${countryCallingCode}${cleanedText}`;
    onChangeText(fullNumber);
    
    const isValid = validatePhoneNumber(cleanedText, selectedCountry, countryCallingCode);
    onValidationChange?.(isValid);
  }, [selectedCountry, countryCallingCode, validatePhoneNumber, onChangeText, onValidationChange]);

  const handleCountryPickerPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCountryPicker(true);
  }, []);

  // Extraire uniquement la partie locale du numéro pour l'affichage
  const getDisplayPhoneNumber = (fullPhone: string) => {
    if (!fullPhone.startsWith('+')) return fullPhone;
    
    // Retirer le code pays pour l'affichage dans l'input
    const withoutPlus = fullPhone.substring(1);
    const callingCodeLength = countryCallingCode.length;
    
    if (withoutPlus.startsWith(countryCallingCode)) {
      return withoutPlus.substring(callingCodeLength);
    }
    
    return fullPhone.substring(1);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
    }
    return phone;
  };

  const inputStyle: TextStyle[] = [
    {
      ...styles.input as TextStyle,
      fontFamily: Fonts.regular,
      paddingLeft: 120,
    },
    isFocused && (styles.inputFocused as TextStyle),
    error && (styles.inputError as TextStyle),
    disabled && { opacity: 0.6 },
    style as TextStyle,
  ].filter(Boolean) as TextStyle[];

  const countryButtonStyle: ViewStyle = {
    position: 'absolute',
    left: 12,
    top: 12,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  };

  return (
    <View style={{ position: 'relative' }}>
      {/* Sélecteur de pays */}
      <TouchableOpacity
        style={countryButtonStyle}
        onPress={handleCountryPickerPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <CountryPicker
          countryCode={selectedCountry}
          withFilter
          withFlag
          withCallingCode
          withEmoji={false}
          onSelect={handleCountrySelect}
          visible={showCountryPicker}
          onClose={() => setShowCountryPicker(false)}
          containerButtonStyle={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 0,
            margin: 0,
          }}
          theme={{
            onBackgroundTextColor: colors.text,
            backgroundColor: colors.background,
          }}
        />
        <Text
          style={{
            fontSize: 14,
            color: colors.text,
            fontFamily: Fonts.medium,
            marginLeft: 4,
            marginRight: 2,
          }}
        >
          +{countryCallingCode}
        </Text>
        <ChevronDown size={16} color={colors.icon} />
      </TouchableOpacity>

      {/* Input de téléphone */}
      <TextInput
        style={inputStyle}
        value={formatPhoneNumber(getDisplayPhoneNumber(value))}
        onChangeText={handlePhoneChange}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        keyboardType="phone-pad"
        autoCapitalize="none"
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={20}
      />
    </View>
  );
}