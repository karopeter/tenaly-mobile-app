import React, { useState, useEffect, useCallback } from 'react';
import {
 View,
 Text, 
 StyleSheet,
 FlatList,
 Image,
 TouchableOpacity,
 ActivityIndicator,
 ScrollView,
 RefreshControl,
 Alert,
 Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {  Feather, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/app/constants/theme';
import { useRouter } from 'expo-router';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { BookmarkedAd } from '@/app/types/bookmarked.types';


interface BookmarkedResponse {
  success: boolean;
  data: BookmarkedAd[];
  totalItems: number;
}


export default function Bookmarked() {
  const router = useRouter();
  const [bookmarkedAds, setBookmarkedAds] = useState<BookmarkedAd[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sellerDetails, setSellerDetails] = useState<Record<string, string>>({});

  // Fetch bookmarked ads 
  const fetchBookmarkedAds = async (isRefresh = false) => {
     
    try {
      if (!apiClient) {
        showErrorToast('API client not initialized');
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiClient.get<BookmarkedResponse>('/api/bookmark/get-all-bookmark');

      if (response.data.success) {
        setBookmarkedAds(response.data.data);
      } else {
        showErrorToast('Failed to fetch bookmarked ads');
      }
    } catch (error: any) {
      console.error('Error fetching bookmarked ads:', error);
      showErrorToast('Failed to load bookmarked ads');
    } finally {
      setLoading(false);
    }
  };

  // Remove bookmarked
  const handleUnbookmark = async (adId: string) => {
     Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this ad from your bookmarks?',
      [ 
        { text: 'Cancel', style: 'cancel' },
        {
         text: 'Remove',
         style: 'destructive',
         onPress: async () => {
           try {
            if (!apiClient) {
               showErrorToast('API client not initialized');
               return;
            }

            await apiClient.delete(`/api/bookmark/delete-bookmark/${adId}`);

            // Remove from local state 
            setBookmarkedAds(prev => prev.filter(ad => ad.adId  !== adId));
            showSuccessToast('Ad removed from bookmarks');
           } catch (error: any) {
             console.error('Error unbookmarking ad:', error);
             showErrorToast(error.response?.data?.message || 'Failed to remove bookmark');
           }
         }
        }
      ]
     )
  };


  const fetchSellerPhone = async (sellerId: string) => {
     try {
      if (!apiClient) {
        showErrorToast("API client is not initialized");
        return;
      }

      const response = await apiClient.get(`/api/profile/seller/${sellerId}`);
      const phone = response.data.phoneNumber;

      setSellerDetails(prev => ({
        ...prev,
        [sellerId]: phone,
      }));
     } catch (error) {
        console.error("Errro fetch seller phone number", error);
     }
  }


  // Formate price 
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get ad title based on type  
 const getAdTitle = (ad: BookmarkedAd) => {
  if (ad.petAd)  return ad.petAd.petType;
  if (ad.agricultureAd) return ad.agricultureAd.title;
  if (ad.gadgetAd) return ad.gadgetAd.gadgetTitle;
  if (ad.fashionAd) return ad.fashionAd.fashionTitle;
  if (ad.householdAd) return ad.householdAd.householdTitle;
  if (ad.laptopAd) return ad.laptopAd.laptopTitle;
  if (ad.kidAd) return ad.kidAd.title;
  if (ad.serviceAd) return ad.serviceAd.serviceTitle;
  if (ad.equipmentAd) return ad.equipmentAd.equipmentTitle;
  if (ad.beautyAd) return ad.beautyAd.beautyTitle;
  if (ad.constructionAd) return ad.constructionAd.constructionTitle;
  if (ad.jobAd) return ad.jobAd.jobTitle;
  if (ad.hireAd) return ad.hireAd?.hireTitle;
  if (ad.vehicleAd) return `${ad.vehicleAd.vehicleType} ${ad.vehicleAd.model} ${ad.vehicleAd.year}`;
  if (ad.propertyAd) return ad.propertyAd.propertyName || 'Property';
  return 'Ad';
};

  // Get ad price 
  const getAdPrice = (ad: BookmarkedAd) => {
  if (ad.petAd) return ad.petAd.amount;
  if (ad.agricultureAd) return ad.agricultureAd.amount;
  if (ad.gadgetAd) return typeof ad.gadgetAd.amount === 'string' ? parseFloat(ad.gadgetAd.amount) : ad.gadgetAd.amount;
  if (ad.fashionAd) return ad.fashionAd.amount;
  if (ad.householdAd) return ad.householdAd.amount;
  if (ad.laptopAd) return ad.laptopAd.amount;
  if (ad.kidAd) return ad.kidAd.amount;
  if (ad.serviceAd) return ad.serviceAd.amount;
  if (ad.equipmentAd) return ad.equipmentAd.amount;
  if (ad.beautyAd) return ad.beautyAd.amount;
  if (ad.constructionAd) return ad.constructionAd.amount;
  if (ad.jobAd) return ad.jobAd.salaryRange;
  if (ad.hireAd) return ad.hireAd.salaryRange;
  if (ad.vehicleAd)  return ad.vehicleAd.amount;
  if (ad.propertyAd) return ad.propertyAd.amount;
  return 0;
};
  const handlePhoneCall = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber === "Loading...") {
      showErrorToast("Phone number not available");
      return;
    } 

     try {
      const phoneUrl = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);

      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        showErrorToast("Unable to make phone call");
      }
     } catch (error: any) {
      console.error("Error making phone call:", error);
      showErrorToast("Failed to initate call");
     }
  };

  // Handle Send message with productive preview 
  // const handleSendMessage = async (ad: BookmarkedAd) => {
  //    try {
  //     if (!apiClient) {
  //       showErrorToast("API client is not initialized");
  //       return;
  //     }

  //     // Get or create conversation with the seller 
  //     const response = await apiClient.post('/api/conversation/create-conversation', {
  //      userId: ad.carAd.userId
  //     });

  //     if (response.data.conversation) {
  //       const conversationId = response.data.conversation._id;

  //       // Get product details for preview 
  //       const productTitle = getAdTitle(ad);
  //       const productImage = getAdImages(ad)[0] || null;
  //       const productPrice = getAdPrice(ad);

  //       // Navigate to message screen with conversation and product Info
  //       router.push({
  //         pathName: '/protected/message',
  //         params: {
  //           conversationId,
  //           sellerId: ad.carAd.userId,
  //           adId: ad.adId,
  //           productTitle,
  //           productImage,
  //           productPrice: productPrice.toString()
  //         }
  //       });
  //     }
  //    } catch(error: any) {
  //      console.error("Error creating conversation:", error);
  //      showErrorToast(error.response?.data?.error || "Failed to start conversation");
  //    }
  // };

  // Get ad images 
  const getAdImages = (ad: BookmarkedAd) => {
  if (ad.petAd && ad.carAd.petsImage)  return ad.carAd.petsImage;
  if (ad.agricultureAd && ad.carAd.agricultureImage) return ad.carAd.agricultureImage;
  if (ad.carAd.gadgetImage?.length) return ad.carAd.gadgetImage;
  if (ad.carAd.fashionImage?.length) return ad.carAd.fashionImage;
  if (ad.carAd.householdImage?.length) return ad.carAd.householdImage;
  if (ad.carAd.laptopImage?.length) return ad.carAd.laptopImage;
  if (ad.carAd.kidsImage?.length) return ad.carAd.kidsImage;
  if (ad.carAd.serviceImage?.length) return ad.carAd.serviceImage;
  if (ad.carAd.equipmentImage?.length) return ad.carAd.equipmentImage;
  if (ad.carAd.beautyImage?.length) return ad.carAd.beautyImage;
  if (ad.carAd.constructionImage?.length) return ad.carAd.constructionImage;
  if (ad.carAd.jobImage?.length) return ad.carAd.jobImage;
  if (ad.carAd.hireImage?.length) return ad.carAd.hireImage;
  
  
  const relevantVehicleCategories = ["car", "bus", "tricycle"];

  if (relevantVehicleCategories.includes(ad.carAd.category)) {
    return ad.carAd.vehicleImage || [];
  } else {
    return ad.carAd.propertyImage || [];
  }
};

  // Render bookmark item
  const renderBookmarkItem = ({ item } : {item: BookmarkedAd }) => {
    const images = getAdImages(item);
    const firstImage = images.length > 0 ? images[0] : null;

    return (
      <TouchableOpacity 
        style={styles.adCard}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {firstImage ? (
            <Image source={{ uri: firstImage }} style={styles.adImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Feather name="image" size={32} color={colors.lightGrey} />
            </View>
          )}
          {item.isSold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>SOLD</Text>
            </View>
          )}
        </View>

        <View style={styles.adDetails}>
          <View style={styles.bookmarkContainer}>
           <Text style={styles.adTitle} numberOfLines={2}>
            {getAdTitle(item)}
          </Text>

              {/* Bookmark button */}
          <TouchableOpacity 
            onPress={() => handleUnbookmark(item.adId)}
          >
           <Image
             source={require('../../../assets/images/bookmark-fill.png')}
           />
          </TouchableOpacity>
          </View>
          
          <Text style={styles.adPrice}>
            {formatPrice(getAdPrice(item))}
          </Text>

          <View style={styles.locationRow}>
             <Image 
                source={require('../../../assets/images/location.png')}
             />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.carAd.location}
            </Text>
          </View>

          {/*Vehicle/Property Details */} 
          <View style={item.propertyAd ? styles.detailsRowWrap : styles.detailsRow}>
            {item.vehicleAd ? (
              // Vehicle Details 
              <>
               <View style={styles.detailItem}>
                  <View style={styles.detailView}>
                    <Image 
                     source={require('../../../assets/images/car-icon.png')}
                     style={styles.detailIcon}
                  />
                  </View>
                  <Text style={styles.detailText}>{item.vehicleAd.vehicleType}</Text>
               </View> 
               <View style={styles.detailItem}>
                 <View style={styles.detailView}>
                   <Image 
                   source={require('../../../assets/images/transmission-icon.png')}
                   style={styles.detailIcon}
                 />
                 </View>
                 <Text style={styles.detailText}>{item.vehicleAd.transmission}</Text>
               </View>
               <View style={styles.detailItem}>
                <View style={styles.detailView}>
                  <Image 
                  source={require('../../../assets/images/horsepower-icon.png')}
                  style={styles.detailIcon}
                 />
                </View>
                 <Text style={styles.detailText}>{item.vehicleAd.horsePower || 'N/A'}</Text>
               </View>
              </>
            ): item.propertyAd ? (
              <>
                <View style={styles.detailItem}>
                  <View style={styles.detailView}>
                     <Image source={require('../../../assets/images/property-icons.png')} style={styles.detailIcon} />
                  </View>
                  <Text style={styles.detailText}>{item.propertyAd.furnishing}</Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailView}>
                    <Image source={require('../../../assets/images/area-icon.png')} style={styles.detailIcon} />
                  </View>
                  <Text style={styles.detailText}>{item.propertyAd.propertyType}</Text>
                </View>
                <View style={styles.detailItem}>
                 <View style={styles.detailView}>
                    <Image source={require('../../../assets/images/meter-icon.png')} style={styles.detailIcon} />
                 </View>
                  <Text style={styles.detailText}>{item.propertyAd.squareMeter || "N/A" }Sq</Text>
                </View>
              </>
            ): item.petAd ? (
              <>
             <View style={styles.detailItem}>
               <Text style={styles.detailText}>{item.petAd.breed}</Text>
             </View>
             <View style={styles.detailItem}>
               <Text style={styles.detailText}>{item.petAd.age}</Text>
             </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{item.petAd.gender}</Text>
           </View>
              </>
            ): item.agricultureAd ? (
            <>
             <View style={styles.detailItem}>
        <Text style={styles.detailText}>
          {item.agricultureAd.agricultureType?.[0] || 'Product'}
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailText}>{item.agricultureAd.condition}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailText}>{item.agricultureAd.unit}</Text>
      </View>
            </>
            ): item.gadgetAd ? (
              <>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>{item.gadgetAd.condition}</Text>
              </View>
              <View style={styles.detailItem}> 
                 <Text style={styles.detailText}>{item.gadgetAd.gadgetBrand}</Text>
              </View>
              </>
            ): item.fashionAd ? (
              <>
              <View style={styles.detailItem}>
               <Text style={styles.detailText}>{item.fashionAd.condition}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>{item.fashionAd.fashionBrand}</Text>
              </View>
              </>
            ): item.householdAd ? (
              <>
              <View style={styles.detailItem}>
                 <Text style={styles.detailText}>{item.householdAd.condition}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>{item.householdAd.householdBrand}</Text>
              </View>
              </>
            ): item.laptopAd ? (
              <>
                <View style={styles.detailItem}>
                  <Text style={styles.detailText}>{item.laptopAd.condition}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailText}>{item.laptopAd.laptopBrand}</Text>
                </View>
              </>
            ): item.kidAd ? (
              <>
               <View style={styles.detailItem}>
                  <Text style={styles.detailText}>{item.kidAd.condition}</Text>
               </View>
               <View style={styles.detailItem}>
                 <Text style={styles.detailText}>{item.kidAd.gender}</Text>
               </View>
              </>
            ): item.serviceAd ? (
              <>
               <View style={styles.detailItem}>
                 <Text style={styles.detailText}>{item.serviceAd.pricingType}</Text>
               </View>
               <View style={styles.detailItem}>
                  <Text style={styles.detailText}>{item.serviceAd.serviceExperience}</Text>
               </View>
              </>
            ): item.equipmentAd ? (
              <>
                <View style={styles.detailItem}>
                 <Text style={styles.detailText}>{item.equipmentAd.condition}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailText}>{item.equipmentAd.brand}</Text>
                </View>
              </>
            ): item.beautyAd ? (
              <>
               <View style={styles.detailItem}>
                  <Text style={styles.detailText}>{item.beautyAd.condition}</Text>
               </View>
               <View style={styles.detailItem}>
                  <Text style={styles.detailText}>{item.beautyAd.beautyBrand}</Text>
               </View>
              </>
            ): item.constructionAd ? (
              <>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>{item.constructionAd.constructionBrand}</Text>
              </View>
              <View style={styles.detailItem}>
                 <Text style={styles.detailText}>{item.constructionAd.constructionType}</Text>
              </View>
              </>
            ): item.jobAd ? (
              <>
               <View style={styles.detailItem}>
                 <Text style={styles.detailText}>{item.jobAd.jobType}</Text>
               </View>
               <View style={styles.detailItem}>
                  <Text style={styles.detailText}>{item.jobAd.experienceLevel}</Text>
               </View>
              </>
            ): item.hireAd ? (
              <>
               <View style={styles.detailItem}>
                  <Text style={styles.detailText}>{item.hireAd.jobType}</Text>
               </View>
               <View style={styles.detailItem}>
                 <Text style={styles.detailText}>{item.hireAd.workMode}</Text>
               </View>
              </>
            ):
            
            null}
          </View>

          <View style={styles.adFooter}>
            {/* Conditional rendering based on isSold */}
            {item.isSold ? (
              <View style={styles.soldMessageContainer}>
                <Text style={styles.soldMessageText}>
                  This bookmarked ad has been sold
                </Text>
              </View>
            ): (
              <>
               <View>
                <TouchableOpacity
                  style={[styles.messageBtn, styles.borderBtn]}>
                  <Text style={styles.messageText}>Send Message</Text>
                </TouchableOpacity>
               </View>
               <View>
                <TouchableOpacity 
                  onPress={() =>  handlePhoneCall(sellerDetails[item.carAd.userId])}
                  disabled={!sellerDetails[item.carAd.userId] || sellerDetails[item.carAd.userId] === "Loading..."}
                >
                   <LinearGradient
                    colors={!sellerDetails[item.carAd.userId]  || sellerDetails[item.carAd.userId] === "Loading..."
                      ? ['#cccccc', '#999999'] 
                      : ['#00A8DF', '#1031AA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.messageBtn}>
                  <Text style={styles.callText}>
                     {sellerDetails[item.carAd.userId] || "Loading..."}
                  </Text>
                 </LinearGradient>
                </TouchableOpacity>
               </View>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }


  // Render empty state
  const renderEmptyState = () => (
     <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Image 
          source={require('../../../assets/images/emptyBusiness.png')} 
          style={styles.emptyIcon}
        />
      </View>
      <Text style={styles.emptyTitle}>No ads bookmarked yet</Text>
    </View>
  );

  const onRefresh = useCallback(() => {
    fetchBookmarkedAds(true);
  }, []);

   useEffect(() => {
    fetchBookmarkedAds();
  }, []);

  useEffect(() => {
    bookmarkedAds.forEach(ad => {
      const sellerId = ad.carAd.userId;
      if (sellerId && !sellerDetails[sellerId]) {
        fetchSellerPhone(sellerId);
      }
    });
  }, [bookmarkedAds]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
             onPress={() => router.back()}
             style={styles.backButton}
             >
            <Text style={styles.backIcon}>←</Text>
            {/* <AntDesign name="arrowleft" size={24} color={colors.darkGray} /> */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bookmarked Ads</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
        </View>
      </SafeAreaView>
    );
  }


    return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmarked Ads</Text>
      </View>

      {bookmarkedAds.length === 0 ? (
        <ScrollView
         contentContainerStyle={styles.emptyScrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={bookmarkedAds}
          renderItem={renderBookmarkItem}
          keyExtractor={(item) => item.adId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  header: {
   flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    shadowColor: colors.blurGrey,
     paddingTop: 30,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.1,
    elevation: 6,
  },
   backButton: {
    marginRight: 15,
  },
   backIcon: {
    fontSize: 24,
    color: colors.grey300
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    textAlign: 'center',
    marginLeft: 16,
    fontFamily: 'WorkSans_600SemiBold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.lightGrey,
  },
  listContainer: {
    padding: 16,
  },
  adCard: {
    backgroundColor: colors.whiteShade,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  adImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightSpot,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  soldBadgeText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'WorkSans_700Bold',
    letterSpacing: 1,
  },
  bookmarkButton: {
    position: 'absolute',
    //top: 12,
    right: 5,
    backgroundColor: colors.bg,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  adDetails: {
    padding: 16,
  },
  bookmarkContainer: {
    flexDirection: "row", 
    justifyContent: 'space-between'
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 8,
    lineHeight: 22,
  },
  adPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: colors.grey300,
    marginLeft: 4,
    fontWeight: '400',
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    gap: 16,
  },
  detailsRowWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    gap: 16,
    flexWrap: "wrap"
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailView: {
   width: 30,
   height: 30,
   borderRadius: 20,
   borderWidth: 1,
   borderColor: colors.border,
   justifyContent: 'center',
   alignItems: 'center'
  },
  detailIcon: {
   width: 20,
   height: 20,
   resizeMode: 'contain'
  },
  detailText: {
   fontSize: 14,
   color: colors.lightGrey,
   fontWeight: '400',
   fontFamily: 'WorkSans_400Regular'
  },
  adFooter: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  soldMessageContainer: {
   flex: 1,
   backgroundColor: colors.lightSpot,
   borderRadius: 4,
   paddingVertical: 12,
   paddingHorizontal: 16,
   alignItems: 'center',
   justifyContent: 'center',
  },
  soldMessageText: {
    color: colors.grey300,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    textAlign: 'center'
  },
  messageBtn: {
    borderRadius: 4,
    paddingVertical: 9,
    paddingHorizontal: 25,
  },
  borderBtn: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  callText: {
    color: colors.bg,
    fontWeight: '500',
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium'
  },
  messageText: {
    color: colors.darkGray,
    fontWeight: '500',
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium'
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 12,
    color: colors.blue,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: colors.viewGray,
  },
  separator: {
    height: 16,
  },
  emptyScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.lightGrey,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'WorkSans_500Medium'
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.lightGrey,
    textAlign: 'center',
    lineHeight: 24,
  },
});