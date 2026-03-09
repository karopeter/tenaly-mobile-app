export type TierStatus = 'pending' | 'approved' | 'rejected';
export type IdType = 'nin' | 'drivers-license' | 'voters-card' | 'passport';
export type TierNumber = 1 | 2 | 3;

export interface Business {
    _id: string;
    businessName: string;
    aboutBusiness: string;
    location: string;
    addresses: Array<{
      address: string;
      deliveryAvailable: boolean;
    }>;
    createdAt: string;
}

export interface TierVerification {
    _id: string;
    userId: string;
    tier: TierNumber;
    status: TierStatus;

    // Tier 1
    email?: string;
    phone?: string;
    idType?: IdType;
    idDocument?: string;

    // Tier 2 
    state?: string;
    lga?: string;
    address?: string;
    town?: string;
    utilityBill?: string;

    // Tier 3 
    businessId?: string;
    businessName?: string;
    cacNumber?: string;
    tinNumber?: string;
    businessLicenseNumber?: string;
    cacDocument?: string;
    otherDocument?: string;

    rejectionReason?: string;
    approvedAt?: string;
    rejectedAt?: string;
    createdAt?: string;
}

export interface TierStatusResponse {
  tier1: TierVerification | null;
  tier2: TierVerification | null;
  tier3: TierVerification | null;
  currentLevel: number;
  tier4Unlocked: boolean;
}

export interface SubmitTier1Data {
   email: string;
   phone: string;
   idType: IdType;
   idDocument: {
     uri: string;
     name: string;
     type: string;
   };
}

export interface SubmitTier2Data {
    state: string;
    lga: string;
    address: string;
    town: string;
    utilityBill: {
      uri: string;
      name: string;
      type: string;
    };
}


export interface SubmitTier3Data {
    businessId: string;
    cacNumber: string;
    tinNumber: string;
    businessLicenseNumber: string;
    cacDocument: {
        uri: string;
        name: string;
        type: string;
    };
    otherDocument?: {
       uri: string;
       name: string;
       type: string;
    };
}
