import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { internetService } from '@/lib/internetService';

interface InternetAwareButtonProps extends TouchableOpacityProps {
  onPress?: () => void;
  children: React.ReactNode;
  requireInternet?: boolean;
}

export function InternetAwareButton({
  onPress,
  children,
  requireInternet = true,
  ...props
}: InternetAwareButtonProps) {
  const handlePress = () => {
    if (requireInternet && !internetService.requireConnection()) {
      return;
    }
    onPress?.();
  };

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
}