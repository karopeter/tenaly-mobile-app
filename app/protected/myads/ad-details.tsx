import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  AntDesign, 
  Ionicons, 
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';
import { SellerProfile } from '@/app/types/seller-profile.types';

const { width } = Dimensions.get('window');

export default function AdDetailsScreen() {
  const router = useRouter();
  const { adId, adType, carAdId } = useLocalSearchParams();
  
  const [ad, setAd] = useState<any>(null);
  const [carAd, setCarAd] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'review'>('details');
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchAdDetails();
    fetchBusiness();
  }, [adId, adType]);

  const fetchBusiness = async () => {
    try {
     if (!apiClient) {
      showErrorToast('API client is not initialized');
      return;
     }

      const response = await apiClient.get('/api/business/my-businesses');
      if (response.data && response.data.length > 0) {
        setBusiness(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    }
  };



  const fetchAdDetails = async () => {
    if (!apiClient) {
      showErrorToast('API client not initialized');
      return;
    }

    setLoading(true);
    try {
      if (carAdId && carAdId !== "null") {
        const carResponse = await apiClient.get(`/api/carAdd/get-car-byId/${carAdId}`);
        setCarAd(carResponse.data.ad || carResponse.data);
      }

      // Fetch specific ad based on type
      let endpoint = '';
      if (adType === 'vehicle') {
        endpoint = `/api/vehicles/get-vehicle/${adId}`;
      } else if (adType === 'property') {
        endpoint = `/api/property/get-commercial-rent/${adId}`;
      } else if (adType === 'agriculture') {
        endpoint = `/api/agriculture/get-agriculture/${adId}`;
      } else if (adType === 'equipment') {
        endpoint = `/api/equipments/get-equipment/${adId}`;
      } else if (adType === 'gadget') {
        endpoint = `/api/gadget/get-gadget/${adId}`;
      } else if (adType === 'laptop') {
        endpoint = `/api/laptops/get-laptop/${adId}`;
      } else if (adType === 'fashion') {
        endpoint = `/api/fashion/get-fashion/${adId}`;
      } else if (adType === 'household') {
        endpoint = `/api/household/get-household/${adId}`;
      } else if (adType === 'construction') {
        endpoint = `/api/construction/get-construction/${adId}`;
      } else if (adType === 'pet') {
        endpoint = `/api/pets/get-pet/${adId}`;
      } else if (adType === 'kid') {
        endpoint = `/api/kids/get-kid/${adId}`;
      } else if (adType === 'job') {
        endpoint = `/api/jobs/get-job/${adId}`;
      } else if (adType === 'hire') {
        endpoint = `/api/hire/get-hire/${adId}`;
      } else if (adType === 'beauty') {
        endpoint = `/api/beauty/get-beauty/${adId}`;
      }
 
      if (endpoint) {
        const response = await apiClient.get(endpoint);
        const adData = response.data.data || response.data;
        setAd(adData);

        if (adData?.userId) {
          await fetchSellerData(adData.userId);
        }
      }
    } catch (error: any) {
      console.error('Error fetching ad details:', error);
      console.error('Error details:', error.response?.data);
      showErrorToast(error.response?.data?.message || 'Failed to load ad details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerData = async (sellerId: string) => {
    try {
     if (!apiClient) {
        showErrorToast('API client not initialized.');
        return;
     }
     const response = await apiClient.get(`/api/profile/seller/${sellerId}`);

     const sellerData = response.data?.data || response.data;
     setSeller(sellerData);
    } catch (error: any) {
       console.error("Error fetching seller data:", error);
    }
  }

  const getImages = () => {
    if (!carAd) return [];
    
    if (adType === 'vehicle') return carAd.vehicleImage || [];
    if (adType === 'property') return carAd.propertyImage || [];
    if (adType === 'agriculture') return carAd.agricultureImage || [];
    if (adType === 'equipment') return carAd.equipmentImage || [];
    if (adType === 'gadget') return carAd.gadgetImage || [];
    if (adType === 'laptop') return carAd.laptopImage || [];
    if (adType === 'fashion') return carAd.fashionImage || [];
    if (adType === 'household') return carAd.householdImage || [];
    if (adType === 'construction') return carAd.constructionImage || [];
    if (adType === 'pet') return carAd.petsImage || [];
    if (adType === 'kid') return carAd.kidsImage|| [];
    if (adType === 'job') return carAd.jobImage || [];
    if (adType === 'hire') return carAd.hireImage || [];
    if (adType === 'beauty') return carAd.beautyImage || [];
    
    return [];
  };

  const images = getImages();

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleOpenLink = async (url: string) => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      showErrorToast('Cannot open this link');
    }
  } catch (error) {
    showErrorToast('Error opening link');
  }
};

  const renderDetailsContent = () => {
    if (adType === 'vehicle') {
      return renderVehicleDetails();
    } else if (adType === 'property') {
      return renderPropertyDetails();
    } else if (adType === 'agriculture') {
      return renderAgricultureDetails();
    } else if (adType === 'equipment') {
       return renderEquipmentDetails();
    } else if (adType === 'gadget') {
        return renderGadgetDetails();
    } else if (adType === 'laptop') {
        return renderLaptopDetails();
    } else if (adType === 'fashion') {
        return renderFashionDetails();
    } else if (adType === 'household') {
        return renderHouseholdDetails();
    } else if (adType === 'construction') {    
        return renderConstructionDetails();
    } else if (adType === 'pet') {
        return renderPetDetails();
    } else if (adType === 'kid') {
        return renderKidDetails();
    } else if (adType === 'job') {
        return renderJobDetails();
    } else if (adType === 'hire') {
        return renderHireDetails();
    } else if (adType === 'beauty') {
        return renderBeautyDetails();
    }
  }

  const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});
  };

  const handleShare = async (platform: string) => {
    const adTitle = adType === 'agriculture' ? ad.title :
      adType === 'vehicle' ? `${ad.vehicleType} ${ad?.model}` : 
      adType === 'property' ? ad?.propertyName : 
      adType === 'equipment' ? ad?.equipmentTitle :
      adType === 'gadget' ? ad?.gadgetTitle : 
      adType === 'laptop' ? ad?.laptopTitle :
      adType === 'fashion' ? ad?.fashionTitle :
      adType === 'household' ? ad?.householdTitle : 
      adType === 'construction' ? ad?.constructionTitle : 
      adType === 'pet' ? ad?.petType : 
      adType === 'kid' ? ad?.title :
      adType === 'job' ? ad?.jobTitle :
      adType === 'hire' ? ad?.hireTitle : 
      adType === 'beauty' ? ad?.beautyTitle :

      'Product';
    
    const adPrice = `₦${(ad?.amount || ad?.salaryRange || 0)?.toLocaleString()}`;
    const adLocation = ad?.propertyAddress || ad?.location || carAd?.location || 'N/A';

    const shareUrl = `https://tenaly.vercel.app/ad/${adId}`;
    const shareText = `Check out this ${adTitle} for ${adPrice} in ${adLocation}!`;

    let url = '';

    switch (platform) {
        case 'whatsapp': 
          url = `whatsapp://send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
          break
        case 'facebook': 
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        case 'twitter': 
         url = `https://twitter.com/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
         break;
        case 'instagram': 
         showErrorToast('Please screenshot and share on Instragram');
         return;
        case 'linkedin':
         url = `https://www.linkedin.com/sharin/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
         break;
        case 'tiktok': 
          showErrorToast('Pleas use TikTok to share');
          return;
    }

    try {
     const canOpen = await Linking.canOpenURL(url);
     if (canOpen) {
        await Linking.openURL(url);
     } else {
        showErrorToast(`Cannot open ${platform}`);
     }
    } catch (error) {
      showErrorToast(`Error sharing to ${platform}`);
    }
  };



  const renderVehicleDetails = () => (
    <View style={styles.detailsCard}>
    <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle}>Vehicle Details</Text>
       <TouchableOpacity 
        onPress={() => setShowMoreInfo(!showMoreInfo)} 
         style={styles.showMoreButtonInline}>
        <Text style={styles.showMoreText}>
          {showMoreInfo ? 'Show Less' : 'Show More'}
        </Text>
         <Ionicons
         name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
         size={16}
         color={colors.blue}
        />
      </TouchableOpacity>
      </View>
      
      {showMoreInfo && (
        <>
        <View style={styles.gridContainer}>
         <View style={styles.gridItem}>
           <Text style={styles.detailLabel}>Model</Text>
           <Text style={styles.detailValue}>{ad?.model || 'N/A'}</Text>
         </View>
         <View style={styles.gridItem}>
          <Text style={styles.detailLabel}>Year</Text>
          <Text style={styles.detailValue}>{ad?.year || 'N/A'}</Text>
         </View>
        </View>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Body Type</Text>
              <Text style={styles.detailValue}>{ad?.carBody || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Car Type</Text>
             <Text style={styles.detailValue}>{ad?.carType || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Trim</Text>
              <Text style={styles.detailValue}>{ad?.trim || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
               <Text style={styles.detailLabel}>Interior Color</Text>
               <Text style={styles.detailValue}>{ad?.interiorColor || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.gridContainer}>
           <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Transmission</Text>
             <Text style={styles.detailValue}>{ad?.transmission || 'N/A'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Fuel Type</Text>
            <Text style={styles.detailValue}>{ad?.fuel || 'N/A'}</Text>
          </View>
          </View>
         <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.detailLabel}>Vin Chassis Number</Text>
          <Text style={styles.detailValue}>{ad?.vinChassisNumber || 'N/A'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.detailLabel}>Color</Text>
          <Text style={styles.detailValue}>{ad?.color || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.gridContainer}>
         <View style={styles.gridItem}>
          <Text style={styles.detailLabel}>Car Registered</Text>
         <Text style={styles.detailValue}>{ad?.carRegistered || 'N/A'}</Text>
         </View>
         <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Exchange Possible</Text>
            <Text style={styles.detailValue}>{ad?.exchangePossible || 'N/A'}</Text>
         </View>
      </View>
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Car Key Features</Text>
            <Text style={styles.detailValue}>{ad?.carKeyFeatures || 'N/A'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.detailLabel}>Seat Type</Text>
          <Text style={styles.detailValue}>{ad?.seat || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.detailLabel}>Drive Train</Text>
          <Text style={styles.detailValue}>{ad?.driveTrain || 'N/A'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.detailLabel}>Engine Size</Text>
          <Text style={styles.detailValue}>{ad?.engineSizes || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.detailLabel}>Horse Power</Text>
          <Text style={styles.detailValue}>{ad?.horsePower || 'N/A'}</Text>
        </View>
        <View style={styles.gridItem}>
           <Text style={styles.detailLabel}>Negotiation</Text>
           <Text style={styles.detailValue}>{ad?.negotiation || 'N/A'}</Text>
        </View>
      </View>
        </>
      )}
    </View>
  );

  const renderPropertyDetails = () => (
    <View style={styles.detailsCard}>
    <View style={styles.cardTitleRow}>
         <Text style={styles.cardTitle}>Property Details</Text>
         <TouchableOpacity 
          onPress={() => setShowMoreInfo(!showMoreInfo)} 
          style={styles.showMoreButtonInline}>
        <Text style={styles.showMoreText}>
          {showMoreInfo ? 'Show Less' : 'Show More'}
        </Text>
        <Ionicons
         name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
         size={16}
         color={colors.blue}
        />
      </TouchableOpacity>
    </View>
      
      
      {showMoreInfo && (
        <>
        <View style={styles.gridContainer}>
         {ad?.propertyType && (
          <View style={styles.gridItem}>
           <Text style={styles.detailLabel}>Property Type</Text>
           <Text style={styles.detailValue}>{ad.propertyType}</Text>
          </View>
          )}
          {ad?.propertyCondition && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Property Condition</Text>
              <Text style={styles.detailValue}>{ad.propertyCondition}</Text>
            </View>
          )}
        </View>
          <View style={styles.gridContainer}>
            {ad?.parking && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Parking</Text>
                <Text style={styles.detailValue}>{ad?.parking}</Text>
              </View>
            )}
            {ad?.squareMeter && (
              <View style={styles.gridItem}> 
               <Text style={styles.detailLabel}>Square Meter</Text>
               <Text style={styles.detailValue}>{ad?.squareMeter}</Text>
              </View>
            )}
          </View>
          <View style={styles.gridContainer}>
            {ad?.ownershipStatus && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Ownership Status</Text>
                <Text style={styles.detailValue}>{ad?.ownershipStatus}</Text>
              </View>
            )}
            {ad?.serviceCharge && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Service Charge</Text>
                <Text style={styles.detailValue}>{ad?.serviceCharge}</Text>
             </View>
            )}
          </View>

          <View style={styles.gridContainer}>
            {ad?.numberOfBedrooms && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Number of Bedrooms</Text>
                <Text style={styles.detailValue}>{ad?.numberOfBedrooms}</Text>
              </View>
            )}
            {ad?.numberOfBathrooms && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Number of Bathrooms</Text>
                <Text style={styles.detailValue}>{ad?.numberOfBathrooms}</Text>
              </View>
            )}
          </View>
          <View style={styles.gridContainer}>
            {ad?.numberOfToilet && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Number of Toilet</Text>
                <Text style={styles.detailValue}>{ad?.numberOfToilet}</Text>
              </View>
            )}
            {ad?.titleDocuments && (
             <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Title Documents</Text>
                <Text style={styles.detailValue}>{ad?.titleDocuments}</Text>
             </View>
            )}
          </View>
          <View style={styles.gridContainer}>
             {ad?.maximumAllowedGuest && (
               <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Maximum Allowed Guest</Text>
                <Text style={styles.detailValue}>{ad?.maximumAllowedGuest}</Text>
               </View>
             )}
             {ad?.isSmokingAllowed && (
                <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Smoking Allowed</Text>
                    <Text style={styles.detailValue}>{ad?.isSmokingAllowed}</Text>
                </View>
             )}
          </View>
          <View style={styles.gridContainer}>
             {ad?.petsAllowed && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Pet Allowed</Text>
                <Text style={styles.detailValue}>{ad?.petsAllowed}</Text>
              </View>
             )}
             {ad?.developmentFee && (
              <View style={styles.gridItem}>
                 <Text style={styles.detailLabel}>Development Fee</Text>
                 <Text style={styles.detailValue}>{ad?.developmentFee}</Text>
              </View>
             )}
          </View>
          <View style={styles.gridContainer}>
            {ad?.surveyFee && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Survey Fee</Text>
                <Text style={styles.detailValue}>{ad?.surveyFee}</Text>
              </View>
            )}
            {ad?.legalFee && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Legal Fee</Text>
                <Text style={styles.detailValue}>{ad?.legalFee}</Text>
              </View>
            )}
          </View>
          <View style={styles.gridContainer}>
            {ad?.pricingUnits && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Pricing Units</Text>
                <Text style={styles.detailValue}>{ad?.pricingUnits}</Text>
              </View>
            )}

            {ad?.serviceFee && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Service Fee</Text>
                <Text style={styles.detailValue}>{ad?.serviceFee}</Text>
               </View>
            )}
          </View>
          <View style={styles.gridContainer}>
            {ad?.propertyDuration && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Property Duration</Text>
                <Text style={styles.detailValue}>{ad?.propertyDuration}</Text>
               </View>
            )}
            {ad?.guestNumber && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Guest Number</Text>
                <Text style={styles.detailValue}>{ad?.guestNumber}</Text>
              </View>
            )}
          </View>
           <View style={styles.gridContainer}>
            {ad?.furnishing && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Furnishing</Text>
                <Text style={styles.detailValue}>{ad?.furnishing}</Text>
              </View>
            )}
            {ad?.negotiation && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Negotiation</Text>
                <Text style={styles.detailValue}>{ad?.negotiation}</Text>
              </View>
            )}
          </View>
          <View style={styles.gridContainer}>
            {ad?.propertyFacilities && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Property Facilities</Text>
                <Text style={styles.detailValue}>{ad.propertyFacilities}</Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );

  const renderAgricultureDetails = () => (
    <View style={styles.detailsCard}>
     <View style={styles.cardTitleRow}> 
      <Text style={styles.cardTitle}>Agriculture Details</Text>
      <TouchableOpacity 
       onPress={() => setShowMoreInfo(!showMoreInfo)} 
       style={styles.showMoreButtonInline}>
        <Text style={styles.showMoreText}>
          {showMoreInfo ? 'Show Less' : 'Show More'}
        </Text>
        <Ionicons
         name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
         size={16}
         color={colors.blue}
        />
        </TouchableOpacity>
    </View>
      
      {showMoreInfo && (
        <>
          <View style={styles.gridContainer}>
          {ad?.agricultureType && ad.agricultureType.length > 0 && ad.agricultureType[0] && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{ad.agricultureType[0]}</Text>
            </View>
          )}
          {ad?.unit && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Unit</Text>
              <Text style={styles.detailValue}>{ad.unit}</Text>
            </View>
          )}
        </View>
         <View style={styles.gridContainer}>
          {(ad?.serviceMode && ad.serviceMode.length > 0 && ad.serviceMode[0]) && (
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Service Mode</Text>
              <Text style={styles.detailValue}>{ad.serviceMode.join(', ')}</Text>
            </View>
          </View>
        )}
           {ad?.unit && (
             <View style={styles.gridItem}>
               <Text style={styles.detailLabel}>Unit</Text>
               <Text style={styles.detailValue}>{ad?.unit}</Text>
             </View>
           )}
         </View>

          {(ad?.condition || ad?.brand) && (
          <View style={styles.gridContainer}>
            {ad?.condition && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Condition</Text>
                <Text style={styles.detailValue}>{ad.condition}</Text>
              </View>
            )}
            {ad?.brand && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Brand</Text>
                <Text style={styles.detailValue}>{ad.brand}</Text>
              </View>
            )}
          </View>
        )}
         {(ad?.availability || ad?.formulationType) && (
          <View style={styles.gridContainer}>
            {ad?.availability && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Availability</Text>
                <Text style={styles.detailValue}>{ad.availability}</Text>
              </View>
            )}
            {ad?.formulationType && ad.formulationType.length > 0 && ad.formulationType[0] && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Formulation Type</Text>
                <Text style={styles.detailValue}>{ad.formulationType.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

           {(ad?.feedType && ad.feedType.length > 0 && ad.feedType[0]) && (
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Feed Type</Text>
              <Text style={styles.detailValue}>{ad.feedType.join(', ')}</Text>
            </View>
          </View>
        )}
           {(ad?.negotiation || ad?.experienceLevel) && (
          <View style={styles.gridContainer}>
            {ad?.negotiation && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Negotiation</Text>
                <Text style={styles.detailValue}>{ad.negotiation}</Text>
              </View>
            )}
            {ad?.experienceLevel && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Experience Level</Text>
                <Text style={styles.detailValue}>{ad.experienceLevel}</Text>
              </View>
            )}
          </View>
        )}
         <View style={styles.gridContainer}>
            {ad?.bulkPrice && ad.bulkPrice.length > 0 && (
              <View style={styles.bulkPriceSection}>
                <Text style={styles.bulkPriceTitle}>Bulk Prices </Text>
                {ad.bulkPrice.map((bulk: any, index: number) => (
                 <View key={bulk._id || index} style={styles.bulkPriceRow}>
                    <Text style={styles.bulkPriceQuantity}>
                        {bulk.quantity} {bulk.unit}
                    </Text>
                    <Text style={styles.bulkPriceAmount}>
                        ₦{bulk.amountPerUnit.toLocaleString()}
                    </Text>
                  </View>
                ))}
             </View>
            )}
         </View>
        </>
      )}
    </View>
  );


  const renderEquipmentDetails = () => (
    <View style={styles.detailsCard}>
     <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle}>Equipment Details</Text>
      <TouchableOpacity
        onPress={() => setShowMoreInfo(!showMoreInfo)}
        style={styles.showMoreButtonInline}
      >
        <Text style={styles.showMoreText}>
         {showMoreInfo ? 'Show Less' : 'Show More'}
        </Text>
        <Ionicons
          name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.blue}
        />
      </TouchableOpacity>
     </View>

     {showMoreInfo && (
       <>
        <View style={styles.gridContainer}>
        {ad?.equipmentType && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{ad?.equipmentType}</Text>
          </View>
        )}
        {ad?.yearOfManufacture && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Year of manufacture</Text>
            <Text style={styles.detailValue}>{ad?.yearOfManufacture}</Text>
          </View>
        )}
      </View>
        <View style={styles.gridContainer}>
          {ad?.condition && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Condition</Text>
                <Text style={styles.detailValue}>{ad.condition}</Text>
            </View>
          )}
          {ad?.powerSource && (
           <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Power Source</Text>
             <Text style={styles.detailValue}>{ad.powerSource}</Text>
           </View>
          )}
        </View>
        <View style={styles.gridContainer}>
          {ad?.brand && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Brand</Text>
              <Text style={styles.detailValue}>{ad.brand}</Text>
             </View>
          )}
          {ad?.usageType && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Usage Type</Text>
              <Text style={styles.detailValue}>{ad.usageType}</Text>
            </View>
          )}
        </View>
        <View style={styles.gridContainer}>
        {ad?.fuelType && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Fuel Type</Text>
            <Text style={styles.detailValue}>{ad.fuelType}</Text>
          </View>
        )}
        {ad?.negotiation && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Negotiation</Text>
            <Text style={styles.detailValue}>{ad.negotiation}</Text>
          </View>
        )}
        </View>
       </>
     )}
    </View>
  );

  const renderGadgetDetails = () => (
    <View style={styles.detailsCard}>
     <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>Gadget Details</Text>
        <TouchableOpacity
          onPress={() => setShowMoreInfo(!showMoreInfo)}
          style={styles.showMoreButtonInline}>
        <Text style={styles.showMoreText}>
            {showMoreInfo ? 'Show Less' : 'Show More'}
        </Text>
        <Ionicons
          name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.blue}
        />
        </TouchableOpacity>
     </View>

     {showMoreInfo && (
      <>
       <View style={styles.gridContainer}>
           {ad?.condition && (
           <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>{ad?.condition}</Text>
           </View>
           )}

           {ad?.gadgetBrand && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Brand</Text>
              <Text style={styles.detailValue}>{ad?.gadgetBrand}</Text>
            </View>
           )}
       </View>
       <View style={styles.gridContainer}>
          {ad?.storageCapacity && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Storage Capacity</Text>
                <Text style={styles.detailValue}>{ad?.storageCapacity}</Text>
            </View>
          )}
          {ad?.ram && (
           <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Ram</Text>
             <Text style={styles.detailValue}>{ad?.ram}</Text>
          </View>
          )}
       </View>
        <View style={styles.gridContainer}>
          {ad?.gadgetColor && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>{ad?.gadgetColor}</Text>
            </View>
          )}
          {ad?.accessories && (
            <View style={styles.gridItem}>
               <Text style={styles.detailLabel}>Accessories</Text>
               <Text style={styles.detailValue}>{ad?.accessories}</Text>
            </View>
          )}
       </View>
       <View style={styles.gridContainer}>
         {ad?.warranty && (
           <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Warranty</Text>
             <Text style={styles.detailValue}>{ad?.warranty}</Text>
           </View>
         )}
         {ad?.connectivityType && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Connectivity Type</Text>
                <Text style={styles.detailValue}>{ad?.connectivityType}</Text>
            </View>
         )}
       </View>
       <View style={styles.gridContainer}>
          {ad?.operatingSystem && (
           <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Operating System</Text>
            <Text style={styles.detailValue}>{ad?.operatingSystem}</Text>
           </View>
          )}
          {ad?.simType && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Sim Type</Text>
              <Text style={styles.detailValue}>{ad?.simType}</Text>
            </View>
          )}
       </View>
       <View style={styles.gridContainer}>
          {ad?.network && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Network</Text>
              <Text style={styles.detailValue}>{ad?.network}</Text>
            </View>
          )}
          {ad?.batteryHealth && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Battery Health</Text>
                <Text style={styles.detailValue}>{ad?.batteryHealth}</Text>
            </View>
          )}
       </View>
       <View style={styles.gridContainer}>
         {ad?.negotiation && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Negotiation</Text>
                <Text style={styles.detailValue}>{ad?.negotiation}</Text>
             </View>
         )}
       </View>
      </>
     )}
    </View>
  );

  const renderLaptopDetails = () => (
    <View style={styles.detailsCard}>
      <View style={styles.cardTitleRow}>
       <Text style={styles.cardTitle}>Laptop Details</Text>
       <TouchableOpacity
         onPress={() => setShowMoreInfo(!showMoreInfo)}
         style={styles.showMoreButtonInline}
       >
          <Text style={styles.showMoreText}>
             {showMoreInfo ? 'Show Less' : 'Show More'}
          </Text>
          <Ionicons
             name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
             size={16}
             color={colors.blue}
          />
       </TouchableOpacity>
      </View>

      {showMoreInfo && (
          <>
            <View style={styles.gridContainer}>
             {ad?.condition && (
               <View style={styles.gridItem}>
                  <Text style={styles.detailLabel}>Condition</Text>
                  <Text style={styles.detailValue}>{ad?.condition}</Text>
                </View>
             )}
             {ad?.laptopType && (
                <View style={styles.gridItem}>
                   <Text style={styles.detailLabel}>Type</Text>
                   <Text style={styles.detailValue}>{ad?.laptopType}</Text>
                </View>
             )}
            </View>
            <View style={styles.gridContainer}>
             {ad?.laptopBrand && (
                <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Brand</Text>
                    <Text>{ad?.laptopBrand}</Text>
                </View>
             )}
             {ad?.laptopWarranty && (
                <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Warranty</Text>
                    <Text style={styles.detailValue}>{ad?.laptopWarranty}</Text>
                </View>
             )}
            </View>
            <View style={styles.gridContainer}>
               {ad?.capacity && (
                <View style={styles.gridItem}>
                  <Text style={styles.detailLabel}>Capacity</Text>
                  <Text style={styles.detailValue}>{ad?.capacity}</Text>
                </View>
               )}
               {ad?.laptopStorage && (
                <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Storage</Text>
                    <Text style={styles.detailValue}>{ad?.laptopStorage}</Text>
                </View>
               )}
            </View>
              <View style={styles.gridContainer}>
                {ad?.speedRating && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Speed Rating</Text>
                    <Text style={styles.detailValue}>{ad?.speedRating}</Text>
                 </View>
                )}
                {ad?.negotiation && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Negotiation</Text>
                    <Text style={styles.detailValue}>{ad?.negotiation}</Text>
                  </View>
                )}
            </View>
            <View style={styles.gridContainer}>
                {ad?.laptopOperating && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Operating System</Text>
                    <Text style={styles.detailValue}>{ad?.laptopOperating}</Text>
                 </View>
                )}
                {ad?.laptopRam && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Ram</Text>
                    <Text style={styles.detailValue}>{ad?.laptopRam}</Text>
                  </View>
                )}
            </View>
            <View style={styles.gridContainer}>
                {ad?.laptopProcessor && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Processor</Text>
                    <Text style={styles.detailValue}>{ad?.laptopProcessor}</Text>
                 </View>
                )}
                {ad?.laptopScreenSize && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Screen Size</Text>
                    <Text style={styles.detailValue}>{ad?.laptopScreenSize}</Text>
                  </View>
                )}
            </View>
             <View style={styles.gridContainer}>
                {ad?.laptopColor && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Color</Text>
                    <Text style={styles.detailValue}>{ad?.laptopColor}</Text>
                 </View>
                )}
                {ad?.laptopAccessories && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Accessories</Text>
                    <Text style={styles.detailValue}>{ad?.laptopAccessories}</Text>
                  </View>
                )}
            </View>
             <View style={styles.gridContainer}>
                {ad?.resolution && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Resolution</Text>
                    <Text style={styles.detailValue}>{ad?.resolution}</Text>
                 </View>
                )}
                {ad?.refreshRate && (
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Refresh Rate</Text>
                    <Text style={styles.detailValue}>{ad?.refreshRate}</Text>
                  </View>
                )}
            </View>
            <View style={styles.gridContainer}>
              {ad?.laptopConnectivityType && ad.laptopConnectivityType.length > 0 && (
                <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Connectivity Type</Text>
                    <Text>
                        {ad.laptopConnectivityType.join(', ')}
                    </Text>
                </View>
              )}
            </View>
          </>
      )}
    </View>
  );

  const renderFashionDetails = () => (
    <View style={styles.detailsCard}>
      <View style={styles.cardTitleRow}>
       <Text style={styles.cardTitle}>Fashion Details</Text>
       <TouchableOpacity
         onPress={() => setShowMoreInfo(!showMoreInfo)}
         style={styles.showMoreButtonInline}
       >
         <Text style={styles.showMoreText}>
            {showMoreInfo ? 'Show Less' : 'Show More'}
         </Text>
         <Ionicons
           name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
           size={16}
           color={colors.blue}
         />
       </TouchableOpacity>
      </View>

      {showMoreInfo && (
       <>
        <View style={styles.gridContainer}>
         {ad?.fashionType && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{ad?.fashionType}</Text>
         </View>
         )}
         {ad?.condition && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Condition</Text>
            <Text style={styles.detailValue}>{ad?.condition}</Text>
          </View>
         )}
        </View>
        <View style={styles.gridContainer}>
          {ad?.fashionBrand && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Brand</Text>
                <Text style={styles.detailValue}>{ad?.fashionBrand}</Text>
             </View>
          )}
          {ad?.gender && (
           <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Gender</Text>
            <Text style={styles.detailValue}>{ad?.gender}</Text>
           </View>
          )}
        </View>
        <View style={styles.gridContainer}>
          {ad?.size && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Size</Text>
                <Text style={styles.detailValue}>{ad?.size}</Text>
            </View>
          )}
          {ad?.fashionMaterial && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Material</Text>
                <Text style={styles.detailValue}>{ad?.fashionMaterial}</Text>
             </View>
          )}
        </View>
        <View style={styles.gridContainer}>
          {ad?.fashionColor && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>{ad?.fashionColor}</Text>
            </View>
          )}
          {ad?.frameMaterial && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Frame Material</Text>
                <Text style={styles.detailValue}>{ad?.frameMaterial}</Text>
             </View>
          )}
        </View>
        <View style={styles.gridContainer}>
          {ad?.lensType && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Lens Type</Text>
                <Text style={styles.detailValue}>{ad?.lensType}</Text>
            </View>
          )}
          {ad?.frameShape && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Frame Shape</Text>
                <Text style={styles.detailValue}>{ad?.frameShape}</Text>
            </View>
          )}
        </View>
        <View style={styles.gridContainer}>
           {ad?.fashionAccessories && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Accessories</Text>
                <Text style={styles.detailValue}>{ad?.fashionAccessories}</Text>
             </View>
           )}
           {ad?.negotiation && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Negotiation</Text>
                <Text style={styles.detailValue}>{ad?.negotiation}</Text>
            </View>
           )}
        </View>
       </>
      )}
    </View>
  );

  const renderHouseholdDetails = () => (
      <View style={styles.detailsCard}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Household Details</Text>
          <TouchableOpacity
            onPress={() => setShowMoreInfo(!showMoreInfo)}
            style={styles.showMoreButtonInline}
          >
           <Text style={styles.showMoreText}>
            {showMoreInfo ? 'Show Less' : 'Show More'}
           </Text>
           <Ionicons
             name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
             size={16}
             color={colors.blue}
           />
          </TouchableOpacity>
        </View>

        {showMoreInfo && (
          <>
           <View style={styles.gridContainer}>
             {ad?.householdType && (
               <View style={styles.gridItem}>
                 <Text style={styles.detailLabel}>Type</Text>
                 <Text style={styles.detailValue}>{ad?.householdType}</Text>
               </View>
             )}
             {ad?.condition && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Condition</Text>
                <Text style={styles.detailValue}>{ad?.condition}</Text>
               </View>
             )}
           </View>
           <View style={styles.gridContainer}>
             {ad?.householdBrand && (
               <View style={styles.gridItem}>
                 <Text style={styles.detailLabel}>Brand</Text>
                 <Text style={styles.detailValue}>{ad?.householdBrand}</Text>
               </View>
             )}
             {ad?.size && (
               <View style={styles.gridItem}>
                 <Text style={styles.detailLabel}>Size</Text>
                 <Text style={styles.detailValue}>{ad?.size}</Text>
               </View>
             )}
           </View>
           <View style={styles.gridContainer}>
             {ad?.householdPowersource && (
               <View style={styles.gridItem}>
                 <Text style={styles.detailLabel}>Power Source</Text>
                 <Text style={styles.detailValue}>{ad?.householdPowersource}</Text>
                </View>
             )}
             {ad?.householdMaterial && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Material</Text>
                <Text style={styles.detailValue}>{ad?.householdMaterial}</Text>
               </View>
             )}
             {ad?.negotiation && (
                <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Negotiation</Text>
                    <Text style={styles.detailValue}>{ad?.negotiation}</Text>
                </View>
             )}
           </View>
           <View style={styles.gridContainer}>
             {ad?.roomType && (
               <View style={styles.gridItem}>
                 <Text style={styles.detailLabel}>Room Type</Text>
                 <Text style={styles.detailValue}>{ad?.roomType}</Text>
               </View>
             )}
             {ad?.householdStyle && (
                <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>Style</Text>
                    <Text style={styles.detailValue}>{ad?.householdStyle}</Text>
                </View>
             )}
             {ad?.householdColor && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>{ad?.householdColor}</Text>
              </View>
             )}
           </View>
           <View style={styles.gridContainer}>
            {ad?.powerType && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Power Type</Text>
                <Text style={styles.detailValue}>{ad?.powerType}</Text>
              </View>
            )}
            {ad?.colorTemperature && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Color Temperature</Text>
                <Text style={styles.detailValue}>{ad?.colorTemperature}</Text>
              </View>
            )}
           </View>
          </>
        )}
      </View>
  );

  const renderConstructionDetails = () => (
    <View style={styles.detailsCard}>
     <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>Construction Details</Text>
        <TouchableOpacity
          onPress={() => setShowMoreInfo(!showMoreInfo)}
          style={styles.showMoreButtonInline}
        >
          <Text style={styles.showMoreText}>
            {showMoreInfo ? 'Show Less' : 'Show More'}
          </Text>
          <Ionicons
            name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.blue}
          />
        </TouchableOpacity>
     </View>

     {showMoreInfo && (
        <>
         <View style={styles.gridContainer}>
            {ad?.constructionType && (
              <View style={styles.gridItem}>
                 <Text style={styles.detailLabel}>Type</Text>
                 <Text style={styles.detailValue}>{ad?.constructionType}</Text>
              </View>
            )}
            {ad?.constructionMaterial && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Material</Text>
                <Text style={styles.detailValue}>{ad?.constructionMaterial}</Text>
              </View>
            )}
            {ad?.constructionUnit && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Unit</Text>
                <Text style={styles.detailValue}>{ad?.constructionUnit}</Text>
              </View>
            )}
         </View>
         <View style={styles.gridContainer}>
         {ad?.constructionBrand && (
           <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Brand</Text>
             <Text style={styles.detailValue}>{ad?.constructionBrand}</Text>
           </View>
         )}
         {ad?.condition && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Condition</Text>
                <Text style={styles.detailValue}>{ad?.condition}</Text>
            </View>
         )}
         {ad?.warranty && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Warranty</Text>
            <Text style={styles.detailValue}>{ad?.warranty}</Text>
          </View>
         )}
         {ad?.powerRating && (
           <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Power Rating</Text>
            <Text style={styles.detailValue}>{ad?.powerRating}</Text>
           </View>
         )}
         </View>
         <View style={styles.gridContainer}>
          {ad?.yearOfManufacture && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Year of Manufacture</Text>
                <Text style={styles.detailValue}>{ad?.yearOfManufacture}</Text>
             </View>
          )}
          {ad?.fuelType && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Fuel Type</Text>
                <Text style={styles.detailValue}>{ad?.fuelType}</Text>
            </View>
          )}
          {ad?.finish && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Finish</Text>
                <Text style={styles.detailValue}>{ad?.finish}</Text>
            </View>
          )}
         </View>
         <View style={styles.gridContainer}>
             {ad?.constructionColor && (
              <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>{ad?.constructionColor}</Text>
             </View>
             )}
             {ad?.size && (
              <View style={styles.gridItem}>
                 <Text style={styles.detailLabel}>Size</Text>
                 <Text style={styles.detailValue}>{ad?.size}</Text>
               </View>
             )}
             {ad?.experienceLevel && (
               <View style={styles.gridItem}>
                 <Text style={styles.detailLabel}>Experience Level</Text>
                 <Text style={styles.detailValue}>{ad?.experienceLevel}</Text>
              </View>
             )}
         </View>
         <View style={styles.gridContainer}>
           {ad?.constructionAvailability && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Availability</Text>
                <Text style={styles.detailValue}>{ad?.constructionAvailability}</Text>
            </View>
           )}
            {ad?.bulkPrice && ad.bulkPrice.length > 0 && (
              <View style={styles.bulkPriceSection}>
                <Text style={styles.bulkPriceTitle}>Bulk Prices </Text>
                {ad.bulkPrice.map((bulk: any, index: number) => (
                 <View key={bulk._id || index} style={styles.bulkPriceRow}>
                    <Text style={styles.bulkPriceQuantity}>
                        {bulk.quantity} {bulk.unit}
                    </Text>
                    <Text style={styles.bulkPriceAmount}>
                        ₦{bulk.amountPerUnit.toLocaleString()}
                    </Text>
                  </View>
                ))}
             </View>
            )}
         </View>
         <View style={styles.gridContainer}>
           {ad?.negotiation && (
           <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Negotiation</Text>
             <Text style={styles.detailValue}>{ad?.negotiation}</Text>
            </View>
         )}
         </View>
        </>
     )}
    </View>
  );

  const renderPetDetails = () => (
  <View style={styles.detailsCard}>
    <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle}>Pet Details</Text>
      <TouchableOpacity
        onPress={() => setShowMoreInfo(!showMoreInfo)}
        style={styles.showMoreButtonInline}
      >
        <Text style={styles.showMoreText}>
          {showMoreInfo ? 'Show Less' : 'Show More'}
        </Text>
        <Ionicons
          name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.blue}
        />
      </TouchableOpacity>
    </View>

    {showMoreInfo && (
      <>
        <View style={styles.gridContainer}>
          {ad?.breed && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Breed</Text>
              <Text style={styles.detailValue}>{ad.breed}</Text>
            </View>
          )}
          {ad?.age && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Age</Text>
              <Text style={styles.detailValue}>{ad.age}</Text>
            </View>
          )}
        </View>

        <View style={styles.gridContainer}>
          {ad?.gender && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>{ad.gender}</Text>
            </View>
          )}
          {ad?.negotiation && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Negotiation</Text>
              <Text style={styles.detailValue}>{ad.negotiation}</Text>
            </View>
          )}
        </View>

        {/* Health Status Array */}
        {ad?.healthStatus && ad.healthStatus.length > 0 && (
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Health Status</Text>
              <View style={styles.healthStatusContainer}>
                {ad.healthStatus.map((status: string, index: number) => (
                  <View key={index} style={styles.healthStatusBadge}>
                    <Text style={styles.healthStatusText}>{status}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </>
    )}
  </View>
);

const renderKidDetails = () => (
  <View style={styles.detailsCard}>
    <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle}>Kid Details</Text>
      <TouchableOpacity
        onPress={() => setShowMoreInfo(!showMoreInfo)}
        style={styles.showMoreButtonInline}
      >
       <Text style={styles.showMoreText}>
         {showMoreInfo ? 'Show Less' : 'Show More'}
       </Text>
       <Ionicons
         name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
         size={16}
         color={colors.blue}
       />
      </TouchableOpacity>
    </View>

    {showMoreInfo && (
      <>
      <View style={styles.gridContainer}>
        {ad?.condition && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Condition</Text>
            <Text style={styles.detailValue}>{ad?.condition}</Text>
          </View>
        )}
        {ad?.color && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Color</Text>
            <Text style={styles.detailValue}>{ad?.color}</Text>
          </View>
        )}
      </View>
      <View style={styles.gridContainer}>
         {ad?.gender && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Gender</Text>
            <Text style={styles.detailValue}>{ad?.gender}</Text>
          </View>
         )}
         {ad?.ageGroup && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Age Group</Text>
            <Text style={styles.detailValue}>{ad?.ageGroup}</Text>
          </View>
         )}
      </View>
      <View style={styles.gridContainer}>
       {ad?.plasticGroup && (
        <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Plastic Group</Text>
            <Text style={styles.detailValue}>{ad?.plasticGroup}</Text>
        </View>
       )}
       {ad?.woodOptions && (
         <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Wood Options</Text>
            <Text style={styles.detailValue}>{ad?.woodOptions}</Text>
         </View>
       )}
       {ad?.size && (
        <View style={styles.gridItem}>
          <Text style={styles.detailLabel}>Size</Text>
          <Text style={styles.detailValue}>{ad?.size}</Text>
         </View>
       )}
       {ad?.negotiation && (
        <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Negotiation</Text>
            <Text style={styles.detailValue}>{ad?.negotiation}</Text>
        </View>
       )}
      </View>
      </>
    )}
  </View>
);

  const renderJobDetails = () => (
    <View style={styles.detailsCard}>
      <View style={styles.cardTitleRow}>
       <Text style={styles.cardTitle}>Job Details</Text>
       <TouchableOpacity
         onPress={() => setShowMoreInfo(!showMoreInfo)}
         style={styles.showMoreButtonInline}
       >
        <Text style={styles.showMoreText}>
            {showMoreInfo ? 'show Less' : 'Show More'}
        </Text>
        <Ionicons 
          name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.blue}
        />
       </TouchableOpacity>
      </View>

      {showMoreInfo && (
        <>
        <View style={styles.gridContainer}>
         {ad?.jobType && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Job Type</Text>
            <Text style={styles.detailValue}>{ad?.jobType}</Text>
          </View>
         )}
         {ad?.companyEmployerName && (
           <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Company Employer Name</Text>
             <Text style={styles.detailValue}>{ad?.companyEmployerName}</Text>
           </View>
         )}
        </View>
        <View style={styles.gridContainer}>
         {ad?.location && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{ad?.location}</Text>
          </View>
         )}
         {ad?.experienceLevel && (
          <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Experience Level</Text>
            <Text style={styles.detailValue}>{ad?.experienceLevel}</Text>
          </View>
         )}
        </View>
        <View style={styles.gridContainer}>
         {ad?.yearOfExperience && (
           <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Year of Experience</Text>
             <Text style={styles.detailValue}>{ad?.yearOfExperience}</Text>
            </View>
         )}
         {ad?.genderPreference && (
           <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Gender Preference</Text>
            <Text style={styles.detailValue}>{ad?.genderPreference}</Text>
           </View>
         )}
        </View>
        <View style={styles.gridContainer}>
          {ad?.applicationDeadline && (
           <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Application Deadline</Text>
            <Text style={styles.detailValue}>{ad?.applicationDeadline}</Text>
           </View>
          )}
          {ad?.skils && (
           <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Skills</Text>
             <Text style={styles.detailValue}>{ad?.skils}</Text>
            </View>
          )}
        </View>
        <View style={styles.gridContainer}>
          {ad?.jobLocationType && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Job Location Type</Text>
                <Text style={styles.detailValue}>{ad?.jobLocationType}</Text>
             </View>
          )}
          {ad?.responsibilities && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Responsibilities</Text>
              <Text style={styles.detailValue}>{ad?.responsibilities}</Text>
            </View>
          )}
        </View>
        <View style={styles.gridContainer}>
           {ad?.requirements && (
             <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Requirements</Text>
                <Text style={styles.detailValue}>{ad?.requirements}</Text>
             </View>
           )}
           {ad?.pricingType && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Pricing Type</Text>
                <Text style={styles.detailValue}>{ad?.pricingType}</Text>
            </View>
           )}
        </View>
         <View style={styles.gridContainer}>
          {ad?.negotiation && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Negotiation</Text>
                <Text style={styles.detailValue}>{ad?.negotiation}</Text>
            </View>
          )}
         </View>
        </>
      )}
    </View>
  );

  const renderHireDetails = () => (
    <View style={styles.detailsCard}>
     <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>Hire Details</Text>
        <TouchableOpacity
          onPress={() => setShowMoreInfo(!showMoreInfo)}
          style={styles.showMoreButtonInline}
        >
          <Text style={styles.showMoreText}>
            {showMoreInfo ? 'Show Less' : 'Show More'}
          </Text>
          <Ionicons
            name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.blue}
          />
        </TouchableOpacity>
     </View>

     {showMoreInfo && (
      <>
        <View style={styles.gridContainer}>
          {ad?.hireGender && (
           <View style={styles.gridItem}>
            <Text style={styles.detailLabel}>Gender</Text>
            <Text style={styles.detailValue}>{ad?.hireGender}</Text>
           </View>
          )}
          {ad?.jobType && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Job Type</Text>
                <Text style={styles.detailValue}>{ad?.jobType}</Text>
            </View>
          )}
        </View>
        <View style={styles.gridContainer}>
           {ad?.experienceLevel && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Experience Level</Text>
                <Text style={styles.detailValue}>{ad?.experienceLevel}</Text>
            </View>
           )}
           {ad?.workMode && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Work Mode</Text>
                <Text style={styles.detailValue}>{ad?.workMode}</Text>
            </View>
           )}
        </View>
        <View style={styles.gridContainer}>
          {ad?.yearsOfExperience && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Year of Experience</Text>
              <Text style={styles.detailValue}>{ad?.yearsOfExperience}</Text>
            </View>
          )}
          {ad?.relationshipStatus && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>RelationShip Status</Text>
                <Text style={styles.detailValue}>{ad?.relationshipStatus}</Text>
            </View>
          )}
        </View>
       {ad?.skills && (
        <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
             <Text style={styles.detailLabel}>Skills</Text>
             <Text style={styles.detailValue}>{ad.skills}</Text>
            </View>
        </View>
       )}

       {/* Links Section */}
       {ad?.portfolioLink && (
         <View style={styles.linkSection}>
            <Text style={styles.detailLabel}>Portfolio Link</Text>
            <TouchableOpacity onPress={() => handleOpenLink(ad.portfolioLink)}>
              <Text style={styles.linkText}>UNK</Text>
            </TouchableOpacity>
          </View>
       )}

        {ad?.otherLinks && (
          <View style={styles.linkSection}>
            <Text style={styles.detailLabel}>Other Links</Text>
            <TouchableOpacity onPress={() => handleOpenLink(ad.otherLinks)}>
              <Text style={styles.linkText}>View Link</Text>
            </TouchableOpacity>
          </View>
        )}
        {ad?.resume && (
          <View style={styles.documentSection}>
            <TouchableOpacity 
              style={styles.documentButton}
              onPress={() => handleOpenLink(ad.resume)}
            >
              <AntDesign name="file" size={20} color={colors.darkGray} />
              <Text style={styles.documentText}>My Resume</Text>
              <Text style={styles.documentSize}>10kb</Text>
            </TouchableOpacity>
          </View>
        )}
          <View style={styles.gridContainer}>
          {ad?.pricingType && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Pricing Type</Text>
              <Text style={styles.detailValue}>{ad.pricingType}</Text>
            </View>
          )}
          {ad?.negotiation && (
            <View style={styles.gridItem}>
              <Text style={styles.detailLabel}>Negotiation</Text>
              <Text style={styles.detailValue}>{ad.negotiation}</Text>
            </View>
          )}
        </View>
      </>
     )}
    </View>
  );

  const renderBeautyDetails = () => (
    <View style={styles.detailsCard}>
      <View style={styles.cardTitleRow}>
       <Text style={styles.cardTitle}>Beauty Details</Text>
       <TouchableOpacity
         onPress={() => setShowMoreInfo(!showMoreInfo)}
         style={styles.showMoreButtonInline}
       >
       <Text style={styles.showMoreText}>
          {showMoreInfo ? 'Show Less' : 'Show More'}
       </Text>
       <Ionicons
         name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
         size={16}
         color={colors.blue}
       />
       </TouchableOpacity>
      </View>

      {showMoreInfo && (
        <>
         <View style={styles.gridContainer}>
          {ad?.beautyType && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Beauty Type</Text>
                <Text style={styles.detailValue}>{ad.beautyType}</Text>
             </View>
          )}
          {ad?.condition && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Condition</Text>
                <Text style={styles.detailValue}>{ad.condition}</Text>
            </View>
          )}
         </View>
         <View style={styles.gridContainer}>
           {ad?.hairType && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Hair Type</Text>
                <Text style={styles.detailValue}>{ad?.hairType}</Text>
            </View>
           )}
           {ad?.gender && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>{ad?.gender}</Text>
            </View>
           )}
         </View>
         <View style={styles.gridContainer}>
          {ad?.beautyBrand && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Brand</Text>
                <Text style={styles.detailValue}>{ad?.beautyBrand}</Text>
            </View>
          )}
          {ad?.skinType && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Skin Type</Text>
                <Text style={styles.detailValue}>{ad?.skinType}</Text>
            </View>
          )}
         </View>
         <View style={styles.gridContainer}>
           {ad?.targetConcern && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Target Concern</Text>
                <Text style={styles.detailValue}>{ad?.targetConcern}</Text>
            </View>
           )}
           {ad?.skinTone && (
             <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Skin Tone</Text>
                <Text style={styles.detailValue}>{ad?.skinTone}</Text>
             </View>
           )}
         </View>
         <View style={styles.gridContainer}>
          {ad?.fragranceFamily && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Fragrance Family</Text>
                <Text style={styles.detailValue}>{ad?.fragranceFamily}</Text>
            </View>
          )}
          {ad?.beautyPowerSource && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Power Source</Text>
                <Text style={styles.detailValue}>{ad?.beautyPowerSource}</Text>
            </View>
          )}
          {ad?.negotiation && (
            <View style={styles.gridItem}>
                <Text style={styles.detailLabel}>Negotiation</Text>
                <Text style={styles.detailValue}>{ad?.negotiation}</Text>
            </View>
          )}
         </View>
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={styles.loadingText}>Loading Ad Details...</Text>
      </View>
    );
  }

  if (!ad) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ad not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
       <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrow-left" size={18} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ad Details</Text>
       </View>
      </View>

      {/* fetch title details of vehicles, agricultureaft, properties, */}
      <View style={styles.infoContainer}>
        <View style={styles.infoTopRow}>
          <Text style={styles.productName}>
             {adType === 'agriculture' ? ad.title :
             adType === 'vehicle' ? `${ad?.vehicleType} ${ad?.model}` :
             adType === 'property' ? ad?.propertyName :
             adType === 'equipment' ? ad?.equipmentTitle :
             adType === 'gadget' ? ad?.gadgetTitle : 
             adType === 'laptop' ? ad?.laptopTitle :
             adType === 'fashion' ? ad?.fashionTitle :
             adType === 'household' ? ad?.householdTitle : 
             adType === 'construction' ? ad?.constructionTitle : 
             adType === 'pet' ? ad?.petType :
             adType === 'kid' ? ad?.title :
             adType === 'job' ? ad?.jobTitle :
             adType === 'hire' ? ad?.hireTitle : 
             adType === 'beauty' ? ad?.beautyTitle : 

             'Product'}
          </Text>
              <View style={styles.viewsContainer}>
         <Feather name="eye" size={16} color="#9CA3AF" />
        <Text style={styles.viewsText}>
          {adType === 'agriculture' ? ad?.viewCount : 
            adType === 'vehicle' ? ad?.viewCount : 
            adType === 'property' ? ad?.viewCount :
            adType === 'equipment' ? ad?.viewCount :
            adType === 'gadget' ? ad?.viewCount :
            adType === 'laptop' ? ad?.viewCount : 
            adType === 'fashion' ? ad?.viewCount :
            adType === 'household' ? ad?.viewCount :
            adType === 'construction' ? ad?.viewCount :
            adType === 'pet' ? ad?.viewCount :
            adType === 'kid' ? ad?.viewCount :
            adType === 'job' ? ad?.viewCount : 
            adType === 'hire' ? ad?.viewCount : 
            adType === 'beauty' ? ad?.viewCount :
          0} views
            </Text>
        </View>
        </View>

         <View style={styles.locationCon}>
             <Image
               source={require('../../../assets/images/location.png')}
               style={styles.locationIcon}
              />
              <Text style={styles.locationText}>
                {ad?.propertyAddress || ad?.location ||  carAd?.location || 'N/A'}
              </Text>
          </View>
            <Text style={styles.postDate}>
             Posted on {formatDate(carAd?.createdAt || ad?.createdAt)}
            </Text>
      </View>
    
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        {images.length > 0 && (
          <View style={styles.imageSection}>
            <View style={styles.carouselContainer}>
              <Image source={{ uri: images[currentImageIndex] }} style={styles.mainImage} />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <TouchableOpacity 
                    style={[styles.carouselButton, styles.leftButton]}
                    onPress={handlePrevImage}
                    disabled={currentImageIndex === 0}
                  >
                    <Ionicons name="chevron-back" size={24} color={currentImageIndex === 0 ? '#ccc' : colors.darkGray} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.carouselButton, styles.rightButton]}
                    onPress={handleNextImage}
                    disabled={currentImageIndex === images.length - 1}
                  >
                    <Ionicons name="chevron-forward" size={24} color={currentImageIndex === images.length - 1 ? '#ccc' : colors.darkGray} />
                  </TouchableOpacity>
                </>
              )}
              
              {/* Image Counter */}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {images.length}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Price Section */}
       <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>
           {adType === 'job' ? 'Salary Range' : 'Price'}
       </Text>
        <Text style={styles.priceValue}>
         ₦{(ad?.amount || ad?.salaryRange || 0).toLocaleString()}
         {adType === 'job' && ad?.pricingType && (
          <Text style={{ fontSize: 14, fontWeight: '400' }}> / {ad.pricingType}</Text>
         )}
       </Text>
     </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.activeTab]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
              Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'review' && styles.activeTab]}
            onPress={() => setActiveTab('review')}
          >
            <Text style={[styles.tabText, activeTab === 'review' && styles.activeTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'details' && (
          <>
            {renderDetailsContent()}
            
            {/* Description */}
            {ad?.description && (
              <View style={styles.descriptionCard}>
                <Text style={styles.cardTitle}>More Info</Text>
                <Text style={styles.descriptionText}>{ad.description}</Text>
              </View>
            )}

            {/* Business Information */}
            {business && (
             <View >
                 <View style={styles.sellerContainer}>
                            <View style={{ position: 'relative' }}>
                              <Image 
                                source={
                                  seller?.image
                                  ? { uri: seller.image }
                                  : business?.profileImage
                                  ? { uri: business.profileImage }
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
                                 {business?.businessName || seller?.fullName || 'Unknown Business'}
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
                                 Joined Tenaly on {formatDate(seller?.joinedDate || business?.createdAt || carAd?.createdAt || ad?.createdAt)}
                              </Text>
                            </View>
                 </View>
          {business.addresses && business.addresses.length > 0 && (
            <View style={styles.addressSection}>
             <Text style={styles.sectionTitle}>Store Address</Text>
            {business.addresses.map((addr: any, idx: number) => {
              const businessHour = business.businessHours?.find((hour: any) => {
             try {
             if (hour.address && typeof hour.address === 'string') {
               return hour.address.includes(addr.address) || 
                   hour.address.includes(addr._id);
             }
             return false;
            } catch (error) {
             showErrorToast(`Error matching business hours: ${error}`);
             return false;
           }
          });
      
      return (
        <View key={addr._id} style={styles.addressItem}>
          <View style={styles.addressHeader}>
            <Image
              source={require('../../../assets/images/location.png')} 
            />
            <Text style={styles.addressText}>{addr.address}</Text>
          </View>

          {/* Working Hours */}
          {businessHour && businessHour.days && businessHour.days.length > 0 && (
            <View style={styles.workingHoursSection}>
              <Text style={styles.workingHoursTitle}>Working Hours</Text>
              <View style={styles.daysRow}>
                {businessHour.days.map((day: string, dayIdx: number) => (
                 <View key={dayIdx} style={styles.dayBox}>
                     <Text  style={styles.dayText}>
                    {day.substring(0, 3)}
                  </Text>
                 </View>
                ))}
                <View style={styles.openedBadge}>
                  <View style={styles.greenDot} />
                  <Text style={styles.openedText}>Opened</Text>
                </View>
              </View>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={16} color={colors.lightGray} />
                <Text style={styles.timeText}>
                  {businessHour.openingTime} - {businessHour.closingTime}
                </Text>
              </View>
            </View>
          )}
          
          {/* Delivery Information */}
          {addr.deliveryAvailable && addr.deliverySettings ? (
          <>
            <View style={styles.deliveryBadge}>
              <MaterialIcons name="local-shipping" size={16} color={colors.blue} />
              <Text style={styles.deliveryText}>
               Delivery: {addr.deliverySettings.dayFrom}-{addr.deliverySettings.daysTo} days
              </Text>
             <Text style={styles.deliveryFee}>
             ₦{addr.deliverySettings.feeFrom?.toLocaleString()} - ₦{addr.deliverySettings.feeTo?.toLocaleString()}
             </Text>
            </View>

            {addr.deliverySettings?.explanation && (
              <Text>
                {addr.deliverySettings.explanation}
              </Text>
            )}
          </>
          ): (
           <View style={styles.noDeliveryBadge}>
              <MaterialIcons name="local-shipping" size={16} color={colors.blue} />
               <Text style={styles.noDeliveryText}>No delivery</Text>
            </View>
          )}
        </View>
      );
    })}
  </View>
           )}
              </View>
            )}

            {/* Share Section */}
            <View style={styles.shareSection}>
              <View style={styles.shareIconRow}>
              <Text style={styles.shareTitle}>Share</Text>
             
               <View style={styles.iconsRight}>
                  <TouchableOpacity
                 onPress={() => handleShare('whatsapp')}
               >
                 <Image 
                   source={require('../../../assets/images/whatapp.png')}
                   style={styles.shareIcon}
                 />
               </TouchableOpacity>

                <TouchableOpacity
                 onPress={() => handleShare('linkedin')}
               >
                  <Image
                    source={require('../../../assets/images/linkedin.png')}
                    style={styles.shareIcon} 
                  />
               </TouchableOpacity>

                  <TouchableOpacity
                 onPress={() => handleShare('facebook')}
               >
                <Image
                  source={require('../../../assets/images/facebook.png')}
                  style={styles.shareIcon} 
                />
               </TouchableOpacity>

                  <TouchableOpacity
                 onPress={() => handleShare('instagram')}
               >
                <Image
                  source={require('../../../assets/images/instagram.png')}
                  style={styles.shareIcon} 
                />
               </TouchableOpacity>

                  <TouchableOpacity
                 onPress={() => handleShare('tiktok')}
               >
                  <Image
                    source={require('../../../assets/images/tiktok.png')} 
                  />
               </TouchableOpacity>

               <TouchableOpacity
                onPress={() => handleShare('twitter')}>
                 <Image
                   source={require('../../../assets/images/x.png')} 
                   style={styles.shareIcon}
                 />
               </TouchableOpacity>
               </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'review' && (
          <View style={styles.reviewsCard}>
            <Text style={styles.cardTitle}>Reviews</Text>
            <Text style={styles.emptyText}>No reviews yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 50,
    backgroundColor: colors.bg,
    shadowColor: '#4D485F1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  headerContainer: {
   flexDirection: 'row',
   gap: 10,
   alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.lightGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.lightGray,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  imageSection: {
    paddingBottom: 16,
    marginHorizontal: 16,
  },
  carouselContainer: {
    position: 'relative',
    width: width - 32,
    height: 300,
    alignSelf: 'center'
  },
  mainImage: {
    width: width - 32,
    height: 300,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: colors.bg,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButton: {
    left: 16,
  },
  rightButton: {
    right: 16,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: colors.blue,
  },
  priceSection: {
    backgroundColor: colors.lightSpot,
    padding: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
    color: colors.darkGray,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightSpot,
    padding: 16,
    gap: 12,
    marginTop: 8,
    borderWidth: 0.3,
    borderColor: colors.border
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.shadeWhite,
  },
  tabText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  activeTabText: {
    color: colors.blue,
    fontWeight: '400',
    fontFamily: 'WorkSans_500Medium',
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: colors.bg,
    padding: 16,
    paddingHorizontal: 16,
    marginHorizontal: 9,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    marginBottom: 10,
    fontFamily: 'WorkSans_400Regular'
  },
  gridContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
  bulkPriceSection: {
    backgroundColor: colors.lightSpot,
    padding: 16,
    borderRadius: 8,
    width: 337,
    marginTop: 8,
  },
  bulkPriceTitle: {
   fontSize: 14,
   fontWeight: '600',
   color: colors.blue,
   fontFamily: 'WorkSans_600SemiBold'
  },
  bulkPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  bulkPriceQuantity: {  
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray,
  },
  bulkPriceAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray
  },
  detailLabel: {
    fontSize: 12,
    color: colors.lightGrey,
    fontFamily: 'WorkSans_400Regular',
    fontWeight: '400',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium'
  },
  healthStatusContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 8,
},
healthStatusBadge: {
  backgroundColor: colors.blueGrey,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: colors.blue,
},
healthStatusText: {
  fontSize: 12,
  fontWeight: '500',
  color: colors.blue,
  fontFamily: 'WorkSans_500Medium',
},
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  showMoreButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: '500',
  },
  linkSection: {
  marginBottom: 16,
},
linkText: {
  fontSize: 14,
  color: colors.blue,
  textDecorationLine: 'underline',
  fontWeight: '500',
  fontFamily: 'WorkSans_500Medium',
},
documentSection: {
  marginVertical: 12,
},
documentButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.lightSpot,
  padding: 12,
  borderRadius: 8,
  gap: 8,
},
documentText: {
  fontSize: 14,
  color: colors.darkGray,
  fontWeight: '500',
  flex: 1,
  fontFamily: 'WorkSans_500Medium',
},
documentSize: {
  fontSize: 12,
  color: colors.lightGray,
  fontFamily: 'WorkSans_400Regular',
},
  descriptionCard: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    marginTop: 8,
    paddingHorizontal: 16,
  marginHorizontal: 9,
  paddingVertical: 12,  
  borderRadius: 8,
  },
  sellerContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: colors.whiteShade,
     borderRadius: 8,
     height: 113,
     paddingHorizontal: 16,
     marginHorizontal: 9,
     paddingVertical: 12,  
    marginTop:20,
    gap: 1,   
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
  descriptionText: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },
  businessCard: {
    backgroundColor: colors.bg,
    padding: 16,
    marginTop: 8,
  },
  businessInfo: {
    marginBottom: 16,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
  },
  businessAbout: {
    fontSize: 14,
    color: colors.lightGray,
    lineHeight: 20,
    marginBottom: 8,
  },
  businessLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  businessLocationText: {
    fontSize: 14,
    color: colors.lightGray,
  },
  addressSection: {
    marginTop: 16,
    paddingTop: 16,
    backgroundColor: colors.whiteShade,
    marginHorizontal: 9,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 12,
  },
  addressItem: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  workingHoursSection: {
  marginTop: 12,
  marginBottom: 8,
},
workingHoursTitle: {
  fontSize: 14,
  fontWeight: '500',
  color: colors.darkGray,
  marginBottom: 8,
  fontFamily: 'WorkSans_500Medium',
},
daysRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  gap: 8,
},
dayBox: {
 backgroundColor: colors.blueGrey,
 width: 41,
 height: 24,
 borderRadius: 4,
 justifyContent: 'center',
 alignItems: 'center'
},
dayText: {
  fontSize: 12,
  fontWeight: '500',
  color: colors.blue,
  fontFamily: 'WorkSans_500Medium',
},
openedBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: 'auto',
  gap: 4,
  backgroundColor: colors.greenSuccess,
  width: 64,
  height: 16,
  borderRadius: 2,
},
greenDot: {
  width: 6,
  height:6,
  borderRadius: 4,
  backgroundColor: colors.lightGreenShade,
},
openedText: {
  fontSize: 10,
  color: colors.lightGreenShade,
  fontWeight: '500',
},
timeRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
timeText: {
  fontSize: 10,
  color: colors.darkGray,
  fontWeight: '500',
  fontFamily: 'WorkSans_500Medium',
},
noDeliveryBadge: {
  backgroundColor: colors.blueGrey,
  borderWidth: 1,
  borderColor: colors.shadeWhite,
  width: 108,
  height: 36,
  borderRadius: 4,
  marginTop: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
},
noDeliveryText: {
  fontSize: 12,
  color: colors.blue,
  fontWeight: '400',
  fontFamily: 'WorkSans_400Regular'
},
  shareSection: {
     backgroundColor: '#FAFAFA',
     borderRadius: 8,
     height: 72,
     paddingHorizontal: 16,
     marginHorizontal: 9,
     paddingVertical: 12,  
    marginTop:20, 
  },
  shareIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  shareTitle: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold'
  },
  iconsRight: {
   flexDirection: 'row',
   alignItems: 'center',
  },
  shareIcon: {
    width: 40,
    height: 40,
  },
  deliveryBadge: {
    backgroundColor: colors.blueGrey,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  deliveryText: {
    fontSize: 12,
    color: colors.blue,
    fontWeight: '500',
    marginTop: 4,
  },
  deliveryFee: {
    fontSize: 12,
    color: colors.blue,
    marginTop: 4,
  },
  deliveryExplanation: {
    fontSize: 12,
    color: colors.lightGray,
    marginTop: 8,
    fontStyle: 'italic',
  },
  reviewsCard: {
    backgroundColor: colors.bg,
    padding: 16,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.lightGray,
    textAlign: 'center',
    marginTop: 16,
  },
});