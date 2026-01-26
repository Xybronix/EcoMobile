// components/ui/Input.tsx
import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({
  variant = 'default',
  size = 'md',
  error = false,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps, ref) => {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [isFocused, setIsFocused] = useState(false);

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { height: 36, fontSize: 14, paddingHorizontal: 12 };
      case 'md':
        return { height: 48, fontSize: 16, paddingHorizontal: 16 };
      case 'lg':
        return { height: 56, fontSize: 18, paddingHorizontal: 16 };
      default:
        return {};
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.background,
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const inputStyle = {
    ...styles.input,
    ...getSizeStyle(),
    ...getVariantStyle(),
    ...(isFocused && { borderColor: colors.primary }),
    ...(error && { borderColor: '#ef4444' }),
    fontFamily: 'Aptos',
    includeFontPadding: false,
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={containerStyle}>
      <TextInput
        ref={ref}
        style={[inputStyle, style]}
        placeholderTextColor={colors.icon}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </View>
  );
});

Input.displayName = 'Input';