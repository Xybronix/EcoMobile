/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  ViewStyle, 
  TextStyle, 
  Modal, 
  FlatList,
  Platform 
} from 'react-native';
import { 
  parsePhoneNumberFromString, 
  isValidPhoneNumber, 
  CountryCode,
  getCountries,
  getCountryCallingCode 
} from 'libphonenumber-js';
import countryList from 'country-list-js';
import emojiFlags from 'emoji-flags';
import { ChevronDown, Search, X } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import { Fonts } from '@/constants/fonts';
import * as Haptics from 'expo-haptics';

// Type pour un pays
interface Country {
  code: CountryCode;
  name: string;
  nativeName: string;
  dialCode: string;
  emoji: string;
  capital: string;
  currency: string;
}

interface PhoneInputProps {
  value: string;
  onChangeText: (phoneNumber: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  onFullPhoneChange?: (fullPhoneNumber: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  defaultCountry?: CountryCode;
}

// Fonction pour obtenir tous les pays avec country-list-js
const getAllCountries = (): Country[] => {
  try {
    const countryCodes = getCountries() as CountryCode[];
    
    return countryCodes.map(code => {
      const countryListAll = countryList.all as Record<string, any>;
      const countryData = countryListAll[code];
      
      if (!countryData) {
        return {
          code,
          name: code,
          nativeName: '',
          dialCode: `+${getCountryCallingCode(code)}`,
          emoji: getFlagEmojiFromCode(code),
          capital: '',
          currency: '',
        };
      }
      
      const callingCode = getCountryCallingCode(code);
      const flagEmoji = getFlagEmojiFromCode(code);
      
      return {
        code,
        name: countryData.name || code,
        nativeName: countryData.name || '',
        dialCode: `+${callingCode}`,
        emoji: flagEmoji,
        capital: countryData.capital || '',
        currency: countryData.currency || '',
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error loading countries:', error);
    return getFallbackCountries();
  }
};

// Fonction helper pour obtenir l'emoji du drapeau
const getFlagEmojiFromCode = (countryCode: string): string => {
  try {
    const flag = emojiFlags.countryCode(countryCode);
    return flag?.emoji || '🏳️';
  } catch {
    return '🏳️';
  }
};

// Fonction de secours pour les pays
const getFallbackCountries = (): Country[] => {
  return [
    { code: 'CM', name: 'Cameroon', nativeName: 'Cameroun', dialCode: '+237', emoji: '🇨🇲', capital: 'Yaoundé', currency: 'XAF' },
    { code: 'FR', name: 'France', nativeName: 'France', dialCode: '+33', emoji: '🇫🇷', capital: 'Paris', currency: 'EUR' },
    { code: 'US', name: 'United States', nativeName: 'United States', dialCode: '+1', emoji: '🇺🇸', capital: 'Washington, D.C.', currency: 'USD' },
    { code: 'GB', name: 'United Kingdom', nativeName: 'United Kingdom', dialCode: '+44', emoji: '🇬🇧', capital: 'London', currency: 'GBP' },
    { code: 'DE', name: 'Germany', nativeName: 'Deutschland', dialCode: '+49', emoji: '🇩🇪', capital: 'Berlin', currency: 'EUR' },
    { code: 'BE', name: 'Belgium', nativeName: 'België', dialCode: '+32', emoji: '🇧🇪', capital: 'Brussels', currency: 'EUR' },
    { code: 'CI', name: 'Ivory Coast', nativeName: "Côte d'Ivoire", dialCode: '+225', emoji: '🇨🇮', capital: 'Yamoussoukro', currency: 'XOF' },
    { code: 'SN', name: 'Senegal', nativeName: 'Sénégal', dialCode: '+221', emoji: '🇸🇳', capital: 'Dakar', currency: 'XOF' },
    { code: 'CA', name: 'Canada', nativeName: 'Canada', dialCode: '+1', emoji: '🇨🇦', capital: 'Ottawa', currency: 'CAD' },
    { code: 'CN', name: 'China', nativeName: '中国', dialCode: '+86', emoji: '🇨🇳', capital: 'Beijing', currency: 'CNY' },
    { code: 'JP', name: 'Japan', nativeName: '日本', dialCode: '+81', emoji: '🇯🇵', capital: 'Tokyo', currency: 'JPY' },
    { code: 'RU', name: 'Russia', nativeName: 'Россия', dialCode: '+7', emoji: '🇷🇺', capital: 'Moscow', currency: 'RUB' },
    { code: 'BR', name: 'Brazil', nativeName: 'Brasil', dialCode: '+55', emoji: '🇧🇷', capital: 'Brasília', currency: 'BRL' },
    { code: 'IN', name: 'India', nativeName: 'भारत', dialCode: '+91', emoji: '🇮🇳', capital: 'New Delhi', currency: 'INR' },
    { code: 'NG', name: 'Nigeria', nativeName: 'Nigeria', dialCode: '+234', emoji: '🇳🇬', capital: 'Abuja', currency: 'NGN' },
    { code: 'ZA', name: 'South Africa', nativeName: 'South Africa', dialCode: '+27', emoji: '🇿🇦', capital: 'Pretoria', currency: 'ZAR' },
    { code: 'AU', name: 'Australia', nativeName: 'Australia', dialCode: '+61', emoji: '🇦🇺', capital: 'Canberra', currency: 'AUD' },
    { code: 'IT', name: 'Italy', nativeName: 'Italia', dialCode: '+39', emoji: '🇮🇹', capital: 'Rome', currency: 'EUR' },
    { code: 'ES', name: 'Spain', nativeName: 'España', dialCode: '+34', emoji: '🇪🇸', capital: 'Madrid', currency: 'EUR' },
  ];
};

// Fonction pour obtenir le code pays à partir du numéro
const getCountryFromPhoneNumber = (phoneNumber: string): CountryCode | null => {
  if (!phoneNumber || !phoneNumber.startsWith('+')) return null;
  
  try {
    const phoneNumberObj = parsePhoneNumberFromString(phoneNumber);
    return phoneNumberObj?.country || null;
  } catch {
    return null;
  }
};

export function PhoneInput({
  value,
  onChangeText,
  onValidationChange,
  onFullPhoneChange,
  placeholder = "Numéro de téléphone",
  error = false,
  disabled = false,
  style,
  defaultCountry = 'CM',
}: PhoneInputProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme];

  // Obtenir tous les pays
  const allCountries = useMemo(() => getAllCountries(), []);
  
  // Trouver le pays par défaut
  const defaultCountryData = useMemo(() => 
    allCountries.find(c => c.code === defaultCountry) || allCountries[0],
    [allCountries, defaultCountry]
  );

  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountryData);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localValue, setLocalValue] = useState('');
  
  // Utiliser useRef pour éviter les boucles infinies avec les callbacks
  const onValidationChangeRef = useRef(onValidationChange);
  const onFullPhoneChangeRef = useRef(onFullPhoneChange);
  
  // Mettre à jour les refs quand les callbacks changent
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
    onFullPhoneChangeRef.current = onFullPhoneChange;
  }, [onValidationChange, onFullPhoneChange]);

  // Initialiser la valeur locale et détecter le pays
  useEffect(() => {
    if (value) {
      try {
        if (value.startsWith('+')) {
          const countryCode = getCountryFromPhoneNumber(value);
          if (countryCode) {
            const country = allCountries.find(c => c.code === countryCode);
            if (country) {
              setSelectedCountry(country);
              // Extraire le numéro local
              const phoneNumber = parsePhoneNumberFromString(value);
              if (phoneNumber) {
                setLocalValue(phoneNumber.nationalNumber);
              } else {
                // Fallback: retirer le code pays
                setLocalValue(value.replace(country.dialCode, '').trim());
              }
            } else {
              setLocalValue(value);
            }
          } else {
            setLocalValue(value);
          }
        } else {
          setLocalValue(value);
        }
      } catch (error) {
        console.error('Error parsing phone number:', error);
        setLocalValue(value);
      }
    } else {
      setLocalValue('');
    }
  }, [value, allCountries]);

  // Mettre à jour la validation quand le pays ou le numéro change
  useEffect(() => {
    if (localValue) {
      const fullNumber = `${selectedCountry.dialCode}${localValue.replace(/\D/g, '')}`;
      try {
        const isValid = isValidPhoneNumber(fullNumber, selectedCountry.code);
        onValidationChangeRef.current?.(isValid);
        // Mettre à jour aussi le numéro complet
        onFullPhoneChangeRef.current?.(fullNumber);
      } catch {
        onValidationChangeRef.current?.(false);
      }
    } else {
      onValidationChangeRef.current?.(false);
    }
  }, [localValue, selectedCountry]);

  const handlePhoneChange = useCallback((text: string) => {
    const cleanedText = text.replace(/\D/g, '');
    setLocalValue(cleanedText);
    
    // Stocker seulement le numéro local dans onChangeText
    onChangeText(cleanedText);
    
    // Le numéro complet sera mis à jour par le useEffect
  }, [onChangeText]);

  const handleCountrySelect = useCallback((country: Country) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCountry(country);
    setShowCountryPicker(false);
    
    // Le numéro complet sera mis à jour par le useEffect quand selectedCountry change
  }, []);

  // Filtrer les pays selon la recherche
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return allCountries;
    
    const query = searchQuery.toLowerCase();
    return allCountries.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.nativeName.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.capital.toLowerCase().includes(query) ||
      country.currency.toLowerCase().includes(query)
    );
  }, [allCountries, searchQuery]);

  // Formater le numéro de téléphone selon le pays
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    try {
      // Essayer de formater avec libphonenumber-js
      const fullNumber = `${selectedCountry.dialCode}${cleaned}`;
      const phoneNumber = parsePhoneNumberFromString(fullNumber);
      
      if (phoneNumber) {
        // Utiliser le format national
        return phoneNumber.formatNational();
      }
    } catch {
      // Fallback: format simple
    }
    
    // Format par défaut: groupes de 2 chiffres
    let formatted = '';
    const chunkSize = 2;
    for (let i = 0; i < cleaned.length; i += chunkSize) {
      formatted += cleaned.slice(i, i + chunkSize);
      if (i + chunkSize < cleaned.length) {
        formatted += ' ';
      }
    }
    
    return formatted;
  };

  const inputStyle: TextStyle[] = [
    {
      ...styles.input as TextStyle,
      fontFamily: Fonts.regular,
      paddingLeft: Platform.OS === 'web' ? 110 : 100,
      height: 48,
    },
    isFocused && !error && (styles.inputFocused as TextStyle),
    error && { borderColor: '#ef4444', borderWidth: 1 },
    disabled && { opacity: 0.6 },
    style as TextStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <View style={{ position: 'relative', width: '100%' }}>
      {/* Bouton de sélection de pays */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          left: 12,
          top: 12,
          height: 24,
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: 10,
          minWidth: 80,
        }}
        onPress={() => {
          if (!disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCountryPicker(true);
          }
        }}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 20, marginRight: 8 }}>
          {selectedCountry.emoji}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.text,
            fontFamily: Fonts.medium,
            marginRight: 4,
          }}
          numberOfLines={1}
        >
          {selectedCountry.dialCode}
        </Text>
        <ChevronDown size={16} color={colors.icon} />
      </TouchableOpacity>

      {/* Input de téléphone */}
      <TextInput
        style={inputStyle}
        value={formatPhoneNumber(localValue)}
        onChangeText={handlePhoneChange}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        keyboardType="phone-pad"
        autoCapitalize="none"
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={30}
        selectionColor={colors.primary}
      />

      {/* Modal de sélection de pays */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80%',
            width: '100%',
          }}>
            {/* En-tête du modal */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
              <Text style={{
                fontSize: 18,
                fontFamily: Fonts.semiBold,
                color: colors.text,
              }}>
                Sélectionner un pays ({filteredCountries.length})
              </Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                style={{ padding: 4 }}
              >
                <X size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
              <Search size={20} color={colors.icon} />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  color: colors.text,
                  fontFamily: Fonts.regular,
                  paddingVertical: Platform.OS === 'ios' ? 8 : 4,
                }}
                placeholder="Rechercher un pays, code, capitale..."
                placeholderTextColor={colors.icon}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={Platform.OS !== 'ios'}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Liste des pays */}
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border + '20',
                  }}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={{ fontSize: 24, marginRight: 12, width: 32 }}>
                    {item.emoji}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      color: colors.text,
                      fontFamily: Fonts.medium,
                      marginBottom: 2,
                    }}>
                      {item.name}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{
                        fontSize: 13,
                        color: colors.icon,
                        fontFamily: Fonts.regular,
                      }}>
                        {item.dialCode}
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.icon,
                        fontFamily: Fonts.regular,
                      }}>
                        {item.code}
                      </Text>
                    </View>
                  </View>
                  {selectedCountry.code === item.code && (
                    <View style={{ marginLeft: 8 }}>
                      <Text style={{
                        fontSize: 20,
                        color: colors.primary,
                      }}>
                        ✓
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ 
                    color: colors.icon, 
                    fontFamily: Fonts.regular,
                    textAlign: 'center',
                  }}>
                    Aucun pays trouvé pour "{searchQuery}"
                  </Text>
                </View>
              }
              initialNumToRender={20}
              maxToRenderPerBatch={30}
              windowSize={10}
              getItemLayout={(data, index) => ({
                length: 60,
                offset: 60 * index,
                index,
              })}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}