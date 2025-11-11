// components/ui/KeyboardAvoidingContainer.tsx
import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';

interface KeyboardAvoidingContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  safeArea?: boolean;
  behavior?: 'height' | 'position' | 'padding';
  keyboardVerticalOffset?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export function KeyboardAvoidingContainer({
  children,
  safeArea = true,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 20,
  style,
  contentContainerStyle,
  ...scrollProps
}: KeyboardAvoidingContainerProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  const Container = safeArea ? SafeAreaView : React.Fragment;
  const containerProps = safeArea ? { style: styles.containerSafe } : {};

  return (
    <Container {...containerProps}>
      <KeyboardAvoidingView
        style={[styles.containerKeyboard, style]}
        behavior={behavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContentPadded,
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}