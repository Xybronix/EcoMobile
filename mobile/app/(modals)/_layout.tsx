// app/(modals)/_layout.tsx
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ModalsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#f9fafb',
        },
      }}
    >
      <Stack.Screen name="bike-details" options={{ headerShown: false }} />
      <Stack.Screen name="bike-inspection" options={{ headerShown: false }} />
      <Stack.Screen name="ride-details" options={{ headerShown: false }} />
      <Stack.Screen name="ride-in-progress" options={{ headerShown: false }} />
      <Stack.Screen name="report-issue" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="wallet" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="security" options={{ headerShown: false }} />
      <Stack.Screen name="app-info" options={{ headerShown: false }} />
    </Stack>
  );
}