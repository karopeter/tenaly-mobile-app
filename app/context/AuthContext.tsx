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
    isVerified: boolean;
    hasSubmittedVerification: boolean;
    signIn: (data: AuthResponse) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUserProfile: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasSubmittedVerification, setHasSubmittedVerification] = useState(false);

  // Function to fetch and update user profile
  const fetchUserProfile = async (savedToken: string) => {
    if (!apiClient) {
      showErrorToast("API Client is not initialize");
      return;
    }
    const response = await apiClient.get('/api/profile');
    const userData = response.data;

    const simplifiedUser = {
      id: userData._id,
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      isVerified: userData.isVerified || false,
      hasSubmittedVerification: userData.hasSubmittedVerification || false,
    };

    setUser(simplifiedUser);
    setToken(savedToken);
    setIsVerified(userData.isVerified || false);
    setHasSubmittedVerification(userData.hasSubmittedVerification || false);
    
   
    if (!userData.hasSubmittedVerification) {
      const submittedVerification = await AsyncStorage.getItem(`verification_submitted_${userData._id}`);
      setHasSubmittedVerification(submittedVerification === 'true');
    }
  };

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
            setIsInitialized(true);
            return;
         }
         await fetchUserProfile(savedToken);

        } catch(error: any) {
          console.error('Session restore failed:', error);
          await AsyncStorage.removeItem('auth_token');
        } finally {
            setIsInitialized(true);
        }
    };

    restoreSession();
  }, []);

  const signIn = async (data: AuthResponse) => {
    await AsyncStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsVerified(data.user.isVerified || false);
    setHasSubmittedVerification(data.user.hasSubmittedVerification || false);
  };

  const signOut = async () => {
     await AsyncStorage.removeItem('auth_token');
     setToken(null);
     setUser(null);
     setIsVerified(false);
     setHasSubmittedVerification(false);
     router.replace('/auth/login');
  };

  const refreshUserProfile = async () => {
    if (!token) return;
    
    try {
      await fetchUserProfile(token);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  const value = {
    user,
    token,
    isLoading: loading,
    isInitialized,
    isVerified,
    hasSubmittedVerification,
    signIn,
    signOut,
    refreshUserProfile,
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