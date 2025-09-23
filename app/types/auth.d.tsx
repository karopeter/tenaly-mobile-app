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

export interface AuthUser {
 id: string;
 fullName: string;
 email: string;
 phoneNumber: string | null;
 isVerified: boolean;
 hasSubmittedVerification: boolean;
 role: 'customer' | 'seller' | 'admin';
}

export interface AuthResponse {
    message: string;
    token: string;
    user: AuthUser;
    isNewGoogleUser?: boolean;
    profileComplete?: boolean;
}