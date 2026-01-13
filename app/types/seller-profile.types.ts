export interface SellerProfile {
  _id: string;
  fullName: string;
  phoneNumber: string;
  userId: string;
  isGoogleUser: boolean;
  image: string | null;
  role: string;
  isVerified: boolean;
  hasSubmittedVerification: boolean;
  verificationStatus: {
    personal: 'verified' | 'pending' | 'rejected' | null;
    business: 'verified' | 'pending' | 'rejected' | null;
  };
  createdAt: string;
  joinedDate: string;
}