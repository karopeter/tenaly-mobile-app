import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { AntDesign, Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiClient from '@/app/utils/apiClient';
import { CombinedAd, SellerProfile } from '@/app/types/marketplace';
import { showErrorToast } from '@/app/utils/toast';
import ReportModal from '@/app/reusables/ReportModal';

const { width: screenWidth } = Dimensions.get('window');

export default function App() {
  const router = useRouter();
  const { adId } = useLocalSearchParams<{ adId: string }>();
  const [ad, setAd] = useState<CombinedAd | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [reportVisible, setReportVisible] = useState(false);

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

  // Fetch seller profile data
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

  // Get appropriate images based on ad type
  const getImages = () => {
    if (!ad) return [];
    
    if (ad.carAd.category === 'car' || ad.carAd.category === 'bus' || ad.carAd.category === 'tricycle') {
      return ad.carAd.vehicleImage || [];
    } else {
      return ad.carAd.propertyImage || [];
    }
  };

  // Get details based on ad type
  const getAdDetails = () => {
    if (!ad) return {};

    if (ad.vehicleAd) {
      return {
        'Vehicle Type': ad.vehicleAd.vehicleType || 'N/A',
        'Model': ad.vehicleAd.model || 'N/A',
        'Year': ad.vehicleAd.year?.toString() || 'N/A',
        'Color': ad.vehicleAd.color || 'N/A',
        'Fuel Type': ad.vehicleAd.fuelType || 'N/A',
        'Transmission': ad.vehicleAd.transmission || 'N/A',
        'Car Type': ad.vehicleAd.carType || 'N/A',
        'Key Features': ad.vehicleAd.carKeyFeatures || 'N/A',
      };
    } else if (ad.propertyAd) {
      return {
        'Property Type': ad.propertyAd.propertyType || 'N/A',
        'Furnishing': ad.propertyAd.furnishing || 'N/A',
        'Square Meter': ad.propertyAd.squareMeter || 'N/A',
        'Parking': ad.propertyAd.parking || 'N/A',
        'Service Charge': ad.propertyAd.serviceCharge || 'N/A',
        'Ownership': ad.propertyAd.ownershipStatus || 'N/A',
        'Duration': ad.propertyAd.propertyDuration || 'N/A',
        'Negotiation': ad.propertyAd.negotiation || 'N/A',
      };
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
                  {ad.vehicleAd ? 'Vehicle Details' : 'Property Details'}
                </Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.detailsGrid}>
                {Object.entries(details).map(([key, value], index) => (
                  <View style={styles.detailItem} key={index}>
                    <Text style={styles.detailKey}>{key}</Text>
                    <Text style={styles.detailValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* More Info Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.moreInfoText}>
                {ad.vehicleAd?.description || ad.propertyAd?.description || 'No description available'}
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
                <Image
                  source={
                    seller?.image 
                    ? { uri: seller.image }
                    : ad.business?.profileImage
                    ? { uri: ad.business.profileImage }
                    : require('../../../assets/images/profile-circle.png')
                  }
                  style={styles.sellerLogo}
                />
                <View style={styles.sellerDetails}>
                  <TouchableOpacity>
                    <Text style={styles.sellerName}>
                     {ad.business?.businessName || seller?.fullName || 'Unknown Business'}
                    </Text>
                  </TouchableOpacity>
                 {seller && (
                   <View style={[
                     styles.verifiedRow,
                     seller.isVerified
                     ? { backgroundColor: colors.greenSuccess}
                     : { backgroundColor: colors.lightRed }
                   ]}>
                     {seller.isVerified ? (
                       <>
                         <Image 
                            source={require('../../../assets/images/verified.png')}
                            style={{ 
                              width: 12,
                              height: 12,
                            }}
                         />
                         <Text style={styles.verifiedText}>Verified User</Text>
                       </>
                     ): (
                      <>
                       <Image 
                          source={require('../../../assets/images/unverified.png')}
                          style={{
                             width: 12,
                             height: 12,
                          }}
                       />
                       <Text style={styles.unverifiedText}>Unverified user</Text>
                      </>
                     )}
                    </View>
                 )}
                  <Text style={styles.sellerJoinDate}>
                    Joined Tentably on {formatDate(seller?.joinedDate || ad.business.createdAt || ad.carAd.createdAt)}
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
            name="enviromento"
            size={24}
            color="#4C4C4C"
            style={{ marginRight: 8, marginTop: 7 }}
          />
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressTitle}>
              {ad.business.location} - Nigeria
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
             <Text style={styles.deliveryBadgeDays}> ({deliverySettings.dayFrom}-{deliverySettings.daysTo} days)</Text>
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
              <AntDesign name="arrowleft" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Details</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Image
                source={require('../../../assets/images/bookmarkedIcon.png')}
                style={styles.bookIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity>
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
                {ad.vehicleAd ? 
                  `${ad.vehicleAd.vehicleType} ${ad.vehicleAd.model} ${ad.vehicleAd.year}` :
                  ad.propertyAd?.propertyName || 'Property'
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
              <Text style={styles.viewsText}>16,000 views</Text>
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
                  <AntDesign name="arrowleft" size={24} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextImage} style={styles.imageOverlayRight}>
                  <AntDesign name="arrowright" size={24} color="#111" />
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
              {formatPrice(ad.vehicleAd?.amount || ad.propertyAd?.amount || 0)}
            </Text>
          </View>
          {(ad.vehicleAd?.negotiation === 'Yes' || ad.propertyAd?.negotiation === 'Yes') && (
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
              {ad.vehicleAd ? 'Vehicle Details' : 'Property Details'}
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
        <TouchableOpacity>
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
            <FontAwesome name="whatsapp" size={24} color="white" />
            <Text style={styles.footerButtonText}>Chat on Whatsapp</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.footerBottomRow}>
          <TouchableOpacity style={styles.messageButton}>
            <Feather name="phone" size={24} color="#525252" />
            <Text style={styles.messageButtonText}>
              {seller?.phoneNumber}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton}>
            <Feather name="mail" size={24} color="#525252" />
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
    color: colors.darkGray
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  bookIcon: {
    width: 36,
    height: 36
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
    fontWeight: '500'
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
  borderColor: '#E6E9FF',     // subtle blue border like the mock
  backgroundColor: '#F6F8FF', // very light blue/purple background
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 10,
},

iconCircle: {
  width: 34,
  height: 34,
  borderRadius: 10,
  backgroundColor: '#EEF5FF', // soft blue circle behind icon
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
},

deliveryBadgeTitle: {
  color: '#1031AA',
  fontSize: 14,
  fontWeight: '600',
},

deliveryBadgeDays: {
  color: '#1031AA',
  fontWeight: '500',
  fontSize: 13,
},

deliveryFeeText: {
  marginTop: 4,
  color: '#1031AA',
  fontSize: 13,
  fontWeight: '700',
},

deliveryInfo: {
  marginTop: 8,
  fontSize: 13,
  color: '#6B7280', // muted grey for the explanation line
},

deliveryInfoLabel: {
  fontWeight: '700',
  color: '#374151', // slightly darker for the "Delivery Info:" label
  fontSize: 13,
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
    fontWeight: '400'
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.darkGray
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
    fontWeight: '500'
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
    fontSize: 14,
    color: colors.lightGrey,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.lightGray,
  },
  moreInfoText: {
    fontSize: 14,
    lineHeight: 22,
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
  sellerLocation: {
    fontSize: 14,
    color: colors.lightGrey,
    fontWeight: '400',
    marginBottom: 8,
  },
  sellerJoinDate: {
    fontSize: 12,
    color: colors.lightGrey,
    fontWeight: '400'
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
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  addressDetails: {
    color: colors.lightGrey,
    fontSize: 14,
  },
  addressHoursTitle: {
    fontWeight: '600',
    color: colors.darkGray,
    marginTop: 10,
    fontSize: 14,
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
  deliveryInfo: {
    color: colors.lightGrey,
    fontSize: 12,
    marginTop: 10,
    fontWeight: 'bold',
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