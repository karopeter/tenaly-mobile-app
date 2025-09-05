import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn('EXPO_PUBLIC_API_URL is not defined in app config. API client will not be initialized.');
}

// Only create apiClient if API_URL is defined
const apiClient = API_URL
  ? axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  : null;

// Add interceptor only if apiClient exists
if (apiClient) {
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      } catch (e) {
        console.error('Error reading auth token in interceptor:', e);
        return config;
      }
    },
    (error) => {
      console.error('Interceptor request error:', error);
      return Promise.reject(error);
    }
  );
}

export default apiClient;