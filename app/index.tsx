import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React from 'react';

import { ONBOARDING_SEEN_KEY } from '@/data/onboarding';

export default function Index() {
  const [targetRoute, setTargetRoute] = React.useState<'/onboarding' | '/(tabs)' | null>(null);

  React.useEffect(() => {
    const loadInitialRoute = async () => {
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
        setTargetRoute(seen === 'true' ? '/(tabs)' : '/onboarding');
      } catch {
        setTargetRoute('/onboarding');
      }
    };

    void loadInitialRoute();
  }, []);

  if (!targetRoute) return null;

  return <Redirect href={targetRoute} />;
}
