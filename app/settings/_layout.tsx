import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="terms" />
    </Stack>
  );
} 