import React, { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from "../utils/apiClient";
import { AuthResponse } from "../types/auth.d";
import { showErrorToast } from "../utils/toast";

interface AuthContextType {
    user: AuthResponse['user'] | null;
    token: string | null;
    isLoading: boolean;
    isInitialized: boolean;
    signIn: (data: AuthResponse) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);


  // Restore token  and user from storage on app start 
  useEffect(() => {
    const restoreSession = async () => {
        try {
            if (!apiClient) {
             showErrorToast('API client is not initialized. Please try again later.');
             setLoading(false);
              return;
            }
         const savedToken = await AsyncStorage.getItem('auth_token');
         if (!savedToken) {
            // No token + not logged in 
            setIsInitialized(true);
            return;
         }
         // Try to fetch user profile using the token 
         const response = await apiClient.get('/api/profile');
         const userData = response.data;

         // Extract minimal user data for context 
         const simplifiedUser = {
            id: userData._id,
            fullName: userData.fullName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            role: userData.role,
         };

         setUser(simplifiedUser);
         setToken(savedToken);
        } catch(error: any) {
          // Token  invalid, expired or network error 
          console.error('Session restore failed:', error);
          await AsyncStorage.removeItem('auth_token');
        } finally {
            setIsInitialized(true);
        }
    };

    restoreSession();
  }, []);

  const signIn = async (data: AuthResponse) => {
    //const { token, user } = data;

    await AsyncStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signOut = async () => {
     await AsyncStorage.removeItem('auth_token');
     setToken(null);
     setUser(null);
     router.replace('/auth/login');
  };

  const value = {
    user,
    token,
    isLoading: false,
    isInitialized,
    signIn,
    signOut,
  };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};