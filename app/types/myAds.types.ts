

export interface MyAdsProps {
    loading?: boolean;
}

export interface CarAd {
    _id: string;
    userId: string;
    businessCategory: {
     _id: string;
     businessName: string;
    };
    category: string;
    location: string;
    vehicleImage: string[];
    propertyImage: string[];
    adId: string;
    createdAt: string;
    updatedAt: string;
}

export interface VehicleAd {
    _id: string;
    userId: string;
    carAdId: string | null;
    vehicleType: string;
    model: string;
    year: number;
    trim: string;
    color: string;
    interiorColor: string;
    transmission: string;
    vinChassisNumber: string;
    carRegistered: string;
    exchangePossible: string;
    carKeyFeatures: string[];
    carType: string;
    carBody: string;
    fuel: string;
    seat: string;
    driveTrain: string;
    numberOfCylinders: string;
    engineSizes: string;
    horsePower: string;
    amount: number;
    negotiation: string;
    businessCategory: string;
    description: string;
    plan: 'free' | 'basic' | 'premium' | 'vip' | 'diamond' | 'enterprise';
    paymentStatus: 'free' | 'pending' | 'success' | 'failed',
    reference: string;
    priorityScore: number;
    isDraft: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'sold';
    rejectionReason: string | null;
    rejectedAt: string | null;
    rejectedBy: string | null;
    viewCount: number;
    uniqueViewCount: number;
    lastViewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PropertyAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  propertyName: string;
  propertyAddress: string;
  propertyType: string;
  propertyCondition?: string;
  propertyFacilities: string[];
  furnishing?: string;
  parking?: string;
  squareMeter?: string;
  ownershipStatus: string;
  serviceCharge: string;
  numberOfBedrooms?: string;
  numberOfBathrooms?: string;
  numberOfToilet?: string;
  titleDocuments?: string;
  maximumAllowedGuest?: string;
  isSmokingAllowed?: string;
  isPartiesAllowed?: string;
  petsAllowed?: string;
  developmentFee?: string;
  surveyFee?: string;
  legalFee?: string;
  pricingUnits?: string;
  serviceFee?: number;
  propertyDuration?: string;
  amount: number;
  guestNumber?: number;
  negotiation: string;
  description: string;
  plan: 'free' | 'basic' | 'premium' | 'vip' | 'diamond' | 'enterprise';
  paymentStatus: 'free' | 'pending' | 'success' | 'failed';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  rejectionReason: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  viewCount: number;
  uniqueViewCount: number;
  lastViewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CombinedAd {
  adId: string;
  carAd: CarAd;
  vehicleAd?: VehicleAd;
  propertyAd?: PropertyAd;
  isSold: boolean;
}

export interface AdsResponse {
   success: boolean;
  data: CombinedAd[];
  totalPages: number;
  currentPage: number;
  totalItems: number; 
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'buyer' | 'seller';
  isVerified: boolean;
  hasSubmittedVerification: boolean;  
}

export interface SwitchRoleResponse {
  message: string;
  profile: {
    userId: string;
    role: 'buyer' | 'seller';
  };
  role: 'buyer' | 'seller';
}