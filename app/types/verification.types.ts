export interface DocumentFile {
    uri: string;
    name: string;
    type: string;
    size?: string;
}


export interface Business { 
    _id: string;
    businessName: string;
    aboutBusiness: string;
    location: string;
    addresses: Array<{
     address: string;
     deliveryAvailable: string;
     _id: string;
    }>;
    createdAt: string;
}

export interface Verification {
    _id: string;
    userId: string;
    verificationType: 'personal' | 'business';
    status: 'pending' | 'verified' | 'rejected';
    businessName?: string;
    validIdType?: string;
    rejectionReason?: string;
    createdAt: string;
}


export interface VerificationStatus {
    personal: Verification | null;
    businesses: Verification[];
}

export interface UserProfile {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    isGoogleUser: boolean;
    image: string | null;
    role: string;
    isVerified: boolean;
    hasSubmittedVerification: boolean;
    verificationStatus: {
      personal: 'verified' | 'pending';
      business: 'verified' | 'pending';
    };
    createdAt: string;
}