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
 ScrollView
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/app/constants/theme';
import { MyAdsProps } from '@/app/types/myAds.types';
import { useAuth } from '@/app/context/AuthContext';
import { AntDesign } from '@expo/vector-icons';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ad } from '@/app/types/ad.types';


const MyAds: React.FC<MyAdsProps> = ({loading: initialLoading }) => {
  const { user, token } = useAuth();
  const [vehicleAds, setVehicleAds] = useState<Ad[]>([]);
  const [propertyAds, setPropertyAds] = useState<Ad[]>([]);
  const [agricultureAds, setAgricultureAds] = useState<Ad[]>([]);
  const [equipmentAds, setEquipmentAds] = useState<Ad[]>([]);
  const [gadgetAds, setGadgetAds] = useState<Ad[]>([]);
  const [laptopAds, setLaptopAds] = useState<Ad[]>([]);
  const [fashionAds, setFashionAds] = useState<Ad[]>([]);
  const [householdAds, setHouseholdAds] = useState<Ad[]>([]);
  const [constructionAds, setConstructionAds] = useState<Ad[]>([]);
  const [petAds, setPetAds] = useState<Ad[]>([]);
  const [kidAds, setKidAds] = useState<Ad[]>([]);
  const [jobAds, setJobAds] = useState<Ad[]>([]);
  const [hireAds, setHireAds] = useState<Ad[]>([]);
  const [beautyAds, setBeautyAds] = useState<Ad[]>([]);
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
  const [activeTab, setActiveTab] = useState<'vehicle' | 'property' | 'agriculture' | 'equipment' | 'gadget' | 'laptop' | 'fashion' | 'household' | 'construction' | 'pet' | 'kid' | 'job' | 'hire' | 'beauty'>('vehicle');
  
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
      const [vehicleResponse, 
        propertyResponse, 
        agricultureResponse, 
        equipmentResponse, 
        gadgetResponse, 
        laptopResponse, 
        fashionResponse, 
        householdResponse,
        constructionResponse,
        petResponse,
        kidResponse,
        jobResponse,
        hireResponse,
        beautyReasponse,
      ] = await Promise.all([
        apiClient.get('/api/vehicles/ads/combined-vehicle', {
            params: { page: 1, limit: 10, businessId }
        }),
        apiClient.get('/api/property/ads/combined-property', {
            params: { page: 1, limit: 10, businessId },
        }),
        apiClient.get('/api/agriculture/ads/combined-agriculture', {
          params: { page: 1, limit: 10, businessId },
        }),
        apiClient.get('/api/equipments/ads/combined-equipment', {
          params: { page: 1, limit: 10, businessId },
        }),
        apiClient.get('/api/gadget/ads/combined-gadget', { 
          params: { page: 1, limit: 10, businessId },
        }),
        apiClient.get('/api/laptops/ads/combined-laptop', {
          params: { page: 1, limit: 10, businessId },
        }),
        apiClient.get('/api/fashion/ads/combined-fashion', {
          params: { page: 1, limit: 10, businessId },
        }),
        apiClient.get('/api/household/ads/combined-household', {
          params: { page: 1, limit: 10, businessId }
        }),
        apiClient.get('/api/construction/ads/combined-construction', {
          params: { page: 1, limit: 10, businessId },
        }),
        apiClient.get('/api/pets/ads/combined-pets', {
          params: { page: 1, limit: 10, businessId }
        }),
        apiClient.get('/api/kids/ads/combined-kids', {
           params: { page: 1, limit: 10, businessId }
        }),
        apiClient.get('/api/jobs/ads/combined-job', {
          params: { page: 1, limit: 10, businessId }
        }),
        apiClient.get('/api/hire/ads/combined-hire', {
           params: { page: 1, limit: 10, businessId }
        }),
        apiClient.get('/api/beauty/ads/combined-beauty', {
           params: { page: 1, limit: 10, businessId }
        }),
      ]);

      setVehicleAds(vehicleResponse.data.data || []);
      setPropertyAds(propertyResponse.data.data || []);
      setAgricultureAds(agricultureResponse.data.data || []);
      setEquipmentAds(equipmentResponse.data.data || []);
      setGadgetAds(gadgetResponse.data.data || []);
      setLaptopAds(laptopResponse.data.data || []);
      setFashionAds(fashionResponse.data.data || []);
      setHouseholdAds(householdResponse.data.data || []);
      setConstructionAds(constructionResponse.data.data || []);
      setPetAds(petResponse.data.data || []);
      setKidAds(kidResponse.data.data || []);
      setJobAds(jobResponse.data.data || []);
      setHireAds(hireResponse.data.data || []);
      setBeautyAds(beautyReasponse.data.data || []);
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

  const handleViewDetails = (ad: Ad) => {
    setModalVisible(false);
   
    const adType = activeTab;
    const adId = adType === 'vehicle'
       ? ad.vehicleAd?._id
       : adType === 'property'
       ? ad.propertyAd?._id
       : adType === 'agriculture'
       ? ad.agricultureAd?._id
       : adType === 'equipment'
       ? ad.equipmentAd?._id
       : adType === 'gadget'
       ? ad?.gadgetAd?._id
       : adType === 'laptop'
       ? ad?.laptopAd?._id
       : adType === 'fashion'
       ? ad?.fashionAd?._id
       : adType === 'household' 
       ? ad?.householdAd?._id
       : adType === 'construction'
       ? ad?.constructionAd?._id
       : adType === 'pet'
       ? ad?.petAd?._id
       : adType === 'kid'
       ? ad?.kidAd?._id
       : adType === 'job'
       ? ad?.jobAd?._id
       : adType === 'hire'
       ? ad?.hireAd?._id 
       : ad?.beautyAd?._id
       

    const carAdId = ad.carAd?._id;

    router.push({
      pathname: '/protected/myads/ad-details',
      params: {
        adId,
        adType,
        carAdId
      }
    });
  }

   const handleDeleteAd = async (carAdId: string, adType: string) => {
       if (!apiClient) {
         showErrorToast('API client not initialized');
         return;
       }

       try {
        let endpoint = '';
        switch (adType) {
          case 'vehicle': 
           endpoint = `/api/vehicles/delete-vehicles/${carAdId}`;
           break;
          case 'property': 
            endpoint = `/api/property/delete-property/${carAdId}`;
            break;
          case 'equipment': 
            endpoint = `/api/equipments/delete-equipment/${carAdId}`;
            break;
          case 'gadget': 
           endpoint = `/api/gadget/delete-gadget/${carAdId}`;
           break;
          case 'fashion': 
           endpoint = `/api/fashion/delete-fashion/${carAdId}`;
           break;
          case 'household': 
            endpoint = `/api/household/delete-household/${carAdId}`;
            break;
          case 'construction': 
            endpoint = `/api/construction/delete-construction/${carAdId}`;
            break;
          case 'pet': 
            endpoint = `/api/kids/delete-kid/${carAdId}`;
            break;
          case 'job': 
            endpoint = `/api/jobs/delete-job/${carAdId}`;
            break;
          case 'hire': 
           endpoint = `/api/hire/delete-hire/${carAdId}`;
           break;
          case 'beauty': 
            endpoint = `/api/beauty/delete-beauty/${carAdId}`;
            break;
          default: 
           showErrorToast('Invalid ad type');
           return;
        }

        // Delete the ad 
        const response = await apiClient.delete(endpoint);

        if (response.data.success) {
          showSuccessToast('Ad deleted successfully');
          await fetchAllAds();
        }
       } catch (error: any) {
         console.error('Error deleting ad:', error);
         showErrorToast(error.response?.data?.message || 'Failed to delete ad');
       }
    };

    const handleDeleteCarAd = async (carAdId: string) => {
      if (!apiClient) {
        showErrorToast('API client not initialized');
        return;
      }

      try {
       const response = await apiClient.delete(`/api/carAdd/delete-car-ad/${carAdId}`);

       if (response.data.success) {
        showSuccessToast('Ad images deleted successfully');
        await fetchAllAds();
       }
      } catch (error: any) {
        console.error('Error deleting car ad:', error);
        showErrorToast(error.response?.data?.message || 'Failed to delete ad images');
      }
    };


    const handleMarkAsSold = async (carAdId: string, adType: string) => {
       if (!apiClient) {
        showErrorToast('API client not initialized');
        return;
       }

       // Validation 
       if (!carAdId) {
        showErrorToast('Car Ad ID not found');
        return;
       }

       try {
       let endpoint = '';
       switch (adType) {
        case 'vehicle': 
          endpoint = `/api/vehicles/mark-vehicle-as-sold/${carAdId}`;
          break;
        case 'property': 
          endpoint = `/api/property/mark-property-as-sold/${carAdId}`;
          break;
        case 'agriculture': 
          endpoint = `/api/agriculture/mark-agriculture-as-sold/${carAdId}`;
          break;
        case 'equipment': 
          endpoint =  `/api/equipments/mark-equipment-ad-as-sold/${carAdId}`;
          break;
        case 'gadget': 
          endpoint = `/api/gadget/mark-gadget-ad-as-sold/${carAdId}`;
          break;
        case 'laptop': 
          endpoint = `/api/laptops/mark-laptop-ad-as-sold/${carAdId}`;
          break;
        case  'fashion': 
          endpoint = `/api/fashion/mark-fashion-ad-as-sold/${carAdId}`;
          break;
        case 'household': 
           endpoint = `/api/household/mark-household-ad-as-sold/${carAdId}`;
           break;
        case 'construction': 
          endpoint = `/api/construction/mark-construction-ad-as-sold/${carAdId}`;
          break;
        case 'pet': 
           endpoint = `/api/pets/mark-pet-as-sold/${carAdId}`;
           break;
        case 'kid': 
          endpoint = `/api/kids/mark-kid-ad-as-sold/${carAdId}`;
          break;
        case 'job': 
          endpoint = `/api/jobs/mark-job-ad-as-sold/${carAdId}`;
          break;
        case 'hire': 
          endpoint = `/api/hire/mark-hire-ad-as-sold/${carAdId}`;
          break;
        case 'beauty': 
          endpoint = `/api/beauty/mark-beauty-ad-as-sold/${carAdId}`;
          break;
         default: 
          showErrorToast('Invalid ad type');
          return;
       }

       // Mark as sold 
       const response = await apiClient.patch(endpoint);

       if (response.data.success) {
        showSuccessToast(
          adType === 'job'
           ? 'Job marked as closed successfully'
           : 'Ad marked as sold successfully'
        );
        await fetchAllAds();
       }
       } catch (error: any) {
         console.error('Error marking ad as sold:', error);
         showErrorToast(error.response?.data?.message || 'Failed to mark ad as sold');
       }
    };


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
      default: return '#B532B7';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderAdItem = ({ item }: { item: Ad }) => {
    const ad = activeTab ===  'vehicle' 
     ? item.vehicleAd 
     : activeTab === 'property'
     ? item.propertyAd
     : activeTab === 'agriculture'
     ? item.agricultureAd
     : activeTab === 'equipment'
     ? item.equipmentAd
     : activeTab === 'gadget'
     ? item.gadgetAd
     : activeTab === 'laptop'
     ? item.laptopAd
     : activeTab === 'fashion'
     ? item.fashionAd
     : activeTab === 'household'
     ? item.householdAd
     : activeTab === 'construction'
     ? item.constructionAd
     : activeTab === 'pet'
     ? item.petAd
     : activeTab === 'kid'
     ? item.kidAd
     : activeTab === 'job'
     ? item.jobAd
     : activeTab === 'hire'
     ? item.hireAd
     : item.beautyAd


    if (!ad) {
      console.log(`No ${activeTab} data for item:`, item.adId);
      return null;
    }

    // Determine ad type based on activeTab 
    const isVehicleAd = activeTab === 'vehicle';
    const isPropertyAd = activeTab === 'property';
    const isAgricultureAd = activeTab === 'agriculture';
    const isEquipmentAd = activeTab === 'equipment';
    const isGadgetAd = activeTab === 'gadget';
    const isLaptopAd = activeTab === 'laptop';
    const isFashionAd = activeTab === 'fashion';
    const isHouseholdAd = activeTab === 'household';
    const isConstructionAd = activeTab === 'construction';
    const isPetAd = activeTab === 'pet';
    const isKidAd = activeTab === 'kid';
    const isJobAd = activeTab === 'job';
    const isHireAd = activeTab === 'hire';
    const isBeautyAd = activeTab === 'beauty';

    // Get images based on ActiveTab 
    let images: string[] = [];
    if (item.carAd) {
      if (isVehicleAd) {
        images = item.carAd.vehicleImage || [];
      } else if (isPropertyAd) {
         images = item.carAd.propertyImage || [];
      } else if (isAgricultureAd) {
        images = item.carAd.agricultureImage || [];
      } else if (isEquipmentAd) {
        images = item.carAd.equipmentImage || [];
      } else if (isGadgetAd) {
        images = item.carAd.gadgetImage || [];
      } else if (isLaptopAd) {
        images = item.carAd.laptopImage || [];
      } else if (isFashionAd) {
        images = item.carAd.fashionImage || [];
      } else if (isHouseholdAd) {
        images = item.carAd.householdImage || [];
      } else if (isConstructionAd) {
        images = item.carAd.constructionImage || [];
      } else if (isPetAd) {
        images = item.carAd.petsImage || [];
      } else if (isKidAd) {
        images = item.carAd.kidsImage || [];
      } else if (isJobAd) {
        images = item.carAd.jobImage || [];
      } else if (isHireAd) {
        images = item.carAd.hireImage || [];
      } else if (isBeautyAd) {
        images = item.carAd.beautyImage || [];
      }
    }


    // Get title based on ad type 
    const title = isVehicleAd 
       ? `${ad.vehicleType || ''} ${ad.model || ''} ${ad.year || ''}`.trim()
       : isPropertyAd 
       ?  ad.propertyName || 'Property'
       : isAgricultureAd 
       ? ad.title || 'Agriculture Product'
       : isEquipmentAd 
       ? ad.equipmentTitle || 'Equipment Product'
       : isGadgetAd 
       ? ad.gadgetTitle || 'Gadget Product'
       : isLaptopAd 
       ? ad.laptopTitle || 'Laptop Product'
       : isFashionAd
       ? ad.fashionTitle || 'Fashion Product'
       : isHouseholdAd 
       ? ad.householdTitle || 'Household Product'
       : isConstructionAd
       ? ad.constructionTitle || 'Construction Product'
       : isPetAd 
       ? ad.petType || 'Pet Product'
       : isKidAd 
       ? ad.title || 'Kid product' 
       : isJobAd 
       ? ad.jobTitle || 'Job Product'
       : isHireAd
       ? ad.hireTitle || 'Hire Product'
       : ad.beautyTitle || 'Beauty Product';

    
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
           <Text style={styles.adPrice}>
              ₦{(ad.amount || ad.salaryRange || 0).toLocaleString()}
           </Text>
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

            {/* Property Specs */}
            {item.propertyAd && (
              <View style={styles.specContainer}>
                {ad.ownershipStatus && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.ownershipStatus}</Text>
                  </View>
                )}

                {ad.parking && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.parking}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Agriculture specs */}
            {item.agricultureAd && (
              <View style={styles.specContainer}>
                {ad.agricultureType && ad.agricultureType.length > 0 && ad.agricultureType[0] && (
                 <View style={styles.specBadge}>
                  <Text style={styles.specText}>{ad.agricultureType[0]}</Text>
                 </View>
                )}

                {ad.unit && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.unit}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Equipment spect */}
            {item.equipmentAd && (
              <View style={styles.specContainer}>
                {ad.condition && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.condition}</Text>
                  </View>
                )}

                {ad.powerSource && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.powerSource}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Gadget Specs */}
            {item.gadgetAd && (
              <View style={styles.specContainer}>
                {ad.condition && (
                 <View style={styles.specBadge}>
                   <Text style={styles.specText}>{ad.condition}</Text>
                 </View>
                )}
                {ad.gadgetBrand && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.gadgetBrand}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Laptop Specs */}
            {item.laptopAd && (
            <View style={styles.specContainer}>
              {ad.condition && (
                <View style={styles.specBadge}>
                  <Text style={styles.specText}>{ad.condition}</Text>
                </View>
              )}
              {ad.laptopType && (
                <View style={styles.specBadge}>
                  <Text style={styles.specText}>{ad.laptopType}</Text>
                </View>
              )}
            </View>
            )}

            {/* Fashion Specs */}
            {item.fashionAd && (
              <View style={styles.specContainer}>
                {ad.condition && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.condition}</Text>
                  </View>
                )}
                {ad.fashionType && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.fashionType}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Household Specs */}
            {item.householdAd && (
              <View style={styles.specContainer}>
                {ad.householdType && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.householdType}</Text>
                   </View>
                )}
                {ad.condition && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.condition}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Construction Specs */}
            {item.constructionAd && (
              <View style={styles.specContainer}>
                {ad.constructionType && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.constructionType}</Text>
                   </View>
                )}
                {ad.condition && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.condition}</Text>
                   </View>
                )}
               </View>
            )}

            {/* Pet Specs */}
            {item.petAd && (
              <View style={styles.specContainer}>
                {ad.breed && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.breed}</Text>
                  </View>
                )}
                {ad.gender && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.gender}</Text>
                  </View>
                )}
               </View>
            )}

            {/* Kids Spec */}
            {item.kidAd && (
              <View style={styles.specContainer}>
                {ad.condition && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.condition}</Text>
                  </View>
                )}
                {ad.gender && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.gender}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Job Specs */}
            {item.jobAd && (
              <View style={styles.specContainer}>
                {ad.jobType && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.jobType}</Text>
                  </View>
                )}
                {ad.yearOfExperience && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.yearOfExperience}</Text>
                   </View>
                )}
              </View>
            )}

            {/* Hire Specs */}
            {item.hireAd && (
              <View style={styles.specContainer}>
                {ad.jobType && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.jobType}</Text>
                   </View>
                )}
                {ad.workMode && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.workMode}</Text>
                  </View>
                )}
               </View>
            )}

            {/* Job Specs */}
            {item.hireAd && (
              <View style={styles.specContainer}>
                {ad.condition && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.condition}</Text>
                  </View>
                )}
                {ad.gender && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>{ad.gender}</Text>
                  </View>
                )}
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
                  statusIcon = require('../../../assets/images/draft-icon.png');
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
                    { color: ad.isDraft ? '#B532B7' : getStatusColor(ad.status) }
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

  const currentAds = activeTab ===  'vehicle'
     ? vehicleAds
     : activeTab === 'property'
     ? propertyAds
     : activeTab === 'agriculture'
     ? agricultureAds
     : activeTab === 'equipment'
     ? equipmentAds
     : activeTab === 'gadget'
     ?  gadgetAds
     : activeTab === 'laptop'
     ? laptopAds
     : activeTab === 'fashion'
     ? fashionAds
     : activeTab === 'household'
     ? householdAds
     : activeTab === 'construction'
     ? constructionAds
     : activeTab === 'pet'
     ? petAds
     : activeTab === 'kid'
     ? kidAds
     : activeTab === 'job'
     ? jobAds
     : activeTab === 'hire'
     ? hireAds
     : beautyAds

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

    
        {/* <View style={styles.switchWrapper}>
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
        </View> */}

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

            
             {(vehicleAds.length > 0 || propertyAds.length > 0 ||  
              agricultureAds.length > 0 ||  
              equipmentAds.length > 0 || 
              gadgetAds.length > 0 ||   
              laptopAds.length > 0 ||  
              fashionAds.length > 0 ||
               householdAds.length > 0 || 
               constructionAds.length > 0 || 
               petAds.length > 0 ||
               kidAds.length > 0 ||
               jobAds.length > 0 || 
               hireAds.length > 0 || 
                beautyAds.length > 0) && (
                <ScrollView 
                 horizontal
                 showsHorizontalScrollIndicator={false}
                 contentContainerStyle={styles.tabContainer}>
                 {vehicleAds.length > 0 && (
                   <TouchableOpacity 
                    style={[styles.tab, activeTab === 'vehicle' && styles.activeTab]}
                    onPress={() => setActiveTab('vehicle')}
                  >
                    <Text style={[styles.tabText, activeTab === 'vehicle' && styles.activeTabText]}>
                      Vehicle Ads ({vehicleAds.length})
                    </Text>
                  </TouchableOpacity>
                 )}
                
                {propertyAds.length > 0 && (
                   <TouchableOpacity 
                    style={[styles.tab, activeTab === 'property' && styles.activeTab]}
                    onPress={() => setActiveTab('property')}
                  >
                    <Text style={[styles.tabText, activeTab === 'property' && styles.activeTabText]}>
                      Property Ads ({propertyAds.length})
                    </Text>
                  </TouchableOpacity>
                )}

                {agricultureAds.length > 0 && (
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'agriculture' && styles.activeTab]}
                    onPress={() => setActiveTab('agriculture')}>
                   <Text style={[styles.tabText, activeTab === 'agriculture' && styles.activeTabText]}>
                     Agriculture ({agricultureAds.length})
                   </Text>
                   </TouchableOpacity>
                  )}

                  {equipmentAds.length > 0 && (
                    <TouchableOpacity
                      style={[styles.tab, activeTab === 'equipment' && styles.activeTab]}
                      onPress={() => setActiveTab('equipment')}
                    >
                      <Text 
                       style={[styles.tabText, activeTab === 'equipment' && styles.activeTabText]}>
                         Equipment ({equipmentAds.length})
                      </Text>
                    </TouchableOpacity>
                  )}

                  {gadgetAds.length > 0 && (
                    <TouchableOpacity
                      style={[styles.tab, activeTab === 'gadget' && styles.activeTab]}
                      onPress={() => setActiveTab('gadget')}
                    > 
                     <Text style={[styles.tabText, activeTab === 'gadget' && styles.activeTabText]}>
                       Gadget ({gadgetAds.length})
                     </Text>
                    </TouchableOpacity>
                  )}

                  {laptopAds.length > 0 && (
                    <TouchableOpacity
                      style={[styles.tab, activeTab === 'laptop' && styles.activeTab]}
                      onPress={() => setActiveTab('laptop')}
                    >
                     <Text style={[styles.tabText, activeTab === 'laptop' && styles.activeTabText]}>
                      Laptop ({laptopAds.length})
                     </Text>
                    </TouchableOpacity>
                  )}

                  {fashionAds.length > 0 && (
                     <TouchableOpacity
                       style={[styles.tab, activeTab === 'fashion' && styles.activeTab]}
                       onPress={() => setActiveTab('fashion')}
                     >
                      <Text style={[styles.tabText, activeTab === 'fashion' && styles.activeTabText]}>
                        Fashion  ({fashionAds.length})
                      </Text>
                     </TouchableOpacity>
                  )}

                  {householdAds.length > 0 && (
                    <TouchableOpacity
                      style={[styles.tab, activeTab === 'household' && styles.activeTab]}
                      onPress={() => setActiveTab('household')}
                    >
                     <Text 
                      style={[styles.tabText, activeTab === 'household' && styles.activeTabText]}>
                       Household ({householdAds.length})
                     </Text>
                    </TouchableOpacity>
                  )}

                  {constructionAds.length > 0 && (
                    <TouchableOpacity
                      style={[styles.tab, activeTab === 'construction' && styles.activeTab]}
                      onPress={() => setActiveTab('construction')}
                    >
                     <Text 
                       style={[styles.tabText, activeTab === 'construction' && styles.activeTabText]}
                     >
                      Construction ({constructionAds.length})
                     </Text>
                    </TouchableOpacity>
                  )}

                  {petAds.length > 0 && (
                    <TouchableOpacity
                      style={[styles.tab, activeTab === 'pet' && styles.activeTab]}
                      onPress={() => setActiveTab('pet')}
                    >
                    <Text 
                      style={[styles.tabText, activeTab === 'pet' && styles.activeTabText]}
                    >
                       Pet ({petAds.length})
                    </Text>
                    </TouchableOpacity>
                  )}

                  {kidAds.length > 0 && ( 
                    <TouchableOpacity
                       style={[styles.tab, activeTab === 'kid' && styles.activeTab]}
                      onPress={() => setActiveTab('kid')}
                    >
                     <Text
                      style={[styles.tabText, activeTab === 'kid' && styles.activeTabText]}
                     >
                       Kid ({kidAds.length})
                     </Text>
                    </TouchableOpacity>
                  )}

                  {jobAds.length > 0 && (
                    <TouchableOpacity
                       style={[styles.tab, activeTab === 'job' && styles.activeTab]}
                      onPress={() => setActiveTab('job')}
                    >
                     <Text
                      style={[styles.tabText, activeTab === 'job' && styles.activeTabText]}
                     >
                       Job ({jobAds.length})
                     </Text>
                    </TouchableOpacity>
                  )}

                  {hireAds.length > 0 && (
                    <TouchableOpacity
                      style={[styles.tab, activeTab === 'hire' && styles.activeTab]}
                      onPress={() => setActiveTab('hire')}
                    >
                     <Text
                      style={[styles.tabText, activeTab === 'hire' && styles.activeTabText]}
                     >
                      Hire ({hireAds.length})
                     </Text>
                    </TouchableOpacity>
                  )}

                  {beautyAds.length > 0 && (
                    <TouchableOpacity
                     style={[styles.tab, activeTab === 'beauty' && styles.activeTab]}
                     onPress={() => setActiveTab('beauty')}
                    >
                     <Text>
                      Beauty ({beautyAds.length})
                     </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
                
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

            <TouchableOpacity
              style={styles.modalOption}
              onPress={async () => {
                setModalVisible(false);
                const carAdId = selectedAd?.carAd?._id;
                if (carAdId) {
                  await handleDeleteCarAd(carAdId);
                } else { 
                  showErrorToast('No images to delete')
                }
              }}
            >
                <AntDesign name="picture" size={20} color={colors.darkGray} />
                <Text style={styles.modalOptionText}>Delete Images Only</Text>
            </TouchableOpacity>

            {(() => {
               const currentAd = activeTab === 'vehicle'
                ? selectedAd?.vehicleAd
                : activeTab === 'property'
                ? selectedAd?.propertyAd
                : activeTab === 'agriculture'
                ? selectedAd?.agricultureAd
                : activeTab === 'equipment'
                ? selectedAd?.equipmentAd
                : activeTab === 'gadget' 
                ? selectedAd?.gadgetAd
                : activeTab === 'laptop'
                ? selectedAd?.laptopAd
                : activeTab === 'fashion'
                ? selectedAd?.fashionAd
                : activeTab === 'household'
                ? selectedAd?.householdAd
                : activeTab === 'construction'
                ? selectedAd?.constructionAd
                : activeTab === 'kid'
                ? selectedAd?.kidAd 
                : activeTab === 'pet'
                ? selectedAd?.petAd
                : activeTab === 'job'
                ? selectedAd?.jobAd
                : activeTab === 'hire'
                ? selectedAd?.hireAd
                : selectedAd?.beautyAd
                

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
                          onPress={async () => {
                        setModalVisible(false);

                         const carAdId = selectedAd?.carAd?._id;

                         if (carAdId) {
                          await handleDeleteAd(carAdId, activeTab);
                         } else {
                          showErrorToast('Ad ID not found');
                         }

                         if (carAdId) {
                          await handleDeleteCarAd(carAdId);
                         }
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
                     >
                      <AntDesign name="reload" size={20} colors={colors.darkGray} />
                      <Text style={styles.modalOptionText}>Resubmit</Text>
                     </TouchableOpacity>

                     <TouchableOpacity
                    style={styles.modalOption}
                      onPress={async () => {
                        setModalVisible(false);

                         const carAdId = selectedAd?.carAd?._id;

                         if (carAdId) {
                          await handleDeleteAd(carAdId, activeTab);
                         } else {
                          showErrorToast('Ad ID not found');
                         }
                         
                         if (carAdId) {
                          await handleDeleteCarAd(carAdId);
                         }
                       }}
                    >
                   <AntDesign name="delete" size={20} color={colors.red} />
                   <Text style={[styles.modalOptionText, styles.deleteText]}>Delete</Text>
                   </TouchableOpacity>
                    </>
                  );
                }

                //Pending or Approved: Show Delete only 
                if (status === 'pending') {
                  return (
                   <TouchableOpacity
                    style={styles.modalOption}
                      onPress={async () => {
                        setModalVisible(false);

                         const carAdId = selectedAd?.carAd?._id;

                         if (carAdId) {
                          await handleDeleteAd(carAdId, activeTab);
                         } else {
                          showErrorToast('Ad ID not found');
                         }
                         
                         if (carAdId) {
                          await handleDeleteCarAd(carAdId);
                         }
                       }}
                    >
                   <AntDesign name="delete" size={20} color={colors.red} />
                   <Text style={[styles.modalOptionText, styles.deleteText]}>Delete</Text>
                   </TouchableOpacity>
                  );
                }

                if (status === 'approved') {
                  return (
                   <>
                  <TouchableOpacity
                   style={styles.modalOption}
                   onPress={async () => {
                    setModalVisible(false);

                    const carAdId = selectedAd?.carAd?._id;
    
                   if (carAdId) {
                    await handleMarkAsSold(carAdId, activeTab);
                  } else {
                    showErrorToast('Ad ID not found');
                  }
                 }}>
                 <AntDesign name="check-circle" size={20} color={colors.blue} />
                  <Text style={styles.modalOptionText}>
                   {activeTab === 'job' ? 'Mark as Closed' : 'Mark as Sold'}
                 </Text>
                </TouchableOpacity>

                   <TouchableOpacity
                    style={styles.modalOption}
                      onPress={async () => {
                        setModalVisible(false);

                         const carAdId = selectedAd?.carAd?._id;

                         if (carAdId) {
                          await handleDeleteAd(carAdId, activeTab);
                         } else {
                          showErrorToast('Ad ID not found');
                         }
                         
                         if (carAdId) {
                          await handleDeleteCarAd(carAdId);
                         }
                       }}
                    >
                   <AntDesign name="delete" size={20} color={colors.red} />
                   <Text style={[styles.modalOptionText, styles.deleteText]}>Delete</Text>
                   </TouchableOpacity>
                   </>
                  )
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: 1,
    minWidth: 140,
    height: 45,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
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