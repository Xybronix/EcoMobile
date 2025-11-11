// components/ui/PhoneInput.tsx
import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, ViewStyle, TextStyle, } from 'react-native';
import CountryPicker, { Country, CountryCode, } from 'react-native-country-picker-modal';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
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
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Obtenir les informations du pays
  const getCountryInfo = useCallback((countryCode: CountryCode) => {
    try {
      const phoneNumber = parsePhoneNumber('+237', { defaultCountry: countryCode as any });
      return {
        callingCode: phoneNumber?.countryCallingCode || '237',
        flag: countryCode,
      };
    } catch {
      return {
        callingCode: '237',
        flag: countryCode,
      };
    }
  }, []);

  const countryInfo = getCountryInfo(selectedCountry);

  // Valider le numéro de téléphone
  const validatePhoneNumber = useCallback((phone: string, country: CountryCode) => {
    if (!phone) return false;
    
    try {
      // Retirer le code du pays s'il est déjà présent
      const cleanPhone = phone.replace(/^\+?[0-9]{1,4}/, '');
      const fullNumber = `+${countryInfo.callingCode}${cleanPhone}`;
      
      return isValidPhoneNumber(fullNumber);
    } catch {
      return false;
    }
  }, [countryInfo.callingCode]);

  const handleCountrySelect = useCallback((country: Country) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCountry(country.cca2);
    setShowCountryPicker(false);
    
    // Revalider le numéro avec le nouveau pays
    const isValid = validatePhoneNumber(value, country.cca2);
    onValidationChange?.(isValid);
  }, [value, validatePhoneNumber, onValidationChange]);

  const handlePhoneChange = useCallback((text: string) => {
    // Nettoyer le texte (garder seulement les chiffres et certains caractères)
    const cleanedText = text.replace(/[^\d\s\-\(\)\+]/g, '');
    onChangeText(cleanedText);
    
    // Valider le numéro
    const isValid = validatePhoneNumber(cleanedText, selectedCountry);
    onValidationChange?.(isValid);
  }, [selectedCountry, validatePhoneNumber, onChangeText, onValidationChange]);

  const handleCountryPickerPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCountryPicker(true);
  }, []);

  // S'assurer que inputStyle est compatible avec TextStyle
  const inputStyle: TextStyle[] = [
    {
      ...styles.input as TextStyle,
      fontFamily: Fonts.regular,
      paddingLeft: 80, // Espace pour le sélecteur de pays
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
          visible={showCountryPicker}
          onSelect={handleCountrySelect}
          onClose={() => setShowCountryPicker(false)}
          withFilter
          withFlag
          withCallingCode
          withEmoji={false}
          containerButtonStyle={{
            flexDirection: 'row',
            alignItems: 'center',
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
          +{countryInfo.callingCode}
        </Text>
        <ChevronDown size={16} color={colors.icon} />
      </TouchableOpacity>

      {/* Input de téléphone */}
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={handlePhoneChange}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        keyboardType="phone-pad"
        autoCapitalize="none"
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={15}
      />
    </View>
  );
}