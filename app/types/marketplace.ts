export interface CombinedAd {
   adId: string;
   carAd: CarAd;
   vehicleAd: VehicleAd | null;
   propertyAd: PropertyAd | null;
   business: Business & {
    profileImage: string | null;
    isVerified: boolean;
   };
}

export interface CarAd {
  _id: string;
  userId: string;
  businessCategory: Business;
  category: string;
  location: string;
  vehicleImage: string[];
  propertyImage: string[];
  createdAt: string;
  upadtedAt: string;
}

export interface VehicleAd {
  _id: string;
  userId: string;
  vehicleType: string;
  model: string;
  year: number;
  color: string;
  amount: number;
  description: string;
  transmission: string;
  carKeyFeatures: string;
  carType: string;
  status: string;
  negotiation: string;
  fuelType: string;
  paymentStatus: 'success' | 'pending' | 'failed' | 'free',
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free',
  priorityScore: number;
  createdAt: string;
}

export interface PropertyAd {
 _id: string;
  userId: string;
  propertyName: string;
  propertyAddress: string;
  propertyType: string;
  amount: number;
  furnishing: string;
  description: string;
  parking: string;
  serviceCharge: string;
  squareMeter: string;
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  propertyFacilities: string;
  ownershipStatus: string;
  negotiation: string;
  propertyDuration: string;
  plan: string;
  status: string;
  priorityScore: number;
  createdAt: string;
}

export interface Business {
  _id: string;
  userId: string;
  businessName: string;
  aboutBusiness: string;
  location: string;
  addresses: Address[];
  // addresses: Array<{
  //   address: string;
  //   deliveryAvailable: boolean;
  //   _id: string;
  // }>;
}

export interface Address {
  address: string;
  deliveryAvailable: boolean;
  _id: string;
  deliverySettings?: {
    explanation: string;
    dayFrom: number;
    daysTo: number;
    chargeDelivery: 'yes' | 'no';
    feeFrom: number;
    feeTo: number;
  };
}

export interface BusinessHour {
  address: string;
  days: string[];
  openingTime: string;
  closingTime: string;
}

export interface SellerProfile {
  _id: string;
  fullName: string;
  phoneNumber: string;
  isGoogleUser: boolean;
  image: string | null;
  role: 'seller' | 'customer' | 'admin';
  isVerified: boolean; 
  joinedDate: string;
}

