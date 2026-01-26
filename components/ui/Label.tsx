// components/ui/Label.tsx
import React from 'react';
import { Text } from './Text';
import { TextProps } from 'react-native';

interface LabelProps extends Omit<TextProps, 'children'> {
  children: React.ReactNode;
  required?: boolean;
}

export function Label({ children, required, ...props }: LabelProps) {
  return (
    <Text
      size="base"
      weight="medium"
      color="secondary"
      style={{ marginBottom: 8 }}
      {...props}
    >
      {children}
      {required && <Text color="#ef4444"> *</Text>}
    </Text>
  );
}