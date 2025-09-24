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
 Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {  Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/app/constants/theme';
import { useRouter } from 'expo-router';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';

interface BookmarkedAd {
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
}

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
        { text: 'Cancel', style: 'Cancel' },
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

  // Navigate to ad details 
  const handleAdPress = (adId: string) => {
    router.push(`/protected/ad/${adId}`);
  };

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
    if (ad.vehicleAd) {
      return `${ad.vehicleAd.vehicleType} ${ad.vehicleAd.model} ${ad.vehicleAd.year}`;
    } else if (ad.propertyAd) {
      return ad.propertyAd.propertyName || 'Property';
    }

    return 'Ad';
  };

  // Get ad price 
  const getAdPrice = (ad: BookmarkedAd) => {
    if (ad.vehicleAd) {
      return ad.vehicleAd.amount;
    } else if (ad.propertyAd) {
      return ad.propertyAd.amount;
    }

    return 0;
  };

  // Get ad images 
  const getAdImages = (ad: BookmarkedAd) => {
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
       // onPress={() => handleAdPress(item.adId)}
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
            ): null}
          </View>

          <View style={styles.adFooter}>
            {/* Message Button and Phone Number */}
             <View>
               <TouchableOpacity 
                  style={[styles.messageBtn, styles.borderBtn]}
                 >
                 <Text style={styles.messageText}>Send Message</Text>
               </TouchableOpacity>
             </View>
             <View>
              <TouchableOpacity>
                 <LinearGradient
                 colors={loading ? ['#cccccc', '#999999'] : ['#00A8DF', '#1031AA']}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 0 }}
                 style={styles.messageBtn}
                >
                 <Text style={styles.callText}>
                  {sellerDetails[item.carAd.userId] || "Loading..."}
                 </Text>
                 </LinearGradient>
              </TouchableOpacity>
             </View>
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
           <Text style={styles.backIcon}>←</Text>
          {/* <AntDesign name="arrowleft" size={24} color={colors.darkGray} /> */}
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