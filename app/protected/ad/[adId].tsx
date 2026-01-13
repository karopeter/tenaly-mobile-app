import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Linking,
  Share,
  Platform
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
//import RNShare from 'react-native-share';
import { AntDesign, Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiClient from '@/app/utils/apiClient';
import { CombinedAd } from '@/app/types/marketplace';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import ReportModal from '@/app/reusables/ReportModal';
import { SellerProfile } from '../../types/seller-profile.types';

const { width: screenWidth } = Dimensions.get('window');



export default function HomeListDetails() {
  const router = useRouter();
  const { adId } = useLocalSearchParams<{ adId: string }>();
  const [ad, setAd] = useState<CombinedAd | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [reportVisible, setReportVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState<boolean>(false);

  // Fetch marketplace ad data
  const fetchAdData = async () => {
    if (!adId) {
      showErrorToast('Invalid ad ID');
      setLoading(false);
      return;
    }

    try {
     if (!apiClient) {
       showErrorToast('API client not initialized.');
       return;
     }
      const response = await apiClient.get(`/api/products/get-marketById/${adId}`);
      if (response.data.success) {
        const adData = response.data.data;
        setAd(adData);

        // CHeck bookmark status  after ad is set 
        await checkBookmarkStatus(adData);
        
        if (adData.business?.userId) {
          await fetchSellerData(adData.business.userId);
        }
      } else {
        showErrorToast(response.data.message || 'Failed to fetch ad data');
      }
    } catch (error: any) {
      console.error('Error fetching ad data:', error);
      if (error.response?.status === 404) {
        showErrorToast(error.response.data.message || 'Ad not found or no longer available');
      } else {
        showErrorToast('Failed to load ad details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if ad is bookmarked
  const checkBookmarkStatus = async (adData?: CombinedAd) => {
    const currentAd = adData || ad;
    if (!currentAd) return;

    try {
      if (!apiClient) {
        showErrorToast("API client is not initialized");
        return;
      }

       const response = await apiClient.get('/api/bookmark/get-all-bookmark');
       if (response.data.success) {
        const bookmarks = response.data.data;
        const isAdBookmarked = bookmarks.some((bookmark: any) => bookmark.adId === adId);
        setIsBookmarked(isAdBookmarked);
       }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  }

  // Handle bookmark toggle 
  const handleBookmarkToggle = async () => {
    if (!adId || bookmarkLoading) return;

    setBookmarkLoading(true);

    try {
     if (!apiClient) {
      showErrorToast("API client is not initialized");
      return;
     }

     if (isBookmarked) {
      // unbookmarked 
      await apiClient.delete(`/api/bookmark/delete-bookmark/${adId}`);
      setIsBookmarked(false);
      showSuccessToast("Ad removed from bookmarks");
     } else {
      // Bookmark 
      await apiClient.post(`/api/bookmark/bookmarkAd/${adId}`);
      setIsBookmarked(true);
      showSuccessToast("Add Bookmarked successfully");
     }
    } catch (error: any) {
     console.error('Error toggling bookmark:', error);
     showErrorToast(
       error.response?.data?.message || 
       (isBookmarked ? "Failed to remove bookmark" : "Failed to bookmark ad")
     );
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Fetch seller profile data
const fetchSellerData = async (sellerId: string) => {
  try {
    if (!apiClient) {
      showErrorToast('API client not initialized.');
      return;
    }
    const response = await apiClient.get(`/api/profile/seller/${sellerId}`);
    
    // If API returns { success, data }, unwrap it:
    const sellerData = response.data?.data || response.data;
    setSeller(sellerData);
  } catch (error: any) {
    console.error('Error fetching seller data:', error);
  }
};


  useEffect(() => {
    fetchAdData();
  }, [adId]);

  useEffect(() => {
    if (ad) {
       checkBookmarkStatus();
    }
  }, [ad, adId]);

  // Get appropriate images based on ad type
  const getImages = () => {
  if (!ad) return [];

  if (ad.petAd) {
    return ad.carAd.petsImage || [];
  }
  if (ad.agricultureAd) {
    return ad.carAd.agricultureImage || [];
  }
  
  if (ad.vehicleAd) {
    return ad.carAd.vehicleImage || [];
  } else if (ad.propertyAd) {
    return ad.carAd.propertyImage || [];
  }

  // Add other types:
  if (ad.gadgetAd) return ad.carAd.gadgetImage || [];
  if (ad.fashionAd) return ad.carAd.fashionImage || [];
  if (ad.householdAd) return ad.carAd.householdImage || [];
  if (ad.laptopAd) return ad.carAd.laptopImage || [];
  if (ad.kidsAd) return ad.carAd.kidsImage || [];
  if (ad.serviceAd) return ad.carAd.serviceImage || [];
  if (ad.equipmentAd) return ad.carAd.equipmentImage || [];
  if (ad.beautyAd) return ad.carAd.beautyImage || [];
  if (ad.constructionAd) return ad.carAd.constructionImage || [];
  if (ad.jobAd) return ad.carAd.jobImage || [];
  if (ad.hireAd) return ad.carAd.hireImage || [];

  return [];
};

const handleShare = async () => {
  if (!ad) return;

  try {
    const productName = ad.petAd ? 
      ad.petAd.petType : 
      ad.agricultureAd ? 
      ad.agricultureAd.title : 
      ad.gadgetAd ? 
      ad.gadgetAd.gadgetTitle : 
      ad.hireAd ? 
      ad.hireAd.jobType :
      ad.equipmentAd ? 
      ad.equipmentAd.equipmentTitle :
      ad.fashionAd ?
      `${ad.fashionAd.fashionTitle} ${ad.fashionAd.fashionType} ${ad.fashionAd.fashionColor}` :
      ad.jobAd ?
      `${ad.jobAd.jobTitle} ${ad.jobAd.jobType} ${ad.jobAd.skils}` :
      ad.constructionAd ?
       ad.constructionAd.constructionTitle :
      ad.householdAd ?
      `${ad.householdAd.householdTitle} ${ad.householdAd.householdType} ${ad.householdAd.householdBrand}` :
      ad.laptopAd ? 
      `${ad.laptopAd.laptopTitle} ${ad.laptopAd.laptopType} ${ad.laptopAd.laptopBrand}` :
      ad.beautyAd ? 
      `${ad.beautyAd.beautyTitle} ${ad.beautyAd.beautyType} ${ad.beautyAd.beautyBrand}` :
      ad.serviceAd ? 
       `${ad.serviceAd.serviceTitle} ${ad.serviceAd.serviceDuration} ${ad.serviceAd.serviceAvailability}` :
      ad.kidsAd ? 
       `${ad.kidsAd.title} ${ad.kidsAd.condition} ${ad.kidsAd.ageGroup}` :
      ad.vehicleAd ? 
      `${ad.vehicleAd.vehicleType} ${ad.vehicleAd.model} ${ad.vehicleAd.year}` : 
      ad.propertyAd?.propertyName || 'Product';

    const price = formatPrice(
      Number(
        ad.petAd?.amount || 
        ad.agricultureAd?.amount || 
        ad.gadgetAd?.amount || 
        ad.hireAd?.salaryRange || 
        ad.equipmentAd?.amount || 
        ad.fashionAd?.amount || 
        ad.jobAd?.salaryRange || 
        ad.constructionAd?.amount || 
        ad.householdAd?.amount || 
        ad.laptopAd?.amount || 
        ad.beautyAd?.amount || 
        ad.serviceAd?.amount || 
        ad.kidsAd?.amount ||  
        ad.vehicleAd?.amount || 
        ad?.propertyAd?.amount ||
        0 
      )
    );

    const productImage = images[0];
    const webLink = `https://tenaly.vercel.app/product/${adId}`;
    const playStoreLink = 'https://play.google.com/store/apps/details?id=com.tenaly';

    const message = `🔥 ${productName}\n💰 ${price}\n📍 ${ad.propertyAd?.propertyAddress || ad.carAd.location}\n\n👉 View on Tenaly: ${webLink}\n\n📱 Get the app: ${playStoreLink}`;

    // Try sharing with image using expo-sharing
    if (productImage) {
      try {
        const fileUri = FileSystem.cacheDirectory + `${adId}.jpg`;
        await FileSystem.downloadAsync(productImage, fileUri);

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/jpeg',
            dialogTitle: `${productName} - ${price}`,
          });
          return; // Exit if image share succeeds
        }
      } catch (imageError) {
        console.log('Image sharing failed, falling back to text:', imageError);
        // Continue to text-only share below
      }
    }

    // Fallback: Share text only
    await Share.share({
      message: message,
      title: `Check out ${productName} on Tenaly`
    });

  } catch (error: any) {
    if (error.message !== 'User did not share') {
      console.error("Error sharing:", error);
      showErrorToast('Failed to share product');
    }
  }
};

// const handleShare = async () => {
//   if (!ad) return;

//   try {
//    const productName = ad.petAd ? 
//       ad.petAd.petType : 
//       ad.agricultureAd ? 
//       ad.agricultureAd.title : 
//       ad.gadgetAd ? 
//       ad.gadgetAd.gadgetTitle : 
//       ad.hireAd ? 
//       ad.hireAd.jobType :
//       ad.equipmentAd ? 
//       ad.equipmentAd.equipmentTitle :
//       ad.fashionAd ?
//       `${ad.fashionAd.fashionTitle} ${ad.fashionAd.fashionType} ${ad.fashionAd.fashionColor}` :
//       ad.jobAd ?
//       `${ad.jobAd.jobTitle} ${ad.jobAd.jobType} ${ad.jobAd.skils}` :
//       ad.constructionAd ?
//        ad.constructionAd.constructionTitle :
//       ad.householdAd ?
//       `${ad.householdAd.householdTitle} ${ad.householdAd.householdType} ${ad.householdAd.householdBrand}` :
//       ad.laptopAd ? 
//       `${ad.laptopAd.laptopTitle} ${ad.laptopAd.laptopType} ${ad.laptopAd.laptopBrand}` :
//       ad.beautyAd ? 
//       `${ad.beautyAd.beautyTitle} ${ad.beautyAd.beautyType} ${ad.beautyAd.beautyBrand}` :
//       ad.serviceAd ? 
//        `${ad.serviceAd.serviceTitle} ${ad.serviceAd.serviceDuration} ${ad.serviceAd.serviceAvailability}` :
//       ad.kidsAd ? 
//        `${ad.kidsAd.title} ${ad.kidsAd.condition} ${ad.kidsAd.ageGroup}` :
//       ad.vehicleAd ? 
//       `${ad.vehicleAd.vehicleType} ${ad.vehicleAd.model} ${ad.vehicleAd.year}` : 
//       ad.propertyAd?.propertyName || 'Product';

//       const price = formatPrice(
//         Number(
//            ad.petAd?.amount || 
//         ad.agricultureAd?.amount || 
//         ad.gadgetAd?.amount || 
//         ad.hireAd?.salaryRange || 
//         ad.equipmentAd?.amount || 
//         ad.fashionAd?.amount || 
//         ad.jobAd?.salaryRange || 
//         ad.constructionAd?.amount || 
//         ad.householdAd?.amount || 
//         ad.laptopAd?.amount || 
//         ad.beautyAd?.amount || 
//         ad.serviceAd?.amount || 
//         ad.kidsAd?.amount ||  
//         ad.vehicleAd?.amount || 
//         ad?.propertyAd?.amount ||
//         0 
//         )
//       );

//     const productImage = [0];
//     const deepLink = `tenaly://product/${adId}`;
//     const webLink = `https://tenaly.vercel.app/product/${adId}`;
//     const appStoreLink = 'https://apps.google.com/app/tenaly';
//     const playStoreLink = 'https://play.google.com/store/app/details?id=com.tenaly';



//       //const message = `Check out this ${productName} on Tenaly for  ${price}!\n\nLocation: ${ad.propertyAd?.propertyAddress || ad.carAd.location}`;
//      const message = `🔥 ${productName}\n💰 ${price}\n📍 ${ad.propertyAd?.propertyAddress || ad.carAd.location}\n\n👉 View on Tenaly:\n${webLink}\n\n📱 Download Tenaly:\niOS: ${appStoreLink}\nAndroid: ${playStoreLink}`;

//       await Share.share({
//         message: message,
//         url: productImage,
//         title: `Check out ${productName} on Tenaly`
//       });
//   } catch (error) {
//       console.error("Error sharing:", error);
//       showErrorToast('Failed to share product');
//   }
// }

  // Get details based on ad type
  const getAdDetails = () => {
    if (!ad) return {};

    if (ad.petAd) {
      const details: Record<string, string> = {};

      if (ad.petAd.petType) details['Pet Type'] = ad.petAd.petType;
      if (ad.petAd.breed) details['Breed'] = ad.petAd.breed;
      if (ad.petAd.age) details['Age'] = ad.petAd.age;
      if (ad.petAd.gender) details['Gender'] = ad.petAd.gender;
      if (ad.petAd.healthStatus) details['Health Status'] = ad.petAd.healthStatus.join(', ');
      if (ad.petAd.negotiation) details['Negotiation'] = ad.petAd.negotiation;

      return details;
    }

     // New Agriculture Ad Details 
    if (ad.agricultureAd) {
      const details: Record<string, string> = {};

      if (ad.agricultureAd.title) details['Title'] = ad.agricultureAd.title;
      if (ad.agricultureAd.agricultureType) details['Type'] = ad.agricultureAd.agricultureType.join(', ');
      if (ad.agricultureAd.condition) details['Condition'] = ad.agricultureAd.condition;
      if (ad.agricultureAd.unit) details['Unit'] = ad.agricultureAd.unit;
      if (ad.agricultureAd.bulkPrice && ad.agricultureAd.bulkPrice.length > 0) {
        details['Bulk Price'] = ad.agricultureAd.bulkPrice.map(bp => 
          `${bp.quantity} ${bp.unit} @ ₦${bp.amountPerUnit.toLocaleString()}`
        ).join(', ');
      }
      if (ad.agricultureAd.feedType) details['Feed Type'] = ad.agricultureAd.feedType.join(', ');
      if (ad.agricultureAd.brand) details['Brand'] = ad.agricultureAd.brand;
       if (ad.agricultureAd.formulationType) details['Formulation Type'] = ad.agricultureAd.formulationType.join(', ');
       if (ad.agricultureAd.serviceMode) details['Service Mode'] = ad.agricultureAd.serviceMode.join(', ');
       if (ad.agricultureAd.negotiation) details['Negotiation'] = ad.agricultureAd.negotiation;

      return details;
    }

    // Hire Ad Details 
    if (ad.hireAd) {
      const details: Record<string, string> = {};

      if (ad.hireAd.hireGender) details['Gender'] = ad.hireAd.hireGender;
      if (ad.hireAd.jobType) details['Job Type'] = ad.hireAd.jobType;
      if (ad.hireAd.experienceLevel) details['Experience Level'] = ad.hireAd.experienceLevel;
      if (ad.hireAd.workMode) details['Work Mode'] = ad.hireAd.workMode;
      if (ad.hireAd.yearsOfExperience) details['Years of Experience'] = ad.hireAd.yearsOfExperience;
      if (ad.hireAd.relationshipStatus) details['Relationship Status'] = ad.hireAd.relationshipStatus;
      if (ad.hireAd.skills) details['Skills'] = ad.hireAd.skills;
      if (ad.hireAd.pricingType) details['Pricing Type'] = ad.hireAd.pricingType;
      if (ad.hireAd.negotiation)  details['Negotiation'] = ad.hireAd.negotiation;
      return details;
    }

    if (ad.equipmentAd) {
      const details: Record<string, string> = {};

      if (ad.equipmentAd.condition) details['Condition'] = ad.equipmentAd.condition;
      if (ad.equipmentAd.powerSource) details['Power Source'] = ad.equipmentAd.powerSource;
      if (ad.equipmentAd.brand) details['Brand'] = ad.equipmentAd.brand;
      if (ad.equipmentAd.usageType) details['Usage Type'] = ad.equipmentAd.usageType;
      if (ad.equipmentAd.negotiation) details['Negotiation'] = ad.equipmentAd.negotiation;

      return details;
    }

    if (ad.fashionAd) {
      const details: Record<string, string> = {};

      if (ad.fashionAd.fashionType) details['Fashion Type'] = ad.fashionAd.fashionType;
      if (ad.fashionAd.condition) details['Condition'] = ad.fashionAd.condition;
      if (ad.fashionAd.fashionBrand) details['Brand'] = ad.fashionAd.fashionBrand;
      if (ad.fashionAd.gender) details['Gender'] = ad.fashionAd.gender;
      if (ad.fashionAd.size) details['Size'] = ad.fashionAd.size;
      if (ad.fashionAd.fashionMaterial) details['Material'] = ad.fashionAd.fashionMaterial;
      if (ad.fashionAd.fashionColor) details ['Color'] = ad.fashionAd.fashionColor;
      if (ad.fashionAd.negotiation) details['Negotiation'] = ad.fashionAd.negotiation;

      return details;
    }

    if (ad.jobAd) {
      const details: Record<string, string> = {};

      if (ad.jobAd.companyEmployerName) details['Company Employer Name'] = ad.jobAd.companyEmployerName;
      if (ad.jobAd.location) details['Job Location'] = ad.jobAd.location;
      if (ad.jobAd.jobType) details['Job Type'] = ad.jobAd.jobType;
      if (ad.jobAd.experienceLevel) details['Experience Level'] = ad.jobAd.experienceLevel;
      if (ad.jobAd.yearOfExperience) details['Year of Experience'] = ad.jobAd.yearOfExperience;
      if (ad.jobAd.genderPreference) details['Gender Preference'] = ad.jobAd.genderPreference;
      if (ad.jobAd.applicationDeadline) details['Application Deadline'] = ad.jobAd.applicationDeadline;
      if (ad.jobAd.skils) details['Skills'] = ad.jobAd.skils;
      if (ad.jobAd.jobLocationType) details['Job Location Type'] = ad.jobAd.jobLocationType;
      if (ad.jobAd.responsibilities) details['Responsibilities'] = ad.jobAd.responsibilities;
      if (ad.jobAd.requirements) details['Requirements'] = ad.jobAd.requirements;
      if (ad.jobAd.pricingType) details['Pricing Type'] = ad.jobAd.pricingType;
      if (ad.jobAd.negotiation) details['Negotiation'] = ad.jobAd.negotiation;

      return details;
    }

    if (ad.constructionAd) {
      const details: Record<string, string> = {};

      if (ad.constructionAd.constructionType) details['Type'] = ad.constructionAd.constructionType;
      if (ad.constructionAd.constructionMaterial) details['Materials'] = ad.constructionAd.constructionMaterial;
      if (ad.constructionAd.constructionUnit) details['Unit'] = ad.constructionAd.constructionUnit;
      if (ad.constructionAd.constructionBrand) details['Brand'] = ad.constructionAd.constructionBrand;
      if (ad.constructionAd.condition) details['Condition'] = ad.constructionAd.condition;
      if (ad.constructionAd.warranty) details['Warranty'] = ad.constructionAd.warranty;
      if (ad.constructionAd.powerRating) details['Power Rating'] = ad.constructionAd.powerRating;
      if (ad.constructionAd.yearOfManufacture) details['Year of Manufacture'] = ad.constructionAd.yearOfManufacture;
      if (ad.constructionAd.fuelType) details['Fuel Type'] = ad.constructionAd.fuelType;
      if (ad.constructionAd.finish) details['Finish'] = ad.constructionAd.finish;
      if (ad.constructionAd.constructionColor) details['Color'] = ad.constructionAd.constructionColor;
      if (ad.constructionAd.size) details['Size'] = ad.constructionAd.size;
      if (ad.constructionAd.experienceLevel) details['Experience Level'] = ad.constructionAd.experienceLevel;
      if (ad.constructionAd.constructionAvailability) details['Availability'] = ad.constructionAd.constructionAvailability;
      if (ad.constructionAd.constructionUnit) details['Unit'] = ad.constructionAd.constructionUnit;
      if (ad.constructionAd.negotiation) details['Negotiation'] = ad.constructionAd.negotiation;
      if (ad.constructionAd.bulkPrice && ad.constructionAd.bulkPrice.length > 0) {
        details['Bulk Price'] = ad.constructionAd.bulkPrice.map(bp => 
          `${bp.quantity} ${bp.unit} @ ₦${bp.amountPerUnit.toLocaleString()}`
        ).join(', ');
      }

      return details;
    }

    if (ad.householdAd) {
      const details: Record<string, string> = {};

      if (ad.householdAd.householdType) details['Type'] = ad.householdAd.householdType;
      if (ad.householdAd.condition) details['Condition'] = ad.householdAd.condition;
      if (ad.householdAd.householdBrand) details['Brand'] = ad.householdAd.householdBrand;
      if (ad.householdAd.householdMaterial) details['Material']  = ad.householdAd.householdMaterial;
      if (ad.householdAd.householdStyle) details['Style'] = ad.householdAd.householdStyle;
      if (ad.householdAd.householdColor) details['Color'] = ad.householdAd.householdColor;
      if (ad.householdAd.roomType) details['Room Type'] = ad.householdAd.roomType;
      if (ad.householdAd.powerType) details['Power Type'] = ad.householdAd.powerType;
      if (ad.householdAd.size) details['Size'] = ad.householdAd.size;
      if (ad.householdAd.householdPowersource) details['Power Source'] = ad.householdAd.householdPowersource;
      if (ad.householdAd.colorTemperature) details['Color Temperature'] = ad.householdAd.colorTemperature;
      if (ad.householdAd.negotiation) details['Negotiation'] = ad.householdAd.negotiation;

      return details;
     }

     if (ad.laptopAd) {
      const details: Record<string, string> = {};

      if (ad.laptopAd.condition) details['Condition'] = ad.laptopAd.condition;
      if (ad.laptopAd.laptopType) details['Type'] = ad.laptopAd.laptopType;
      if (ad.laptopAd.laptopBrand) details['Brand'] = ad.laptopAd.laptopBrand;
      if (ad.laptopAd.laptopWarranty) details['Warranty'] = ad.laptopAd.laptopWarranty;
      if (ad.laptopAd.laptopConnectivityType) details['Connectivity Type'] = ad.laptopAd.laptopConnectivityType.join(', ');
      if (ad.laptopAd.speedRating) details['Speet Rating'] = ad.laptopAd.speedRating;
      if (ad.laptopAd.laptopStorage) details['Storage'] = ad.laptopAd.laptopStorage;
      if (ad.laptopAd.laptopOperating) details['Operating System']  = ad.laptopAd.laptopOperating;
      if (ad.laptopAd.laptopRam) details['Ram'] = ad.laptopAd.laptopRam;
      if (ad.laptopAd.laptopProcessor) details['Processor'] = ad.laptopAd.laptopProcessor;
      if (ad.laptopAd.laptopScreenSize) details['Screen Size'] =  ad.laptopAd.laptopScreenSize;
      if (ad.laptopAd.laptopBatteryHealth) details['Battery Health'] = ad.laptopAd.laptopBatteryHealth;
      if (ad.laptopAd.laptopColor) details['Color'] = ad.laptopAd.laptopColor;
      if (ad.laptopAd.laptopAccessories) details['Accessories'] = ad.laptopAd.laptopAccessories;
      if (ad.laptopAd.laptopWarranty) details['Warranty'] = ad.laptopAd.laptopWarranty;
      if (ad.laptopAd.screenSize) details['Screen Size'] = ad.laptopAd.screenSize;
      if (ad.laptopAd.resolution) details['Resolution'] = ad.laptopAd.resolution;
      if (ad.laptopAd.refreshRate) details['Refresh Rate'] = ad.laptopAd.refreshRate;
      if (ad.laptopAd.capacity) details['capacity'] = ad.laptopAd.capacity;
      if (ad.laptopAd.negotiation) details['Negotiation'] = ad.laptopAd.negotiation;

      return details;
     }


     if (ad.beautyAd) {
       const details: Record<string, string> = {};

       if (ad.beautyAd.beautyType) details['Type'] = ad.beautyAd.beautyType;
       if (ad.beautyAd.condition) details['Condition'] = ad.beautyAd.condition;
       if (ad.beautyAd.hairType) details['Hair Type'] = ad.beautyAd.hairType;
       if (ad.beautyAd.gender) details['Gender'] = ad.beautyAd.gender;
       if (ad.beautyAd.beautyBrand) details['Brand'] = ad.beautyAd.beautyBrand;
       if (ad.beautyAd.skinType) details['skinType'] = ad.beautyAd.skinType;
       if (ad.beautyAd.targetConcern) details['Target Concern'] = ad.beautyAd.targetConcern;
       if (ad.beautyAd.skinTone) details['Skin Tone'] = ad.beautyAd.skinTone;
       if (ad.beautyAd.fragranceFamily) details['Fragrance'] = ad.beautyAd.fragranceFamily;
       if (ad.beautyAd.beautyPowerSource) details['Power Source'] = ad.beautyAd.beautyPowerSource;
       if (ad.beautyAd.negotiation) details['Negotiation'] = ad.beautyAd.negotiation;

       return details;
      }

      if (ad.serviceAd) {
        const details: Record<string, string> = {};

        if (ad.serviceAd.serviceDuration) details['Duration'] = ad.serviceAd.serviceDuration;
        if (ad.serviceAd.serviceExperience) details['Experience'] = ad.serviceAd.serviceExperience;
        if (ad.serviceAd.serviceAvailability) details['Availability'] = ad.serviceAd.serviceAvailability;
        if (ad.serviceAd.serviceLocation) details['Location'] = ad.serviceAd.serviceLocation;
        if (ad.serviceAd.yearOfExperience) details['Year of Experience'] = ad.serviceAd.yearOfExperience;
        if (ad.serviceAd.pricingType) details['Pricing Type'] = ad.serviceAd.pricingType;
        if (ad.serviceAd.serviceDiscount) details['Discount'] = ad.serviceAd.serviceDiscount;
        if (ad.serviceAd.negotiation) details['Negotiation'] = ad.serviceAd.negotiation;
        return details;
      }

      if (ad.kidsAd) {
        const details: Record<string, string> = {};

        if (ad.kidsAd.condition) details['Condition'] = ad.kidsAd.condition;
        if (ad.kidsAd.color) details['Color'] = ad.kidsAd.color;
        if (ad.kidsAd.gender) details['Gender'] = ad.kidsAd.gender;
        if (ad.kidsAd.ageGroup) details['Age Group'] = ad.kidsAd.ageGroup;
        if (ad.kidsAd.plasticGroup) details['Plastic Group'] = ad.kidsAd.plasticGroup;
        if (ad.kidsAd.woodOptions) details['Wood Options'] = ad.kidsAd.woodOptions;
        if (ad.kidsAd.negotiation) details['Negotiation'] = ad.kidsAd.negotiation;

        return details;
      }



   // Gadget details 
if (ad.gadgetAd) {
  const details: Record<string, string> = {};
  
  // if (ad.gadgetAd.gadgetTitle) details['Title'] = ad.gadgetAd.gadgetTitle;
  if (ad.gadgetAd.condition) details['Condition'] = ad.gadgetAd.condition;
  if (ad.gadgetAd.gadgetBrand) details['Brand'] = ad.gadgetAd.gadgetBrand;
  if (ad.gadgetAd.storageCapacity) details['Storage'] = ad.gadgetAd.storageCapacity;
  if (ad.gadgetAd.ram) details['RAM'] = ad.gadgetAd.ram;
  if (ad.gadgetAd.operatingSystem) details['OS'] = ad.gadgetAd.operatingSystem;
  if (ad.gadgetAd.network) details['Network'] = ad.gadgetAd.network;
  if (ad.gadgetAd.batteryHealth) details['Battery Health'] = ad.gadgetAd.batteryHealth;
  if (ad.gadgetAd.gadgetColor) details['Color'] = ad.gadgetAd.gadgetColor;
  if (ad.gadgetAd.simType) details['Sim Type'] = ad.gadgetAd.simType;
  if (ad.gadgetAd.accessories) details['Accessories'] = ad.gadgetAd.accessories;
  if (ad.gadgetAd.warranty) details['Warranty'] = ad.gadgetAd.warranty;
  if (ad.gadgetAd.connectivityType) details['Connectivity Type'] = ad.gadgetAd.connectivityType;
  if (ad.gadgetAd.negotiation) details['Negotiation'] = ad.gadgetAd.negotiation;
  
  return details;
}


if (ad.vehicleAd) {
  const details: Record<string, string> = {};

  if (ad.vehicleAd.model)  details['Model'] = ad.vehicleAd.model; 
  if (ad.vehicleAd.year) details['Year'] = ad.vehicleAd.year.toString();
  if (ad.vehicleAd.trim) details['Trim'] = ad.vehicleAd.trim;
  if (ad.vehicleAd.color) details['Color'] = ad.vehicleAd.color;
  if (ad.vehicleAd.interiorColor) details['Interior Color'] = ad.vehicleAd.interiorColor;
  if (ad.vehicleAd.transmission) details['Transmission'] = ad.vehicleAd.transmission;
  if (ad.vehicleAd.vinChassisNumber) details['Vin Chassis Number'] = ad.vehicleAd.vinChassisNumber;
  if (ad.vehicleAd.carRegistered) details['Car Registered'] = ad.vehicleAd.carRegistered;
  if (ad.vehicleAd.exchangePossible) details['Exchange Possible'] = ad.vehicleAd.exchangePossible;
  if (ad.vehicleAd.carKeyFeatures) details['Car Key Features'] = ad.vehicleAd.carKeyFeatures.join(', ');
  if (ad.vehicleAd.carType) details['Car Type'] = ad.vehicleAd.carType;
  if (ad.vehicleAd.carBody) details['Car Body'] = ad.vehicleAd.carBody;
  if (ad.vehicleAd.fuel) details['Fuel'] = ad.vehicleAd.fuel;
  if (ad.vehicleAd.seat) details['Seat'] = ad.vehicleAd.seat;
  if (ad.vehicleAd.driveTrain) details['Drive Train'] = ad.vehicleAd.driveTrain;
  if (ad.vehicleAd.numberOfCylinders) details['Number of Cylinders'] = ad.vehicleAd.numberOfCylinders;
  if (ad.vehicleAd.engineSizes) details['Engine Sizes'] = ad.vehicleAd.engineSizes;
  if (ad.vehicleAd.horsePower) details['Horse Power'] = ad.vehicleAd.horsePower;
  if (ad.vehicleAd.negotiation) details['Negotiation'] = ad.vehicleAd.negotiation;

  return details;
}

if (ad.propertyAd) {
  const details: Record<string, string> = {};

  if (ad.propertyAd.propertyAddress) details['Address'] = ad.propertyAd.propertyAddress;
  if (ad.propertyAd.propertyType) details['Property Type'] = ad.propertyAd.propertyType;
  if (ad.propertyAd.propertyCondition) details['Condition'] = ad.propertyAd.propertyCondition;
  if (ad.propertyAd.propertyFacilities) details['Facilities'] = ad.propertyAd.propertyFacilities.join(', ');
  if (ad.propertyAd.furnishing) details['Furnishing'] = ad.propertyAd.furnishing;
  if (ad.propertyAd.parking) details['Parking'] = ad.propertyAd.parking;
  if (ad.propertyAd.squareMeter) details['Square Meter'] = ad.propertyAd.squareMeter;
  if (ad.propertyAd.ownershipStatus) details['Ownership Status'] = ad.propertyAd.ownershipStatus;
  if (ad.propertyAd.serviceCharge) details['Service Charge'] = ad.propertyAd.serviceCharge;
  if (ad.propertyAd.numberOfBedrooms) details['Number of Bedrooms'] = ad.propertyAd.numberOfBedrooms;
  if (ad.propertyAd.numberOfBathrooms) details['Number of Bathrooms'] = ad.propertyAd.numberOfBathrooms;
  if (ad.propertyAd.numberOfToilet) details['Number of Toilet'] = ad.propertyAd.numberOfToilet;
  if (ad.propertyAd.titleDocuments) details['Title Documents'] = ad.propertyAd.titleDocuments;
  if (ad.propertyAd.maximumAllowedGuest) details['Maximum Allowed Guest'] = ad.propertyAd.maximumAllowedGuest;
  if (ad.propertyAd.isSmokingAllowed) details['Smoking Allowed'] = ad.propertyAd.isSmokingAllowed;
  if (ad.propertyAd.isPartiesAllowed) details['Parties Allowed'] = ad.propertyAd.isPartiesAllowed;
  if (ad.propertyAd.petsAllowed) details['Pets Allowed'] = ad.propertyAd.petsAllowed;
  if (ad.propertyAd.developmentFee) details['Development Fee'] = ad.propertyAd.developmentFee;
  if (ad.propertyAd.surveyFee) details['Survey Fee'] = ad.propertyAd.surveyFee;
  if (ad.propertyAd.legalFee) details['Legal Fee'] = ad.propertyAd.legalFee;
  if (ad.propertyAd.pricingUnits) details['Pricing Units'] = ad.propertyAd.pricingUnits;
  if (ad.propertyAd.serviceFee) details['Service Fee'] = ad.propertyAd.serviceFee;
  if (ad.propertyAd.propertyDuration) details['Duration'] = ad.propertyAd.propertyDuration;
  if (ad.propertyAd.guestNumber) details['Guest Number'] = ad.propertyAd.guestNumber;
  if (ad.propertyAd.negotiation) details['Negotiation'] = ad.propertyAd.negotiation;

  return details;
}
    return {};
  };

  const images = getImages();

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

 const handlePhoneCall = async (phoneNumber: string) => {
  if (!phoneNumber || phoneNumber === "Loading...") {
    showErrorToast("Phone number not available");
    return;
  }

   try {
    // Clean and format phone number 
    let cleanNumber = phoneNumber.trim().replace(/[^\d+]/g, '');

    // Ensure proper format for both iOS and Andriod 
    if (!cleanNumber.startsWith('+')) {
      cleanNumber = cleanNumber.startsWith('0')
        ? cleanNumber.substring(1)
        : cleanNumber;
      cleanNumber = `+234${cleanNumber}`;
    }

    const phoneUrl = Platform.OS === 'ios'
      ? `telprompt:${cleanNumber}`
      : `tel:${cleanNumber}`;
    
    const canOpen = await Linking.canOpenURL(phoneUrl);

    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      // Fallback for Andriod 
      const fallbackUrl = `tel:${cleanNumber}`;
      await Linking.openURL(fallbackUrl);
    }
   } catch (error) {
     console.error("Error making phone call:", error);
     showErrorToast("Unable to make call. Please try again.");
   }
 }


  const renderContent = () => {
    if (!ad) return null;

    const details = getAdDetails();

    switch (activeTab) {
      case 'details':
        return (
          <View>
            {/* Details Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                   {ad.petAd ? 'Pet Details' :
                     ad.agricultureAd ? 'Agriculture Product Details' :
                     ad.gadgetAd ? 'Gadget Details' :
                     ad.hireAd ? 'Hire Details' :
                     ad.equipmentAd ? 'Equipment Details' :
                     ad.fashionAd ? 'Fashion Details' : 
                     ad.jobAd ? 'Job Details' :
                     ad.constructionAd ? 'Construction Details' : 
                     ad.householdAd ? 'Household Details' :
                     ad.laptopAd ? 'Laptop Details' :
                     ad.beautyAd ? 'Beauty Details' :
                     ad.serviceAd ? 'Service Details' :
                     ad.kidsAd ?  'Kids Details' :
                     ad.petAd ? 'Pet Details' :
                    ad.vehicleAd ? 'Vehicle Details' : 
                    'Property Details'}
                </Text>
                <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
                 <View style={styles.seeRow}>
                    <Text style={styles.seeAllText}>
                      {showDetails ? 'Hide' : 'See all'}
                    </Text>
                    <AntDesign
                      name={showDetails ? 'up' : 'down'}
                      size={14}
                      color={colors.blue}
                      style={{ marginLeft: 4 }} />
                 </View>
                </TouchableOpacity>
              </View>

              {showDetails && (
                <View style={styles.detailsGrid}>
                  {Object.entries(details).map(([key, value], index) => (
                    <View style={styles.detailItem} key={index}>
                      <Text style={styles.detailKey}>{key}</Text>
                      <Text style={styles.detailValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* New section for Hire Ad Links */}
              {ad.hireAd && showDetails && (
                <View style={{ marginTop: 16 }}>
                  {ad.hireAd.portfolioLink && (
                    <TouchableOpacity
                      onPress={() => ad.hireAd?.portfolioLink && Linking.openURL(ad.hireAd.portfolioLink)}
                      style={styles.linkButton}
                    >
                     <Feather name="link" size={16} color={colors.blue} />
                     <Text style={styles.linkText}>View Portfolio</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {ad.hireAd?.otherLinks && (
                <TouchableOpacity
                  onPress={() => ad.hireAd?.otherLinks && Linking.openURL(ad.hireAd.otherLinks)}
                  style={styles.linkButton}
                >
                 <Feather name="link" size={16} color={colors.blue} />
                  <Text style={styles.linkText}>View Other Links</Text>
                </TouchableOpacity>
              )}

              {ad.hireAd?.resume && (
               <TouchableOpacity
                 onPress={() => ad.hireAd?.resume && Linking.openURL(ad.hireAd.resume)}
                 style={styles.linkButton}
               >
                <Feather name="file-text" size={16} color={colors.blue} />
                  <Text style={styles.linkText}>View Resume</Text>
               </TouchableOpacity>
              )}
            </View>

            {/* More Info Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>More Info</Text>
              <Text style={styles.moreInfoText}>
               {ad.petAd?.description || 
                 ad.agricultureAd?.description ||
                 ad.vehicleAd?.description || 
                 ad.gadgetAd?.description || 
                 ad.hireAd?.description ||
                 ad.equipmentAd?.description || 
                 ad.fashionAd?.description || 
                 ad.jobAd?.description || 
                 ad.constructionAd?.description || 
                 ad.householdAd?.description || 
                 ad.laptopAd?.description || 
                 ad.beautyAd?.description || 
                 ad.serviceAd?.description || 
                 ad.kidsAd?.description || 
                 ad.propertyAd?.description || 
                'No description available'}
              </Text>
            </View>

            {/* Property Facilities (if property) */}
            {ad.propertyAd && ad.propertyAd.propertyFacilities && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Property Facilities</Text>
                <View style={styles.facilitiesContainer}>
                  {ad.propertyAd.propertyFacilities.map((facility: string, index: number) => (
                    <View key={index} style={styles.facilityItem}>
                      <Text style={styles.facilityText}>{facility}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Seller Info Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sellerContainer}>
                <View style={{ position: 'relative' }}>
                  <Image 
                    source={
                      seller?.image
                      ? { uri: seller.image }
                      : ad.business?.profileImage
                      ? { uri: ad.business.profileImage }
                      : require('@/assets/images/profile-circle.png')
                    }
                    style={styles.sellerLogo}
                  />
                  {seller?.verificationStatus?.personal === 'verified' && (
                    <View style={styles.verifiedBadge}>
                      <Image 
                      source={require('../../../assets/images/verified-thick.png')}
                      style={{ width: 16, height: 16 }}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.sellerDetails}>
                  <TouchableOpacity>
                    <Text style={styles.sellerName}>
                     {ad.business?.businessName || seller?.fullName || 'Unknown Business'}
                    </Text>
                  </TouchableOpacity>
                   {seller && (
                    <View style={[
                      styles.verifiedRow,
                      seller.verificationStatus?.business === 'verified'
                      ? { backgroundColor: colors.greenSuccess }
                      : {backgroundColor: colors.lightRed }
                    ]}>
                      {seller.verificationStatus?.business === 'verified' ? (
                        <>
                          <Image 
                           source={require('../../../assets/images/verified.png')}
                           style={{ width: 12, height: 12, }}
                          />
                          <Text style={styles.verifiedText}>Verified Business</Text>
                        </>
                      ): (
                        <>
                        <Image 
                         source={require('../../../assets/images/unverified.png')}
                         style={{ width: 12, height: 12 }}
                        />
                        <Text style={styles.unverifiedText}>Unverified Business</Text>
                        </>
                      )}
                    </View>
                   )}
                  <Text style={styles.sellerJoinDate}>
                    Joined Tenaly on {formatDate(seller?.joinedDate || ad.business.createdAt || ad.carAd.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Safety Tips Section */}
            <View style={styles.safetyTipsContainer}>
              <Text style={styles.sectionTitle}>Safety Tips</Text>
              <View style={styles.safetyTipsList}>
                {safetyTips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <View style={styles.tipBullet} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.reportButton}
                  onPress={() => setReportVisible(true)}>
                  <Feather name="flag" size={16} color="#DC2626" />
                  <Text style={styles.reportButtonText}>Report this listing</Text>
                </TouchableOpacity>

                <ReportModal
                 visible={reportVisible}
                 onClose={() => setReportVisible(false)}
                 productId={adId}
                 onSuccess={() => console.log("Report submitted successfully")}
                />
              </View>
            </View>
          </View>
        );
       case 'address':
  return (
 <View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Store Address</Text>
     {ad.business.addresses?.map((address, index) => {
        const hours = ad.business.businessHours?.find(
        (bh: any) => bh.address.includes(address.address)
      );

    const deliverySettings = (address as any).deliverySettings;
    return (
      <View key={address._id}>
        <View style={styles.addressItem}>
          <AntDesign 
            name="environment" 
            size={24} 
            color="#525252"
            style={{ 
              marginRight: 8, 
              marginTop: 7 
            }}
          /> 
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressTitle}>
              {ad.business.location} 
            </Text>
            <Text style={styles.addressDetails}>{address.address}</Text>

            {/* Working Hours */}
            {hours ? (
              <>
                <Text style={styles.addressHoursTitle}>Working Hours</Text>

                <View style={styles.workingHoursContainer}>
                  {hours.days.map((day: string) => (
                    <Text key={day} style={styles.workingHoursDayActive}>
                      {day.slice(0, 3)}
                    </Text>
                  ))}
                </View>

                {/* Time */}
                <View style={styles.addressContainer}>
                  <Image
                    source={require('../../../assets/images/clock.png')}
                    style={styles.addressIcon}
                  />
                  <Text style={styles.addressTime}>
                    {hours.openingTime} - {hours.closingTime}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.noHoursText}>No working hours set</Text>
            )}
         <View style={styles.deliveryWrapper}>
          <View style={styles.deliveryBadge}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="local-shipping" size={16} color="#1031AA" />
            </View>
            <View style={{ flex: 1 }}>
            <Text style={styles.deliveryBadgeTitle}>
             {address.deliveryAvailable && deliverySettings ? (
              <Text style={styles.deliveryBadgeTitle}>
               Delivery available
             <Text style={styles.deliveryBadgeDays}> 
              ({deliverySettings.dayFrom}-{deliverySettings.daysTo} days)
            </Text>
          </Text>
         ) : (
          <Text style={styles.deliveryBadgeTitle}>No delivery</Text>
         )}
      </Text>

      {deliverySettings?.feeFrom != null && deliverySettings?.feeTo != null && (
         <Text style={styles.deliveryFeeText}>
            Fee: ₦{Number(deliverySettings.feeFrom).toLocaleString()} - ₦{Number(deliverySettings.feeTo).toLocaleString()}
          </Text>
        )}
      </View>
    </View>

      {/* Delivery Info line */}
        {deliverySettings?.explanation ? (
           <Text style={styles.deliveryInfo}>
              <Text style={styles.deliveryInfoLabel}>Delivery Info: </Text>
              {deliverySettings.explanation}
            </Text>
          ) : null}
        </View>
        </View>
      </View>

        {index < ad.business.addresses.length - 1 && (
          <View style={styles.divider} />
        )}
      </View>
    );
  })}
</View>

  );

      case 'reviews':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Reviews (0)</Text>
            <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const safetyTips = [
    'Always meet the seller in a public, well-lit place area. Avoid secluded places.',
    'Inspect the product thoroughly (the exterior of vehicles, interiors of vehicles and properties and others) for any signs of damage.',
    'Ensure the seller provides valid registration papers, proof of ownership and a roadworthiness certificate',
    'Do not make full or partial payments before seeing the product and confirming its legitimacy.',
    'Bring a Mechanic if unsure - have a trusted professional inspect the item thoroughly before making a decision if you are unsure.',
    'If you think this listing is a fraud, kindly report it.',
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={styles.loadingText}>Loading ad details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ad) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ad not found or no longer available</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerDetails}>
            <TouchableOpacity onPress={() => router.back()}>
              <AntDesign name="arrow-left" size={18} color={colors.darkGray} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Details</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
               onPress={handleBookmarkToggle}
               disabled={bookmarkLoading}
             >
              {bookmarkLoading ? (
                <ActivityIndicator size="small" color={colors.blue} />
              ): (
                <Image 
                   source={isBookmarked
                    ? require('../../../assets/images/bookmark-filled1.png')
                    : require('../../../assets/images/bookmarkedIcon.png')
                   }
                   style={[styles.bookIcon, { resizeMode: 'contain'}]}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Image
                source={require('../../../assets/images/shareIcon.png')}
                style={styles.bookIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoTopRow}>
            <View>
            <Text style={styles.productName}>
              {ad.petAd ? 
               ad.petAd.petType :
               ad.agricultureAd ?
               ad.agricultureAd.title :
               ad.gadgetAd ? 
               ad.gadgetAd.gadgetTitle :
               ad.hireAd ?
               ad.hireAd.hireTitle :
               ad.equipmentAd ? 
               ad.equipmentAd.equipmentTitle :
               ad.fashionAd ?
               ad.fashionAd.fashionTitle :
               ad.jobAd ? 
               ad.jobAd.jobTitle :
               ad.constructionAd ? 
               ad.constructionAd.constructionTitle :
               ad.householdAd ? 
               ad.householdAd.householdTitle :
               ad.laptopAd ?
               ad.laptopAd.laptopTitle :
               ad.beautyAd ?
               ad.beautyAd.beautyTitle :
               ad.serviceAd ? 
               ad.serviceAd.serviceTitle :
               ad.kidsAd ?
               ad.kidsAd.title :
               ad.vehicleAd ? 
              `${ad.vehicleAd.vehicleType} ${ad.vehicleAd.model} ${ad.vehicleAd.year}` :
               ad.propertyAd?.propertyName || 'Product'
               }
             </Text>
              <View style={styles.locationCon}>
                <Image
                  source={require('../../../assets/images/location.png')}
                  style={styles.locationIcon}
                />
                <Text style={styles.locationText}>
                  {ad.propertyAd?.propertyAddress || ad.carAd.location}
                </Text>
              </View>
              <Text style={styles.postDate}>
                Posted on {formatDate(ad.carAd.createdAt)}
              </Text>
            </View>
            <View style={styles.viewsContainer}>
              <Feather name="eye" size={16} color="#9CA3AF" />
              <Text style={styles.viewsText}>
                {ad.petAd?.viewCount || 
                  ad.agricultureAd?.viewCount || 
                  ad.gadgetAd?.viewCount || 
                  ad.hireAd?.viewCount || 
                  ad.equipmentAd?.viewCount ||
                  ad.fashionAd?.viewCount || 
                  ad.jobAd?.viewCount || 
                  ad.constructionAd?.viewCount || 
                  ad.householdAd?.viewCount || 
                  ad.laptopAd?.viewCount || 
                  ad.beautyAd?.viewCount || 
                  ad.serviceAd?.viewCount || 
                  ad.kidsAd?.viewCount || 
                  ad.vehicleAd?.viewCount || 
                  ad.propertyAd?.viewCount || 
                  0} views
                 </Text>
            </View>
          </View>
        </View>

        {/* Product Image Section */}
        {images.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: images[currentImageIndex] }}
              style={styles.productImage}
            />
            {images.length > 1 && (
              <>
                <TouchableOpacity onPress={prevImage} style={styles.imageOverlayLeft}>
                  <AntDesign name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextImage} style={styles.imageOverlayRight}>
                  <AntDesign name="arrow-right" size={24} color="#111" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Price and Offer Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>
              {formatPrice(
                ad.petAd?.amount || 
                ad.agricultureAd?.amount || 
                (typeof ad.gadgetAd?.amount === 'string' ? parseFloat(ad.gadgetAd.amount) : ad.gadgetAd?.amount) ||
                ad.hireAd?.salaryRange ||
                ad.equipmentAd?.amount ||
                ad.jobAd?.salaryRange || 
                ad.fashionAd?.amount ||
                ad.constructionAd?.amount ||
                ad.householdAd?.amount || 
                ad.laptopAd?.amount || 
                ad.beautyAd?.amount || 
                ad.serviceAd?.amount || 
                ad.kidsAd?.amount ||
                ad.vehicleAd?.amount || 
                ad.propertyAd?.amount || 
                0
              )}
            </Text>
          </View>
         {(ad.vehicleAd?.negotiation === 'Yes' || 
            ad.propertyAd?.negotiation === 'Yes' ||
            ad.petAd?.negotiation === 'Yes' ||
            ad.gadgetAd?.negotiation === 'Yes' ||
            ad.hireAd?.negotiation === 'Yes' || 
            ad.equipmentAd?.negotiation === 'Yes' || 
            ad.fashionAd?.negotiation === 'Yes' ||
            ad.jobAd?.negotiation === 'Yes' || 
            ad.constructionAd?.negotiation === 'Yes' ||
            ad.householdAd?.negotiation === 'Yes' ||
            ad.laptopAd?.negotiation === 'Yes' ||
            ad.beautyAd?.negotiation === 'Yes' || 
            ad.serviceAd?.negotiation === 'Yes' ||
            ad.kidsAd?.negotiation === 'Yes' ||
            ad.agricultureAd?.negotiation === 'Yes') && (
           <TouchableOpacity style={styles.offerButton}>
             <Text style={styles.offerButtonText}>Make an Offer</Text>
          </TouchableOpacity>
         )}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.activeTab]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
               {ad.petAd ? 'Pet Details' :
                 ad.agricultureAd ? 'Agriculture Details' :
                 ad.gadgetAd ? 'Gadget Details' :
                 ad.hireAd ? 'Hire Details' :
                 ad.equipmentAd ? 'Equipment Details' :
                 ad.fashionAd ? 'Fashion Details' :
                 ad.jobAd ? 'Job Details' :
                 ad.constructionAd ? 'Construction Details' :
                 ad.householdAd ? 'Household Details' :
                 ad.laptopAd ? 'Laptop Details' :
                 ad.beautyAd ? 'Beauty Details' :
                 ad.serviceAd ? 'Service Details' :
                 ad.kidsAd ? 'Kids Details' :
                 ad.vehicleAd ? 'Vehicle Details' : 
                 'Property Details'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'address' && styles.activeTab]}
            onPress={() => setActiveTab('address')}
          >
            <Text style={[styles.tabText, activeTab === 'address' && styles.activeTabText]}>Store address</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Reviews (0)</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}

        {/* Spacer for bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
         onPress={async () => {
           if (seller?.phoneNumber) {
            // Format phone number properly 
            let phoneNumber = seller.phoneNumber.trim();

            // Remove any non-numeric characters except +
            phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

            // Add country code if missing 
            if (!phoneNumber.startsWith('+')) {
              phoneNumber = phoneNumber.startsWith('0')
                ? `+234${phoneNumber.substring(1)}`
                : `+234${phoneNumber}`;
            }

            const productName = ad.petAd ? 
               ad.petAd.petType :
               ad.agricultureAd ?
               ad.agricultureAd.title :
               ad.gadgetAd ? 
               ad.gadgetAd.gadgetTitle :
               ad.hireAd ?
               ad.hireAd.hireTitle :
               ad.equipmentAd ? 
               ad.equipmentAd.equipmentTitle :
               ad.fashionAd ?
               ad.fashionAd.fashionTitle :
               ad.jobAd ? 
               ad.jobAd.jobTitle :
               ad.constructionAd ? 
               ad.constructionAd.constructionTitle :
               ad.householdAd ? 
               ad.householdAd.householdTitle :
               ad.laptopAd ?
               ad.laptopAd.laptopTitle :
               ad.beautyAd ?
               ad.beautyAd.beautyTitle :
               ad.serviceAd ? 
               ad.serviceAd.serviceTitle :
               ad.kidsAd ?
               ad.kidsAd.title :
               ad.vehicleAd ? 
              `${ad.vehicleAd.vehicleType} ${ad.vehicleAd.model} ${ad.vehicleAd.year}` :
               ad.propertyAd?.propertyName || 'Product';
            const message = `Hello, I'm interested in your "${productName}" listing on Tenaly`;
            const encodedMessage = encodeURIComponent(message);

            // Try multiple WhatApp URLs
            const whatsappUrls = [
              `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`,
              `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
              `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`
            ];

            try {
            // Try WhatsApp app first 
            const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrls[0]);

            if (canOpenWhatsApp) {
              await Linking.openURL(whatsappUrls[0]);
            } else  {
              // Fallback to web version 
              await Linking.openURL(whatsappUrls[1]);
            }
            } catch (error) {
             console.error('WhatApp error:', error);
             // Fallback - open in browser 
             try {
              await Linking.openURL(whatsappUrls[2]);
             } catch (finalError) {
               showErrorToast('Unable to open WhatsApp. Please install WhatsApp or try again.', finalError);
             }
            }
           } else {
            showErrorToast('Seller contact information not available');
           }
         }}
        >
          <LinearGradient
            colors={['#00A8DF', '#1031AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              paddingVertical: 12,
              marginBottom: 8,
            }}>
            <FontAwesome name="whatsapp" size={24} color="#25D366" />
            <Text style={styles.footerButtonText}>Chat on Whatsapp</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.footerBottomRow}>
          <TouchableOpacity 
            onPress={() => handlePhoneCall(seller?.phoneNumber || '')}
           style={styles.messageButton}>
            <Feather name="phone" size={18} color={colors.darkGray} />
            <Text style={styles.messageButtonText}>
              {seller?.phoneNumber}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
          style={styles.messageButton}
           onPress={async () => {
             if (!seller || !ad) {
              showErrorToast('Seller information not available');
              return;
             }

             try {
              const productName = ad.petAd ? 
                ad.petAd.petType : 
                ad.agricultureAd ? 
                ad.agricultureAd.title : 
                ad.gadgetAd ? 
                ad.gadgetAd.gadgetTitle : 
                ad.beautyAd ? 
                ad.beautyAd.beautyTitle :
                ad.equipmentAd ?
                ad.equipmentAd.equipmentTitle :
                ad.householdAd ?
                ad.householdAd.householdTitle : 
                ad.hireAd ? 
                ad.hireAd.hireTitle :
                ad.constructionAd ? 
                ad.constructionAd.constructionTitle :
                ad.kidsAd ?
                ad.kidsAd.title : 
                ad.laptopAd ?
                ad.laptopAd.laptopTitle : 
                ad.fashionAd ?
                ad.fashionAd.fashionTitle :
                ad.serviceAd ?
                ad.serviceAd.serviceTitle :
                ad.vehicleAd ? 
                  `${ad.vehicleAd.vehicleType} ${ad.vehicleAd.model}` : 
                  ad.propertyAd?.propertyName || 'Product';
                  
               const productImage = images[0];

               const sellerId = seller.userId || ad.business?.userId;

               if (!sellerId) {
                showErrorToast('Seller ID not available');
                console.log('Missing sellerId - seller:', seller, 'business:', ad.business);
                return;
               }

               console.log('Opening message with sellerId:', sellerId);

               // Navigate to message screen with product context 
               router.push({
                pathname: '/protected/message',
                params: {
                  sellerId: sellerId,
                  productId: adId,
                  productTitle: productName,
                  productImage: productImage || '',
                  previewMessage: `Hi I'm interested in your ${productName}`
                }
               });
             } catch (error) {
              console.error('Error opening message:', error);
              showErrorToast('Unable to open messages');
             }
           }}
          >
            <Feather name="mail" size={18} color={colors.darkGray} />
            <Text style={styles.messageButtonText}>Message Seller</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.heartGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.bg,
  },
  headerDetails: {
    flexDirection: "row",
    gap: 5,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold'
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  bookIcon: {
    width: 24,
    height: 24
  },
  locationCon: {
    flexDirection: "row",
    gap: 4
  },
  locationIcon: {
    width: 9.33,
    height: 13.33,
  },
  locationText: {
    color: colors.viewGray,
    fontWeight: '400',
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular'
  },
  infoContainer: {
    padding: 16,
  },
  infoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: colors.lightGreenShade,
    fontWeight: '500'
  },
  unverifiedText: {
    color: colors.red,
    fontSize: 10,
    fontWeight: '500'
  },
  postDate: {
    fontSize: 12,
    color: colors.viewGray,
    marginTop: 8,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  viewsText: {
    fontSize: 12,
    color: colors.viewGray,
    marginLeft: 4,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlayLeft: {
    position: 'absolute',
    left: 10,
    backgroundColor: colors.bg,
    borderRadius: 50,
    padding: 8,
  },
  imageOverlayRight: {
    position: 'absolute',
    right: 10,
    backgroundColor: colors.bg,
    borderRadius: 50,
    padding: 8,
  },
  priceSection: {
    backgroundColor: colors.lightSpot,
    padding: 16,
    marginTop: 8,
  },
  deliveryWrapper: {
  marginTop: 12,
},

deliveryBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E6E9FF',     
  backgroundColor: '#F6F8FF', 
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 10,
},

iconCircle: {
  width: 34,
  height: 34,
  borderRadius: 10,
  backgroundColor: '#EEF5FF', 
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
},

deliveryBadgeTitle: {
  color: colors.blue,
  fontSize: 14,
  fontWeight: '400',
  fontFamily: 'WorkSans_400Regular'
},

deliveryBadgeDays: {
  color: colors.blue,
  fontWeight: '400',
  fontSize: 13,
  fontFamily: 'WorkSans_400Regular'
},

deliveryFeeText: {
  marginTop: 4,
  color: colors.blue,
  fontSize: 13,
  fontWeight: '400',
  fontFamily: 'WorkSans_400Regular'
},

deliveryInfo: {
  marginTop: 8,
  fontSize: 13,
  color: colors.lightGrey, 
},

deliveryInfoLabel: {
  fontWeight: '700',
  color: colors.lightGrey, 
  fontSize: 13,
   fontFamily: 'WorkSans_700Bold'
},
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular'
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold'
  },
  offerButton: {
    backgroundColor: colors.prikyBlue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  offerButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.lightSpot,
    paddingVertical: 12,
    borderWidth: 0.3,
    borderColor: colors.border,
    marginTop: 8,
  },
  tab: {
    paddingBottom: 8,
    justifyContent: "center",
    minHeight: 32,
  },
  activeTab: {
    backgroundColor: colors.shadeWhite,
    width: 107,
    justifyContent: "center"
  },
  activeTabText: {
    color: colors.blue,
    fontWeight: '500',
    fontSize: 14,
    textAlign: "center"
  },
  tabText: {
    color: colors.darkGray,
    fontSize: 14, 
    fontFamily: 'WorkSans_600SemiBold',
    fontWeight: '500',
    flexShrink: 1,
  },
  sectionContainer: {
    backgroundColor: colors.whiteShade,
    padding: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold'
  },
  seeRow: {
   flexDirection: "row",
   alignItems: 'center'
  },
  seeAllText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '500'
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
  },
  detailKey: {
    fontSize: 12,
    color: colors.lightGrey,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
    marginBottom: 10,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium'
  },
  linkButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.blueGrey,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginBottom: 8,
  gap: 8,
},
linkText: {
  color: colors.blue,
  fontSize: 14,
  fontWeight: '500',
  fontFamily: 'WorkSans_500Medium',
},
  moreInfoText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'WorkSans_400Regular',
    color: colors.lightGrey,
    marginTop: 20,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  facilityItem: {
    backgroundColor: colors.blueGrey,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  facilityText: {
    fontSize: 12,
    color: colors.blue,
    fontFamily: 'WorkSans_500Medium',
    fontWeight: '500'
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sellerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 5,
    textDecorationLine: "underline"
  },
  verifiedRow: {
    flexDirection: 'row',
    marginTop: 4,
    backgroundColor: colors.greenSuccess,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    width: 130,
    gap: 8,
    marginBottom: 4,
  },
  verifiedBadge: {
   position: 'absolute',
   top: -6,
   right: 10,
   borderRadius: 12,
   padding: 12,
  },
  sellerLocation: {
    fontSize: 14,
    color: colors.lightGrey,
    fontWeight: '400',
    marginBottom: 8,
  },
  sellerJoinDate: {
    fontSize: 12,
    color: colors.lightGrey,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular'
  },
  safetyTipsContainer: {
    backgroundColor: colors.greyBlue,
    padding: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  safetyTipsList: {
    marginTop: 10,
    color: colors.lightGrey,
    textAlign: "center"
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    textAlign: "center",
    paddingLeft: 20,
    marginBottom: 7,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lightGrey,
    marginTop: 8,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: colors.lightGrey,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: colors.lightRed,
    borderWidth: 1,
    borderColor: colors.repRed,
    height: 44,
    gap: 4,
    borderRadius: 8,
  },
  reportButtonText: {
    marginLeft: 8,
    color: colors.red,
    fontWeight: '400',
    fontSize: 12,
  },
  footer: {
    backgroundColor: colors.bg,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    minHeight: 50,
    marginTop: 5,
    shadowColor: "#140C291A",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  footerButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  footerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border
  },
  messageButtonText: {
    marginLeft: 8,
    color: colors.darkGray,
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium',
    fontWeight: '500',
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressTextContainer: {
    flex: 1,
    marginTop: 7,
    alignItems: 'flex-start',
  },
  addressTitle: {
    fontWeight: '500',
    color: colors.darkGray,
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    marginBottom: 10,
  },
  addressDetails: {
    color: colors.lightGrey,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular'
  },
  addressHoursTitle: {
    fontWeight: '500',
    color: colors.darkGray,
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium'
  },
  addressContainer: {
    flexDirection: "row",
    gap: 5
  },
  addressIcon: {
    marginTop: 5,
  },
  addressTime: {
    color: colors.darkGray,
    fontSize: 14,
    marginTop: 5,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  workingHoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    justifyContent: 'flex-start'
  },
  workingHoursDayActive: {
    backgroundColor: colors.blueGrey,
    color: colors.blue,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontFamily: 'WorkSans_500Medium',
    marginRight: 4,
    marginBottom: 4,
    marginTop: 9,
  },
  workingHoursStatusOpen: {
    color: '#22c55e',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 12,
  },
  workingHoursStatusClosed: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 12,
  },
  noHoursText: {
     color: colors.darkGray,
     fontWeight: '500'
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueGrey,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.shadeWhite
  },
  deliveryTextContainer: {
    flexDirection: 'column',
    marginLeft: 4,
  },
  deliveryText: {
    marginLeft: 4,
    color: colors.blue,
    fontSize: 12,
  },
  deliveryFee: {
    color: colors.blue,
    fontSize: 14,
    marginLeft: 4,
  },
  deliverInfoNest: {
    color: colors.lightGrey,
    fontWeight: '400'
  },
  noReviewsText: {
    color: '#6B7280',
    marginTop: 8,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    marginVertical: 16,
  },
});