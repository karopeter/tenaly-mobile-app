export interface BookmarkedAd {
  adId: string;
  carAd: {
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
    petsImage: string[];
    agricultureImage: string[];
    gadgetImage: string[];
    fashionImage: string[];
    householdImage: string[];
    laptopImage: string[];
    kidsImage: string[];
    serviceImage: string[];
    equipmentImage: string[];
    beautyImage: string[];
    constructionImage: string[];
    jobImage: string[];
    hireImage: string[];
    adId: string;
    createdAt: string;
    updatedAt: string;
  };
  vehicleAd: {
    _id: string;
    vehicleType: string;
    model: string;
    year: number;
    color: string;
    transmission: string;
    horsePower: string;
    amount: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  propertyAd: {
    _id: string;
    propertyName: string;
    propertyType: string;
    propertyAddress: string;
    amount: number;
    furnishing: string;
    squareMeter: string;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  petAd: {
      _id: string;
    petType: string;
    breed: string;
    age: string;
    gender: string;
    amount: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  agricultureAd: {
    _id: string;
    title: string;
    agricultureType: string[];
    condition: string;
    unit: string;
    amount: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  gadgetAd: {
    _id: string;
    gadgetTitle: string;
    condition: string;
    gadgetBrand: string;
    amount: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  fashionAd: {
    _id: string;
    fashionTitle: string;
    condition: string;
    fashionBrand: string;
    amount: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  householdAd: {
    _id: string;
    householdTitle: string;
    condition: string;
    householdBrand: string;
    amount: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  laptopAd: {
    _id: string;
    laptopTitle: string;
    condition: string;
    laptopBrand: string;
    amount: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  kidAd: {
    _id: string;
    title: string;
    condition: string;
    gender: string;
    amount: number;
    ageGroup: string;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  serviceAd: {
    _id: string;
    serviceTitle: string;
    pricingType: string;
    serviceExperience: string;
    amount: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  equipmentAd: {
    _id: string;
    equipmentTitle: string;
    condition: string;
    brand: string;
    amount: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  beautyAd: {
   _id: string;
   beautyTitle: string;
   condition: string;
   gender: string;
   beautyBrand: string;
   amount: number;
   negotiation: string;
   description: string;
   createdAt: string;
  } | null;
  constructionAd: {
   _id: string;
   constructionTitle: string;
   condition: string;
   constructionBrand: string;
   constructionType: string;
   amount: number;
   negotiation: string;
   description: string;
   createdAt: string;
  } | null;
  jobAd: {
   _id: string;
   jobTitle: string;
   jobType: string;
   experienceLevel: string;
   salaryRange: number;
   negotiation: string;
   description: string;
   createdAt: string;
  } | null;
  hireAd: {
    _id: string;
    hireTitle: string;
    jobType: string;
    workMode: string;
    salaryRange: number;
    negotiation: string;
    description: string;
    createdAt: string;
  } | null;
  isSold: boolean;
}