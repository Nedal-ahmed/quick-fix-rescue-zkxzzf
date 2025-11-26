
import React from 'react';
import { Platform } from 'react-native';

// Platform-specific imports
// On web, we show a message that subscriptions are mobile-only
// On native (iOS/Android), we show the full Stripe integration
const PremiumScreen = Platform.select({
  web: require('./premium.web').default,
  default: require('./premium.native').default,
});

export default PremiumScreen;
