// hooks/useCustomFonts.ts
import { useFonts } from 'expo-font';

export function useCustomFonts() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf')
  });

  return { fontsLoaded, fontError };
}