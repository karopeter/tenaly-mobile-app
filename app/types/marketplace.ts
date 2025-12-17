export interface CombinedAd {
  adId: string;
  carAd: CarAd;
  vehicleAd: VehicleAd | null;
  propertyAd: PropertyAd | null;
  petAd: PetAd | null;
  agricultureAd: AgricultureAd | null;
  kidsAd: KidsAd | null;
  serviceAd: ServiceAd | null;
  equipmentAd: EquipmentAd | null;
  gadgetAd: GadgetAd | null;
  laptopAd: LaptopAd | null;
  fashionAd: FashionAd | null;
  householdAd: HouseholdAd | null;
  beautyAd: BeautyAd | null;
  constructionAd: ConstructionAd | null;
  jobAd: JobAd | null;
  hireAd: HireAd | null;
  business: Business & {
    profileImage: string | null;
    isVerified: boolean;
  };
  createdAt: Date;
}

export interface CarAd {
  _id: string;
  userId: string;
  businessCategory: Business;
  category: string;
  location: string;
  vehicleImage: string[];
  propertyImage: string[];
  petsImage: string[];
  agricultureImage: string[];
  kidsImage: string[];
  equipmentImage: string[];
  gadgetImage: string[];
  fashionImage: string[];
  laptopImage: string[];
  householdImage: string[];
  beautyImage: string[];
  constructionImage: string[];
  jobImage: string[];
  serviceImage: string[];
  hireImage: string[];
  createdAt: string;
  updatedAt: string;
  adId: string;
}

export interface VehicleAd {
  _id: string;
  userId: string;
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
  description: string;
  status: string;
  negotiation: string;
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  priorityScore: number;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  uniqueViewCount: number;
  lastViewedAt?: string;
}

export interface PropertyAd {
  _id: string;
  userId: string;
  propertyName: string;
  propertyAddress: string;
  propertyType: string;
  propertyCondition: string;
  amount: number;
  furnishing: string;
  description: string;
  parking: string;
  serviceCharge: string;
  squareMeter: string;
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  propertyFacilities: string[];
  ownershipStatus: string;
  numberOfBedrooms: string;
  numberOfBathrooms: string;
  numberOfToilet: string;
  titleDocuments: string;
  maximumAllowedGuest: string;
  isSmokingAllowed: string;
  isPartiesAllowed: string;
  petsAllowed: string;
  developmentFee: string;
  surveyFee: string;
  legalFee: string;
  pricingUnits: string;
  serviceFee: string;
  guestNumber: string;
  negotiation: string;
  propertyDuration?: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  status: string;
  priorityScore: number;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  uniqueViewCount: number;
  lastViewedAt?: string;
}

export interface PetAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  petType: string;
  breed: string;
  age: string;
  gender: string;
  healthStatus: string[];
  amount: number;
  negotiation: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  rejectionReason: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface AgricultureAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  title: string;
  agricultureType: string[];
  brand: string;
  condition: string;
  unit: string;
  bulkPrice: Array<{
    quantity: number;
    unit: string;
    amountPerUnit: number;
    _id: string;
  }>;
  feedType: string[];
  formulationType: string[];
  serviceMode: string[];
  negotiation: string;
  amount: number;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  rejectionReason: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface KidsAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  title: string;
  gender: string;
  ageGroup: string;
  color: string;
  condition: string;
  plasticGroup: string;
  woodOptions: string;
  amount: number;
  negotiation: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string; 
}

export interface ServiceAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  serviceTitle: string;
  serviceDuration: string;
  serviceExperience: string;
  serviceAvailability: string;
  serviceLocation: string;
  yearOfExperience: string;
  pricingType: string;
  amount: number;
  negotiation: string;
  serviceDiscount: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface EquipmentAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string; 
   equipmentTitle: string;
   equipmentType: string;
   condition: string;
   powerSource: string;
   brand: string;
   usageType: string;
   yearOfManufacture: string;
   fuelType: string;
   amount: number;
   negotiation: string;
   description: string;
   plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
   paymentStatus: 'success' | 'pending' | 'failed' | 'free';
   reference: string;
   priorityScore: number;
   isDraft: boolean;
   status: string;
   viewCount: number;
   uniqueViewCount: number;
   createdAt: string;
   updatedAt: string;
   lastViewedAt?: string;
}


export interface GadgetAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  gadgetTitle: string;
  condition: string;
  gadgetBrand: string;
  storageCapacity: string;
  ram: string;
  operatingSystem: string;
  simType: string;
  network: string;
  batteryHealth: string;
  gadgetColor: string;
  accessories: string;
  warranty: string;
  connectivityType: string;
  amount: string;
  negotiation: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface LaptopAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  laptopTitle: string;
  condition: string;
  laptopType: string;
  laptopBrand: string;
  laptopStorage: string;
  laptopOperating: string;
  laptopRam: string;
  laptopProcessor: string;
  laptopScreenSize: string;
  laptopBatteryHealth: string;
  laptopColor: string;
   laptopAccessories: string;
   laptopWarranty: string;
   laptopConnectivityType: string[];
   screenSize: string;
   resolution: string;
   refreshRate: string;
   speedRating: string;
    capacity: string;
    amount: number;
    negotiation: string;
    description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface FashionAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  fashionTitle: string;
  fashionType: string;
  condition: string;
  fashionBrand: string;
  gender: string;
  size: string;
  fashionMaterial: string;
  fashionColor: string;
  frameMaterial: string;
  lensType: string;
  frameShape: string;
  fashionAccessories: string;
  amount: number;
  negotiation: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}


export interface HouseholdAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  householdTitle: string;
  householdType: string;
  condition: string;
  householdBrand: string;
  size: string;
  householdPowersource: string;
  householdMaterial: string;
  roomType: string;
  householdStyle: string;
  householdColor: string;
  powerType: string;
  colorTemperature: string;
  amount: number;
  negotiation: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string; 
}

export interface BeautyAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  beautyTitle: string; 
  beautyType: string;
  condition: string;
  hairType: string;
  gender: string;
  beautyBrand: string;
  skinType:  string;
  targetConcern: string;
  skinTone: string;
  fragranceFamily: string;
  beautyPowerSource: string;
  amount: number;
  negotiation: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}


export interface ConstructionAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  constructionTitle: string;
  constructionType: string;
  constructionMaterial: string;
  constructionUnit: string;
  constructionBrand: string;
  condition: string;
  amount: number;
  warranty: string;
  powerRating: string;
  yearOfManufacture: string;
  fuelType: string;
  finish: string;
  constructionColor: string;
  size: string;
  experienceLevel: string;
  constructionAvailability: string;
  bulkPrice: Array<{
    quantity: number;
    unit: string;
    amountPerUnit: number;
    _id: string;
  }>;
  negotiation: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface JobAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  jobTitle: string;
  companyEmployerName: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  yearOfExperience: string;
  genderPreference: string;
  applicationDeadline: string;
  skils: string;
  jobLocationType: string;
  responsibilities: string;
  requirements: string;
  pricingType: string;
  salaryRange: number;
  negotiation: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  refernce: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface HireAd {
  _id: string;
  userId: string;
  carAdId: string | null;
  businessCategory: string;
  hireTitle: string;
  hireGender: string;
  jobType: string;
  experienceLevel: string;
  workMode: string;
  yearsOfExperience: string;
  relationshipStatus: string;
  portfolioLink: string;
  otherLinks: string;
  skills: string;
  resume: string;
  pricingType: string;
  salaryRange: number;
  negotiation: string;
  description: string;
  plan: 'enterprise' | 'diamond' | 'vip' | 'premium' | 'basic' | 'free';
  paymentStatus: 'success' | 'pending' | 'failed' | 'free';
  reference: string;
  priorityScore: number;
  isDraft: boolean;
  status: string;
  viewCount: number;
  uniqueViewCount: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface Business {
  _id: string;
  userId: string;
  businessName: string;
  aboutBusiness: string;
  location: string;
  addresses: Address[];
  businessHours: BusinessHour[];
  createdAt: string;
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
  _id: string;
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