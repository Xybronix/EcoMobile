// components/ui/Textarea.tsx
import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';

interface TextareaProps extends TextInputProps {
  error?: boolean;
}

export function Textarea({ style, error = false, ...props }: TextareaProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const textareaStyle = {
    ...styles.input,
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top' as const,
    ...(error && { borderColor: '#ef4444', borderWidth: 2 }),
  };

  return (
    <TextInput
      style={[textareaStyle, style]}
      placeholderTextColor={colors.icon}
      multiline
      {...props}
    />
  );
}