import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as useOutfit,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import { DMMono_400Regular, DMMono_500Medium, useFonts as useDMMono } from '@expo-google-fonts/dm-mono';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import { MainTabs } from './src/navigation/MainTabs';
import { OnboardingFlow } from './src/screens/Onboarding/OnboardingFlow';
import type { OnboardingProfile } from './src/screens/Onboarding/types';
import { ProfileProvider, useProfile } from './src/state/ProfileContext';
import { WorkoutSessionProvider } from './src/state/WorkoutSessionContext';
import { ToastProvider } from './src/components/Toast';
import { AuthLayout, authStyles } from './src/screens/Auth/AuthUI';
import { PrimaryButton } from './src/components/PrimaryButton';
import { initDb } from './src/db/client';
import { registerPwa } from './src/pwa';

SplashScreen.preventAutoHideAsync().catch(() => {});

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.hairline,
    primary: colors.accent,
    text: colors.ink,
  },
};

export default function App() {
  const [outfitLoaded] = useOutfit({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });
  const [monoLoaded] = useDMMono({ DMMono_400Regular, DMMono_500Medium });

  const fontsReady = outfitLoaded && monoLoaded;

  const onLayoutRootView = useCallback(async () => {
    if (fontsReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  useEffect(() => {
    registerPwa();
  }, []);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <View style={{ flex: 1, backgroundColor: colors.bg }} onLayout={onLayoutRootView}>
          <StatusBar style="light" />
          <LocalAppRoot />
        </View>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

function LocalAppRoot() {
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    let active = true;
    initDb()
      .then(() => { if (active) setStorageReady(true); })
      .catch(() => { if (active) setStorageError(true); });
    return () => { active = false; };
  }, []);

  if (storageError) return (
    <AuthLayout title="Unable to open local storage" subtitle="Your data stays on this device. Restart the app and try again.">
      <></>
    </AuthLayout>
  );
  if (!storageReady) return <ActivityIndicator color={colors.accentLight} accessibilityLabel="Loading local data" />;

  return (
    <ProfileProvider userId="local-device-user">
      <WorkoutSessionProvider>
        <AppContent />
      </WorkoutSessionProvider>
    </ProfileProvider>
  );
}

function AppContent() {
  const { profile, createProfileFromOnboarding, hydrated, storageError, retryStorage } = useProfile();

  function handleOnboardingComplete(onboarding: OnboardingProfile) {
    createProfileFromOnboarding(onboarding);
  }

  if (!hydrated) {
    if (storageError) return <AuthLayout title="Unable to load profile" subtitle={storageError}>
      <PrimaryButton label="Retry" onPress={retryStorage} />
    </AuthLayout>;
    return <ActivityIndicator color={colors.accentLight} accessibilityLabel="Loading profile" />;
  }

  if (!profile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {storageError && <Text accessibilityRole="alert" style={authStyles.error}>{storageError}</Text>}
      <MainTabs />
    </NavigationContainer>
  );
}
