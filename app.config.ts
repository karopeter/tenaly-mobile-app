import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config } : ConfigContext): ExpoConfig => ({
   ...config,
   name: 'tenaly',
   slug: 'tenaly',
   version: '1.0.0',
   plugins: [
     ...(config.plugins || []),
     'expo-web-browser',
   ],
   extra: {
    ...config.extra,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    eas: {
      // Preparing for eas build(apk)
    }
   }
});