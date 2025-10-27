import React, { useCallback, useEffect, useState } from 'react';
import { 
 View, 
 Text, 
 ActivityIndicator,
 StyleSheet,
 FlatList,
 Image,
 TouchableOpacity,
 RefreshControl,
 Modal,
 Switch,
 Dimensions,
 ScrollView
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/app/constants/theme';
import { MyAdsProps } from '@/app/types/myAds.types';
import { useAuth } from '@/app/context/AuthContext';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Ad {
 adId: string;
 carAd: any;
 vehicleAd?: any;
 propertyAd?: any;
 isSold: boolean;
}

const MyAds: React.FC<MyAdsProps> = ({loading: initialLoading }) => {
  const { user, token } = useAuth();
  const [vehicleAds, setVehicleAds] = useState<Ad[]>([]);
  const [propertyAds, setPropertyAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(initialLoading || false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>(user?.role || 'buyer');
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessIndex, setSelectedBusinessIndex] = useState(0);
  const [businessName, setBusinessName] = useState<string>('');
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vehicle' | 'property'>('vehicle');
  
  useEffect(() => {
    if (user?.role) {
        setUserRole(user.role);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchBusinessCategory();
  }, []);

  useEffect(() => {
    if (userRole === 'seller' && businessId) {
        fetchAllAds();
    }
  }, [userRole, businessId]);

  const fetchBusinessCategory = async () => {
    if (!apiClient) {
        showErrorToast('API client not initialized');
        return;
    }

    try {
    const response = await apiClient.get("api/business/my-businesses");
    if (response.data && response.data.length > 0) {
        setBusinesses(response.data);
        setBusinessId(response.data[0]._id);
        setBusinessName(response.data[0].businessName || '');
    }
    } catch (error: any) {
      console.error("Error fetching business category:", error);
      // If business category doesn't exist, user needs to create one 
      if (error.response?.status === 404) {
        showErrorToast('Please create a business profile first');
      } 
    } 
  }

  const fetchAllAds = async () => {
    if (!apiClient) {
        showErrorToast('API client not initialized');
        return;
    }

    if (!businessId) {
     console.log('No business ID available');
     return;
    }

    setLoading(true);
    try {
      const [vehicleResponse, propertyResponse] = await Promise.all([
        apiClient.get('/api/vehicles/ads/combined-vehicle', {
            params: { page: 1, limit: 10, businessId }
        }),
        apiClient.get('/api/property/ads/combined-property', {
            params: { page: 1, limit: 10, businessId },
        }),
      ]);

      setVehicleAds(vehicleResponse.data.data || []);
      setPropertyAds(propertyResponse.data.data || []);
    } catch (error: any) {
      console.error("Error fetching ads:", error);
      showErrorToast("Failed to fetch ads");
    } finally {
        setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllAds();
    setRefreshing(false);
  }, [businessId]);

  const handleRoleSwitch = async (value: boolean) => {
    if (!apiClient) {
        showErrorToast('API client not initialized');
        return;
    }

    const newRole = value ? 'seller' : 'buyer';
    setIsSwitchingRole(true);

    try {
     const response = await apiClient.patch('/api/profile/switch-role', {
       role: newRole,
     });

     if (response.data.role) {
        setUserRole(newRole);

        if (newRole === 'seller' && businessId) {
           await fetchAllAds();
        }

        // show success message 
        showSuccessToast(`Switched to ${newRole} mode`);
     }
    } catch (error: any) {
      console.error("Error switching role:", error);
      showErrorToast("Failed to switch role");
      // Revert the switch if failed 
      setUserRole(userRole);
    } finally {
        setIsSwitchingRole(false);
    }
  };

  const handleBusinessSwitch = (index: number) => {
    setSelectedBusinessIndex(index);
    setBusinessId(businesses[index]._id);
    // Fetch ads for the newly selected business 
    fetchAllAds();
  };

 
  const handleDeleteAd = async (adId: string, adType: 'vehicle' | 'property') => {
    console.log("Delete coming soon");
  };

  const handleViewDetails = (ad: Ad) => {
    setModalVisible(false);
    // navigate to details screen when ready 
    console.log('View details:', ad.adId);
  }

  const handleEditAd = (ad: Ad) => {
    setModalVisible(false);
    // Navigate to edit screen 
    console.log('Edit ad:', ad.adId);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#238E15';
      case 'pending': return '#FDBA40';
      case 'rejected': return '#CB0D0D';
      case 'sold': return '#000087';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderAdItem = ({ item }: { item: Ad }) => {
    const ad = activeTab === 'vehicle' ? item.vehicleAd : item.propertyAd;

    if (!ad) {
      console.log(`No ${activeTab} data for item:`, item.adId);
      return null;
    }

    // Determine ad type based on activeTab 
    const isVehicleAd = activeTab === 'vehicle';

    // Get images based on ActiveTab 
    let images: string[] = [];
    if (item.carAd) {
      if (isVehicleAd) {
        images = item.carAd.vehicleImage || [];
      } else {
        images = item.carAd.propertyImage || [];
      }
    }

    console.log(`${activeTab} Ad ${item.adId} - Images:`, images);

    // Get title based on ad type 
    const title = isVehicleAd 
       ? `${ad.vehicleType || ''} ${ad.model || ''} ${ad.year || ''}`.trim()
       : ad.propertyName || 'Property';
    
    const adType = isVehicleAd ? 'vehicle' : 'property';
    const description = ad.description || '';
    const location = item.carAd?.location || 'Location not specified';

    return (
     <View style={styles.adCard}>
       {images.length > 0  && (
        <View>
           <Image 
             source={{ uri: images[0] }}
             style={styles.adImage}
             resizeMode="cover"
           />
           {/* Plan Badge Overlay */}
           <View style={styles.planBadge}>
            <Image 
              source={require('../../../assets/images/prem.png')}
              style={styles.planBadgeIcon}
            />
             <Text style={styles.planBadgeText}>
               {ad.plan?.toUpperCase() || 'FREE'}
             </Text>
           </View>
        </View>
       )}

       <View style={styles.adContent}>
          <View style={styles.adHeader}>
           <Text style={styles.adPrice}>₦{ad.amount.toLocaleString()}</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedAd({ ...item, adType } as any);
                setModalVisible(true);
              }}
              style={styles.menuButton}
            >
             <Text style={styles.menuIcon}>⋮</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.adTitle} numberOfLines={1}>{title}</Text>
          
          <Text style={styles.adDescription} numberOfLines={2}>{description}</Text>

          <View style={styles.adDetails}>
            <View style={styles.locationContainer}>
                <Image 
                  source={require('../../../assets/images/location.png')}
                />
                <Text style={styles.locationText}>{item.carAd.location}</Text>
            </View>
            {item.vehicleAd && (
                <View style={styles.specContainer}>
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.transmission}</Text>
                  </View>
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.fuel}</Text>
                  </View>
                </View>
            )}
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
              {(() => {
                let statusIcon;

                if (ad.isDraft) {
                  statusIcon = require('../../../assets/images/rejected.png');
                } else if (ad.status === 'approved') {
                  statusIcon = require('../../../assets/images/approved.png');
                } else if (ad.status === 'pending') {
                   statusIcon = require('../../../assets/images/timer1.png');
                } else if (ad.status === 'rejected') {
                   statusIcon = require('../../../assets/images/rejected.png');
                } else if (ad.status === 'sold') {
                  statusIcon = require('../../../assets/images/tick-circle.png');
                } else {
                  statusIcon = require('../../../assets/images/timer1.png');
                }

                return (
                  <Image 
                   source={statusIcon}
                   style={{ width: 16, height: 16, marginRight: 4 }}
                  />
                );
              })()}
                <Text
                  style={[
                    styles.statusText,
                    { color: ad.isDraft ? '#6B7280' : getStatusColor(ad.status) }
                  ]}
                >
                 {ad.isDraft ? 'Draft' : getStatusText(ad.status)}
                </Text>
              </View>
            </View>
          </View>
       </View>
     </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Image source={require('../../../assets/images/emptyBusiness.png')} />
      </View>
      <Text style={styles.emptyText}>No ads posted yet</Text>
    </View>
  );

  const currentAds = activeTab === 'vehicle' ? vehicleAds : propertyAds;

  if (loading && !refreshing) {
    return (
     <View style={styles.activityIndicator}>
       <ActivityIndicator size="large" color={colors.blue} />
     </View>
    );
  };

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ads</Text>
          <TouchableOpacity onPress={() => router.push('/protected/myads/post-ad')} style={styles.postButton}>
            <View style={styles.postButtonInner}>
                <Image source={require("../../../assets/images/add-circle3.png")} style={styles.postButtonIcon} />
                  <Text style={styles.postButtonText}>Post an Ad</Text>
            </View>
          </TouchableOpacity>
        </View>

    
        <View style={styles.switchWrapper}>
          <View style={styles.switchContainer}>
            <Text style={[
            styles.switchLabel,
            { color: userRole === 'buyer' ? colors.darkGray : colors.border}
            ]}>
              I am buying
            </Text>
            <Switch
              value={userRole === 'seller'}
              onValueChange={handleRoleSwitch}
              trackColor={{ false: '#D1D5D8', true: colors.blue}}
              thumbColor={colors.bg}
              disabled={isSwitchingRole}
            />
            <Text style={[
               styles.switchLabel,
               { color: userRole === 'seller' ? colors.darkGray : colors.border } 
            ]}>
              I am selling
            </Text>
          </View>
        </View>

        {/* Ads List */}
        {userRole === 'seller' ? (
          businessId ? (
            <>
         <View style={styles.businessHeader}>
           <View style={styles.businessScrollWrapper}>
             <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.businessContainer}>
            {businesses.map((business, index) => (
              <TouchableOpacity
               key={business._id}
               style={[
                styles.businessNameWrapper,
                selectedBusinessIndex === index && styles.selectedBusiness
               ]}
               onPress={() => handleBusinessSwitch(index)}
             >
              <Text
                style={[
                  styles.businessName,
                  selectedBusinessIndex === index && styles.selectedBusinessText
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {business.businessName} ({selectedBusinessIndex === index ? currentAds.length : '...'})
              </Text>
             </TouchableOpacity>
            ))}
         </ScrollView>
           </View>
         </View>

            
              {vehicleAds.length > 0 && propertyAds.length > 0 && (
                <View style={styles.tabContainer}>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'vehicle' && styles.activeTab]}
                    onPress={() => setActiveTab('vehicle')}
                  >
                    <Text style={[styles.tabText, activeTab === 'vehicle' && styles.activeTabText]}>
                      Vehicle Ads ({vehicleAds.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'property' && styles.activeTab]}
                    onPress={() => setActiveTab('property')}
                  >
                    <Text style={[styles.tabText, activeTab === 'property' && styles.activeTabText]}>
                      Property Ads ({propertyAds.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <FlatList
               data={currentAds}
               renderItem={renderAdItem}
               keyExtractor={(item) => item.adId}
               contentContainerStyle={styles.listContainer}
               ListEmptyComponent={renderEmptyState}
               refreshControl={
                  <RefreshControl
                     refreshing={refreshing}
                     onRefresh={onRefresh}
                     tintColor={colors.blue}
                  />
               }
               showsVerticalScrollIndicator={false}
              />
            </>
          ): (
            <View style={styles.emptyContainer}>
              <Image 
                source={require('../../../assets/images/emptyBusiness.png')}
                style={styles.emptyImage}
                resizeMode='contain'
              />
              <Text style={styles.switchMessage}>
                No Business Added Yet
              </Text>

              <LinearGradient 
                colors={['#00A8DF', '#1031AA']}
                start={{x: 0, y: 0}}
                end={{ x: 1, y: 0 }}
                style={styles.gradientContainer}
              >
               <TouchableOpacity 
                 style={styles.createButton} 
                 onPress={() => router.push('/protected/profile/AddBusiness')}
                 activeOpacity={0.8}
                 >
                 <View style={styles.btnRow}>
                  <Image 
                    source={require('../../../assets/images/add-circle3.png')}
                  />
                  <Text style={styles.createButtonText}>Create Business</Text>
                 </View>
               </TouchableOpacity>
              </LinearGradient>
            </View>
          )
        ): (
         <View style={styles.emptyContainer}>
            <Text style={styles.switchMessage}>
             Switch to selling mode to view your ads
            </Text>
         </View>
        )}

        {/* Action Modal */ }
        <Modal 
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
         <TouchableOpacity
           style={styles.modalOverlay}
           activeOpacity={1}
           onPress={() => setModalVisible(false)}
         >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Actions</Text>
             
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => selectedAd && handleViewDetails(selectedAd)}
            >
             <AntDesign
              name="eye"
              size={20}
              color={colors.darkGray}
             />
             <Text style={styles.modalOptionText}>View details</Text>
            </TouchableOpacity>

            {(() => {
               const currentAd = activeTab === 'vehicle'
                ? selectedAd?.vehicleAd
                : selectedAd?.propertyAd

                if (!currentAd) return null;
              
                const status = currentAd.status;
                const isDraft = currentAd.isDraft === true;

                // Draft: show complete draft + delete 
                if (isDraft) {
                  return (
                    <>
                      <TouchableOpacity 
                      style={styles.modalOption}
                       onPress={() => {
                        console.log("Complete draft clicked");
                       }}
                      >
                       <AntDesign name="form" size={20} color={colors.darkGray} />
                       <Text style={styles.modalOptionText}>Complete Draft</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                          setModalVisible(false);
                          handleDeleteAd(selectedAd?.adId || '', (selectedAd as any).adType);
                        }}
                      >
                       <AntDesign name="delete" size={20} color="#CB0D0D" />
                       <Text style={[styles.modalOptionText, styles.deleteText]}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  );
                }

                // Rejected: Show resubmit + Delete 
                if (status === 'rejected') {
                  return (
                    <>
                     <TouchableOpacity
                       style={styles.modalOption}
                       onPress={() => {
                        setModalVisible(false);
                        // Navigate to edit/resubmit
                       }}
                     >
                      <AntDesign name="reload" size={20} colors={colors.darkGray} />
                      <Text style={styles.modalOptionText}>Resubmit</Text>
                     </TouchableOpacity>

                     <TouchableOpacity
                       style={styles.modalOption}
                       onPress={() => {
                         setModalVisible(false);
                         handleDeleteAd(selectedAd?.adId || '', (selectedAd as any).adType);
                       }}
                     >
                      <AntDesign name="delete" size={20} color="#CB0D0D" />
                      <Text style={[styles.modalOptionText, styles.deleteText]}>Delete</Text>
                     </TouchableOpacity>
                    </>
                  );
                }

                //Pending or Approved: Show Delete only 
                if (status === 'pending' || status === 'approved') {
                  return (
                   <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                     setModalVisible(false);
                     handleDeleteAd(selectedAd?.adId || '', (selectedAd as any).adType);
                   }}>
                   <AntDesign name="delete" size={20} color="#CB0D0D" />
                   <Text style={[styles.modalOptionText, styles.deleteText]}>Delete</Text>
                   </TouchableOpacity>
                  );
                }

                // Sold: Only View Details (already shown above, so returning null)
                if(status === 'sold') {
                  return null;
                }
            })()}
          </View>
         </TouchableOpacity>
       </Modal>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkShadeBlack,
    fontFamily: 'WorkSans_700Bold'
  },
  postButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderColor: colors.lightSpot
  },
  postButtonInner: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 8
  },
  postButtonIcon: {
   width: 20,
   height: 20,
   marginRight: 6
  },
  postButtonText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  switchWrapper: {
   paddingHorizontal: 16,
   marginTop: -4,
   marginBottom: 8,
   alignItems: 'flex-start',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  
businessHeader: {
  alignItems: 'center',
  marginVertical: 10,
},

businessScrollWrapper: {
   width: '90%',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#DDDDDD',
  backgroundColor: '#EDEDED',
  overflow: 'hidden',
},

businessContainer: {
 flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 8,
},

businessNameWrapper: {
 backgroundColor: '#DFDFF9',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 6,
  maxWidth: 180,
  marginRight: 8,
},

selectedBusiness: {
  backgroundColor: colors.blue,
},

selectedBusinessText: {
    color: colors.bg
},
 
businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkShadeBlack,
    fontFamily: 'WorkSans_600SemiBold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.blue,
    fontFamily: 'WorkSans_500Medium',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
  },
  activeTabText: {
    color: colors.bg,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  adCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 10,
  },
  adImage: {
    width: 140,
    height: 110,
    borderRadius: 8,
    marginRight: 12,
  },
  planBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planBadgeIcon: {
    // width: 14,
    // height: 14,
  },
  planBadgeText: {
    color: colors.bg,
    fontSize: 10,
    fontFamily: 'WorkSans_600SemiBold',
    textTransform: 'uppercase'
  },
  adContent: {
    flex: 1,
    paddingTop: 4,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4, 
  },
  adTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 4, 
  },

  adDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.grey300,
    fontFamily: 'WorkSans_400Regular',
    marginBottom: 8,
    lineHeight: 16,
  },
  menuButton: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  adPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.blue,
    fontFamily: 'WorkSans_500Medium'
  },
  adDetails: {
    marginBottom: 8, 
  },
  locationContainer: {
     flexDirection: 'row',
      gap: 6,
       marginBottom: 6, 
       justifyContent: 'flex-start',
       alignItems: 'center',
  },
  locationText: {
   color: colors.grey300,
   fontWeight: '400',
   fontFamily: 'WorkSans_400Regular',
   fontSize: 12,
  },
 
  specContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  specBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.greyBlue,
    borderRadius: 4,
  },
  specText: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.darkGray,
    fontFamily: 'WorkSans_400Regular',
  },
  adLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  adSpec: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'WorkSans_500Medium'
  },
  soldBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soldText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyImage: {
   width: 180,
   height: 180,
   marginBottom: 20,
  },
  switchMessage: {
    color: colors.lightGrey,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  gradientContainer: {
     borderRadius: 8,
     overflow: 'hidden',
     width: '60%',
     marginTop: 20,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createButton: {
   alignItems: 'center',
   justifyContent: 'center',
   paddingVertical: 14,
  },
  createButtonText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: "10",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray,
  },
  deleteText: {
    color: '#CB0D0D',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold'
  },
});

export default MyAds;