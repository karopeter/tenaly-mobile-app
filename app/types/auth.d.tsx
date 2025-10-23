export interface SignUpFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
  roleSelection: 'customer' | 'seller'; 
}

export interface LoginFormValues {
  login: string;
  password: string;
  selectedTab: number;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: AuthUser;
    isNewGoogleUser?: boolean;
    profileComplete?: boolean;
}

export interface AuthUser {
 id: string;
 fullName: string;
 email: string;
 phoneNumber?: string;
 role?: string;
 isVerified: boolean;
 hasSubmittedVerification: boolean;
 verificationStatus?: {
   personal: 'verified' | 'pending' | 'rejected' | null;
   business: 'verified' | 'pending' | 'rejected' | null;
 };
}