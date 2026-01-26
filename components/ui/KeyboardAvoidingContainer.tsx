// components/ui/KeyboardAvoidingContainer.tsx
import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ViewStyle,
  ScrollViewProps,
  StyleSheet,
  View,
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
  enableOnAndroid?: boolean;
}

export function KeyboardAvoidingContainer({
  children,
  safeArea = true,
  behavior = Platform.select({
    ios: 'padding',
    android: 'height',
    default: 'height',
  }),
  keyboardVerticalOffset = Platform.select({
    ios: 0,
    android: 0,
    default: 0,
  }),
  style,
  contentContainerStyle,
  enableOnAndroid = true,
  ...scrollProps
}: KeyboardAvoidingContainerProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  const useKeyboardAvoiding = Platform.OS === 'ios' || enableOnAndroid;

  const Container = safeArea ? SafeAreaView : View;
  const containerProps = safeArea 
    ? { style: [styles.containerSafe, style] } 
    : { style: [localStyles.container, style] };

  const renderContent = () => (
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
  );

  return (
    <Container {...containerProps}>
      {useKeyboardAvoiding ? (
        <KeyboardAvoidingView
          style={localStyles.keyboardAvoidingView}
          behavior={behavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
          enabled={useKeyboardAvoiding}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      ) : (
        renderContent()
      )}
    </Container>
  );
}

const localStyles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
  },
});