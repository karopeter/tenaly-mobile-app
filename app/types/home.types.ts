export interface UserProfile {
   _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isGoogleUser: boolean;
  image: string | null;
  role: string;
  paidPlans: {
    planType: string;
    status: string;
    reference: string;
    _id: string;
  }[];
  walletBalance: number;
  walletTransactions: {
    amount: number;
    reference: string;
    status: string;
    paymentDate: string;
    _id: string;
  }[];
  isVerified: boolean;
  hasSubmittedVerification: boolean;
  createdAt: string;
}