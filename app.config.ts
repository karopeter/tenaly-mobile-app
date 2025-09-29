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
      projectId: "3044a739-d08b-4ff0-a79e-2563f43c6829"
    }
   }
});