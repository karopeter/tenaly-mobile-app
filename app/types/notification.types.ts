import {
  VehicleAd,
  PropertyAd,
  PetAd,
  AgricultureAd,
  KidsAd,
  ServiceAd,
  EquipmentAd,
  GadgetAd,
  LaptopAd,
  FashionAd,
  HouseholdAd,
  BeautyAd,
  ConstructionAd,
  JobAd,
  HireAd
} from "./marketplace";

export interface Notification {
    _id: string;
    userId: string;
    message: string;
    type: 'ad_created' | 'ad_approved' | 'ad_rejected' | 'ad_expired' | 'general' | 'new_ad_alert';
    adType: 'vehicle' | 'property' | 'pet' | 'agriculture' | 'kids' | 'service' | 'equipment' | 'gadget' | 'laptop' | 'fashion' | 'household' | 'beauty' | 'construction' | 'job' | 'hire';
    isRead: boolean;
    createdAt: string;
    images: string[];
    previewImage: string | null;
    hasImages: boolean;
    relatedCarAdId?: {
        _id: string;
        category: string;
        location: string;
    };
    vehicleAd?: VehicleAd | null;
    propertyAd?: PropertyAd | null;
    petAd?: PetAd | null;
    agricultureAd?: AgricultureAd | null;
    kidAd?: KidsAd | null;
    serviceAd?: ServiceAd | null;
    equipmentAd?: EquipmentAd | null;
    gadgetAd?: GadgetAd | null;
    laptopAd?: LaptopAd | null;
    fashionAd?: FashionAd | null;
    householdAd?: HouseholdAd | null;
    beautyAd?: BeautyAd | null;
    constructionAd?: ConstructionAd | null;
    jobAd?: JobAd | null;
    hireAd?: HireAd | null;
} 

export interface NotificationResponse {
    success: boolean;
    notifications: Notification[];
    total: number;
}