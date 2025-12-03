import LocationSelectorModal from '@/app/components/LocationSelectorModal';
import { colors } from '@/app/constants/theme';
import { CombinedAd } from '@/app/types/marketplace';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast } from '@/app/utils/toast';
import { AntDesign } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import CarListingSection from '../../reusables/carListingSection';


export interface UserProfile {
   _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isGoogleUser: boolean;
  image: string | null;
  role: string;
  paidPlans: {
    planType: string;
    status: string;
    reference: string;
    _id: string;
  }[];
  walletBalance: number;
  walletTransactions: {
    amount: number;
    reference: string;
    status: string;
    paymentDate: string;
    _id: string;
  }[];
  isVerified: boolean;
  hasSubmittedVerification: boolean;
  createdAt: string;
}

export default function HomeScreen() {
  const [selectedPropertyKey, setSelectedPropertyKey] = useState<string>(''); 
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<string>(''); 
  const [isLocationModalVisible, setIsLocationModalVisible] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('Location');
  const [ads, setAds] = useState<CombinedAd[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const router = useRouter();


  const propertyData = [
    { key: '1', value: 'Commercial Property for Rent' },
    { key: '2', value: 'Commercial Property for Sale' },
    { key: '3', value: 'House & Apartment for Rent' },
    { key: '4', value: 'House & Apartment for Sale' },
    { key: '5', value: 'Land & Plots for Rent' },
    { key: '6', value: 'Land & Plots for Sale' },
    { key: '7', value: 'Event Center And Venues' },
  ];

  
  const vehicleData = [
    { key: '1', value: 'Cars' },
    { key: '2', value: 'Bus' },
    { key: '3', value: 'Tricycle' },
    { key: '4', value: 'Motorcycles & Scooters' },
    { key: '5', value: 'Truck & Trailer' },
  ];

  const propertyKeyToLabel = Object.fromEntries(propertyData.map(d => [d.key, d.value]));
  const vehicleKeyToLabel = Object.fromEntries(vehicleData.map(d => [d.key, d.value]));


  const mapVehicleLabelToBackend = (label: string | undefined) => {
    if (!label) return '';
    const m: Record<string, string> = {
      'Cars': 'car',
      'Bus': 'bus',
      'Tricycle': 'tricycle',
    };
    return m[label] || label.toLowerCase();
  };


  const mapPropertyLabelToBackend = (label: string | undefined) => {
    if (!label) return '';
    return label.toLowerCase();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!apiClient) {
          showErrorToast("API client is not initialized");
          return;
        }
       const res = await apiClient.get('/api/profile');
       setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async (opts?: { search?: string; category?: string }) => {
    try {
      if (!apiClient) {
        showErrorToast('API client not initialized.');
        return;
      }
      setLoading(true);

      const params: any = {};
      if (opts?.search) params.search = opts.search;
      if (opts?.category) params.category = opts.category;

      const res = await apiClient.get('/api/products/get-all-marketproducts', { params });
      const data = res.data?.data ?? [];
      setAds(data);
    } catch (err: any) {
      console.error('fetchAds error', err?.response ?? err);
      showErrorToast('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = async (opts?: { propertyKey?: string; vehicleKey?: string; search?: string }) => {
    try {
      setLoading(true);

      const propertyLabel = opts?.propertyKey ? propertyKeyToLabel[opts.propertyKey] : (selectedPropertyKey ? propertyKeyToLabel[selectedPropertyKey] : '');
      const vehicleLabel = opts?.vehicleKey ? vehicleKeyToLabel[opts.vehicleKey] : (selectedVehicleKey ? vehicleKeyToLabel[selectedVehicleKey] : '');

      
      let backendCategory = '';
      if (propertyLabel) {
        backendCategory = mapPropertyLabelToBackend(propertyLabel);
      } else if (vehicleLabel) {
        backendCategory = mapVehicleLabelToBackend(vehicleLabel);
      }

      const search = typeof opts?.search !== 'undefined' ? opts.search : searchText;

      await fetchAds({
        search: search?.trim() ? search.trim() : undefined,
        category: backendCategory || undefined,
      });
    } catch (err: any) {
      console.error('handleSearch error', err);
      showErrorToast('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  
  const onSelectProperty = (key: string) => {
    setSelectedPropertyKey(key);
    handleSearch({ propertyKey: key, search: searchText });
  };

  const onSelectVehicle = (key: string) => {
    setSelectedVehicleKey(key);
    handleSearch({ vehicleKey: key, search: searchText });
  };

  const onPressSearchButton = () => {
    handleSearch({ search: searchText, propertyKey: selectedPropertyKey, vehicleKey: selectedVehicleKey });
  };

  const now = Date.now();

const premiumAds = ads.filter(item => {
  const ad = item.vehicleAd || item.propertyAd || item.petAd || item.agricultureAd || 
             item.kidsAd || item.serviceAd || item.equipmentAd || item.gadgetAd || 
             item.laptopAd || item.fashionAd || item.householdAd || item.beautyAd || 
             item.constructionAd || item.jobAd || item.hireAd;
  
  console.log('Ad check:', {
    hasAd: !!ad,
    plan: ad?.plan,
    paymentStatus: ad?.paymentStatus,
    isPremium: ad?.paymentStatus === "success" && ["premium", "vip", "diamond", "enterprise"].includes(ad.plan?.toLowerCase())
  });
  
  if (!ad) return false;
  
  const premiumPlans = ["premium", "vip", "diamond", "enterprise"];
  return ad.paymentStatus === "success" && premiumPlans.includes(ad.plan?.toLowerCase());
});


  const newVehicles = ads
  .filter(ad => {
    if (!ad.vehicleAd) return false;
    const createdAt = new Date(ad.vehicleAd?.createdAt ?? 0).getTime();
    return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000; // within 7 days
  })
  .sort((a, b) => {
    return new Date(b.vehicleAd?.createdAt ?? 0).getTime() - new Date(a.vehicleAd?.createdAt ?? 0).getTime();
  })

  
  const newProperties = ads
  .filter(ad => {
    if (!ad.propertyAd) return false;
    const createdAt = new Date(ad.propertyAd?.createdAt ?? 0).getTime();
    return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000; // within 7 days
  })
  .sort(
    (a, b) =>
      new Date(b.propertyAd?.createdAt ?? 0).getTime() -
      new Date(a.propertyAd?.createdAt ?? 0).getTime()
  )

  const newGadget = ads 
    .filter(ad => {
      if (!ad.gadgetAd) return false;
       const createdAt = new Date(ad.gadgetAd?.createdAt ?? 0).getTime();
       return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
    })
    .sort(
      (a, b) => 
         new Date(b.gadgetAd?.createdAt ?? 0).getTime() - 
         new Date(a.gadgetAd?.createdAt ?? 0).getTime()
    )

     const newFashion = ads 
        .filter(ad => {
          if (!ad.fashionAd) return false;
          const createdAt = new Date(ad.fashionAd?.createdAt ?? 0).getTime();
          return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
        })
         .sort(
          (a, b) => 
            new Date(b.fashionAd?.createdAt ?? 0).getTime() - 
           new Date(a.fashionAd?.createdAt ?? 0).getTime() 
         )

         const newHousehold = ads 
           .filter(ad => {
            if (!ad.householdAd) return false;
            const createdAt = new Date(ad.householdAd?.createdAt ?? 0).getTime();
            return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
           })
            .sort(
              (a, b) => 
                new Date(b.householdAd?.createdAt ?? 0).getTime() - 
              new Date(a.householdAd?.createdAt ?? 0).getTime()
            )

            const newLaptop = ads 
                .filter(ad => {
                  if (!ad.laptopAd) return false;
                  const createdAt = new Date(ad.laptopAd?.createdAt ?? 0).getTime();
                  return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
             })
              .sort(
                (a, b) => 
                  new Date(b.laptopAd?.createdAt ?? 0).getTime() - 
                new Date(a.laptopAd?.createdAt ?? 0).getTime()
              )

              const newPet = ads 
                 .filter(ad => {
                  if (!ad.petAd) return false;
                  const createdAt = new Date(ad.petAd?.createdAt ?? 0).getTime();
                  return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
                 })
                 .sort(
                  (a, b) => 
                     new Date(b.petAd?.createdAt ?? 0).getTime() - 
                    new Date(a.petAd?.createdAt ?? 0).getTime()
                 )

                 const newAgriculture = ads 
                   .filter(ad => {
                    if (!ad.agricultureAd) return false;
                    const createdAt = new Date(ad.agricultureAd?.createdAt ?? 0).getTime();
                    return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
                   })
                   .sort(
                    (a, b) => 
                       new Date(b.agricultureAd?.createdAt ?? 0).getTime() - 
                      new Date(a.agricultureAd?.createdAt ?? 0).getTime()
                   )

                   const newKid = ads 
                     .filter(ad => {
                      if (!ad.kidsAd) return false;
                      const createdAt = new Date(ad.kidsAd?.createdAt ?? 0).getTime();
                      return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
                     })
                      .sort(
                        (a, b) => 
                         new Date(b.kidsAd?.createdAt ?? 0).getTime() - 
                        new Date(a.kidsAd?.createdAt ?? 0).getTime()
                      )

                      const newService = ads 
                         .filter(ad => {
                          if (!ad.serviceAd) return false;
                          const createdAt = new Date(ad.serviceAd?.createdAt ?? 0).getTime();
                          return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
                         })
                         .sort(
                          (a, b) => 
                            new Date(b.serviceAd?.createdAt ?? 0).getTime() - 
                           new Date(a.serviceAd?.createdAt ?? 0).getTime()
                         )

                        const newEquipment = ads 
                           .filter(ad => {
                            if (!ad.equipmentAd) return false;
                            const createdAt = new Date(ad.equipmentAd?.createdAt ?? 0).getTime();
                            return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
                           })
                           .sort(
                             (a, b) => 
                               new Date(b.equipmentAd?.createdAt ?? 0).getTime() - 
                             new Date(a.equipmentAd?.createdAt ?? 0).getTime()
                           )

                        const newBeauty = ads 
                            .filter(ad => {
                              if (!ad.beautyAd) return false;
                              const createdAt = new Date(ad.beautyAd?.createdAt ?? 0).getTime();
                              return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
                            })
                            .sort(
                              (a, b) => 
                                new Date(b.beautyAd?.createdAt ?? 0).getTime() - 
                               new Date(a.beautyAd?.createdAt ?? 0).getTime()
                            )

                     const newConstruction = ads 
                        .filter(ad => {
                          if (!ad.constructionAd) return false;
                          const createdAt = new Date(ad.constructionAd?.createdAt ?? 0).getTime();
                          return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
                        })
                        .sort(
                           (a, b) => 
                             new Date(b.constructionAd?.createdAt ?? 0).getTime() -
                            new Date(a.constructionAd?.createdAt ?? 0).getTime()
                        )

                        const newJob = ads 
                           .filter(ad => {
                            if (!ad.jobAd) return false;
                             const createdAt = new Date(ad.jobAd?.createdAt ?? 0).getTime();
                             return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
                           })
                           .sort(
                            (a, b) => 
                                new Date(b.jobAd?.createdAt ?? 0).getTime() - 
                              new Date(a.jobAd?.createdAt ?? 0).getTime()
                           )

                           const newHire = ads 
                             .filter(ad => {
                              if (!ad.hireAd) return false;
                              const createdAt = new Date(ad.hireAd?.createdAt ?? 0).getTime();
                              return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
                             })
                             .sort(
                              (a, b) => 
                                new Date(b.hireAd?.createdAt ?? 0).getTime() -
                               new Date(a.hireAd?.createdAt ?? 0).getTime()
                             )

 const recommendedAds = ads
  .filter(ad => {
    const paidAd = ad.vehicleAd || ad.propertyAd || ad.gadgetAd || ad.fashionAd || 
                   ad.petAd || ad.agricultureAd || ad.kidsAd || ad.serviceAd || 
                   ad.equipmentAd || ad.laptopAd || ad.householdAd || ad.beautyAd || 
                   ad.constructionAd || ad.jobAd || ad.hireAd;
    
    return paidAd?.plan === 'free' || !paidAd?.plan;
  });

  const handleAdPress = (ad: CombinedAd) => {
    console.log('Pressed ad:', ad.adId);
    router.push({
      pathname: "/protected/ad/[adId]",
      params: { adId: ad.adId },
    });
  };

  if (loading) {
    return (
      <KeyboardAvoidingView className="flex-1 bg-[#F8F8F8] mt-10 justify-center items-center">
        <ActivityIndicator size="small" color={colors.blue} />
        <Text style={styles.loadingText}>Loading marketplace...</Text>
      </KeyboardAvoidingView>
    );
  }

  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#F8F8F8] mt-10">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header (unchanged) */}
          <View 
            className="flex-row items-center justify-between px-6 py-4 bg-white" 
            style={{ 
               shadowColor: '#000', 
               shadowOffset: { width: 0, height: 2 }, 
               shadowOpacity: 0.1,
               elevation: 4 
               }}>
            <View className="flex-row gap-2 items-center">
             {profile?.image ? (
              <Image 
                source={{ uri: profile.image }}
                style={styles.profileImage}
              />
             ): (
              <Image 
                source={require('@/assets/images/profile-circle.png')}
                style={styles.profileImage}
              />
             )}
              <View className="flex-col gap-2">
                <Text 
                  style={styles.profileText}>
                  Welcome {profile?.fullName || "User" }
                </Text>
                <TouchableOpacity className="flex-row items-center" onPress={() => setIsLocationModalVisible(true)}>
                  <Text style={styles.profileText}>{selectedLocation}</Text>
                  <AntDesign name="caret-down" size={10} color="#8C8C8C" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="w-10 h-10 rounded-[40px] bg-[#EDEDED] justify-center items-center">
              <Image source={require("../../../assets/images/notifications.png")} className="w-6 h-6" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="flex-row items-center mb-6 px-6">
            <View className="flex-1 flex-row items-center mt-4 rounded-lg overflow-hidden" style={styles.searchContainer}>
              <TextInput
                placeholder="Search for anything"
                placeholderTextColor="#CDCDD7"
                value={searchText}
                onChangeText={setSearchText}
                className="flex-1 h-full pl-4 pr-12"
                style={styles.searchInput}
              />
              <TouchableOpacity className="absolute right-0 w-11 h-11 bg-[#5555DD] items-center justify-center rounded-r-lg" onPress={onPressSearchButton}>
                <Ionicons name="search" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dropdowns */}
          <View className="flex-row mb-6 px-6">
            <View className="relative flex-1 mr-3">
              <SelectList
                setSelected={onSelectProperty}        // returns a key like "1"
                data={propertyData}
                placeholder="Property"
                boxStyles={{ height: 44, backgroundColor: colors.lightSpot, borderWidth: 0.5, borderColor: colors.border, borderRadius: 8, paddingLeft: 36, paddingRight: 12 }}
                inputStyles={{ color: colors.darkGray, fontSize: 14 }}
                dropdownStyles={{ maxHeight: 300, backgroundColor: colors.bg, borderColor: colors.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomWidth: 0, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, width: '100%', maxWidth: 300 }}
                dropdownItemStyles={{ borderBottomWidth: 1, borderBottomColor: '#EDEDED', paddingVertical: 16, paddingHorizontal: 20 }}
                dropdownTextStyles={{ color: colors.darkGray, fontSize: 14, textAlign: 'center' }}
              />
              <Image
                source={require('../../../assets/images/propertyFilter.png')} 
                style={styles.dropdownImage} />
            </View>

            <View className="relative flex-1">
              <SelectList
                setSelected={onSelectVehicle}
                data={vehicleData}
                placeholder="Vehicle"
                boxStyles={{ 
                  height: 44, 
                  backgroundColor: colors.lightSpot, 
                  borderWidth: 0.5, 
                  borderColor: colors.border, 
                  borderRadius: 8, 
                  paddingLeft: 36, 
                  paddingRight: 12 
                }}
                inputStyles={{ 
                   color: '#525252', 
                   fontSize: 14 
                }}
                dropdownStyles={{ 
                  maxHeight: 300,
                   backgroundColor: colors.bg, 
                   borderColor: colors.border, 
                   borderTopLeftRadius: 24, 
                   borderTopRightRadius: 24, 
                   borderBottomWidth: 0, 
                   shadowColor: colors.black, 
                   shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, width: '100%', maxWidth: 300 }}
                dropdownItemStyles={{ 
                   borderBottomWidth: 1,
                   borderBottomColor: colors.lightSpot, 
                   paddingVertical: 16, 
                   paddingHorizontal: 20 
                }}
                dropdownTextStyles={{ 
                  color: colors.darkGray, 
                  fontSize: 14, 
                  textAlign: 'center' 
                }}
              />
              <Image
               source={require('../../../assets/images/vehicleFilter.png')} 
               style={styles.dropdownImage} />
            </View>
          </View>

          {/* Product Listing Section */}
          <View className="mt-6">
            {ads.length === 0 ? (
              <View style={styles.productListing}>
                <Text style={styles.resultText}>No results. Try different filters or search terms.</Text>
              </View>
            ) : (
              <>
                <CarListingSection 
                   title="Trending (Premium Ads)" 
                   ads={premiumAds} 
                   onAdPress={handleAdPress}
                   />
                <CarListingSection 
                  title="Newly Posted Vehicles" 
                  ads={newVehicles} 
                  onAdPress={handleAdPress}
                 />
                <CarListingSection 
                  title="Newly Posted Properties" 
                  ads={newProperties} 
                  onAdPress={handleAdPress} 
                 />
                 <CarListingSection
                   title="Newly Posted Gadget"
                   ads={newGadget}
                   onAdPress={handleAdPress}
                 />
                 <CarListingSection
                    title="Newly Posted Fashion"
                    ads={newFashion}
                    onAdPress={handleAdPress}
                 />
                 <CarListingSection
                   title="Newly Posted household"
                   ads={newHousehold}
                   onAdPress={handleAdPress}
                 />
                 <CarListingSection
                   title="Newly Posted laptops"
                   ads={newLaptop}
                   onAdPress={handleAdPress}
                 />
                 <CarListingSection
                   title="Newly Posted Pet"
                   ads={newPet}
                   onAdPress={handleAdPress}
                 />
                 <CarListingSection
                   title="Newly Posted Agriculture"
                   ads={newAgriculture}
                   onAdPress={handleAdPress}
                 />
                 <CarListingSection
                   title="Newly Posted Kid toys"
                   ads={newKid}
                   onAdPress={handleAdPress}
                 />
                 <CarListingSection
                    title="Newly Posted Services"
                    ads={newService}
                    onAdPress={handleAdPress}
                 />
                 <CarListingSection
                    title="Newly Posted Equipment"
                    ads={newEquipment}
                    onAdPress={handleAdPress}
                 />
                 <CarListingSection
                  title="Newly Posted Beauty"
                  ads={newBeauty}
                  onAdPress={handleAdPress}
                 />
                 <CarListingSection
                   title="Newly Posted Construction"
                   ads={newConstruction}
                   onAdPress={handleAdPress}
                 />
                 <CarListingSection
                   title="Newly Posted Job"
                   ads={newJob}
                   onAdPress={handleAdPress}
                 /> 
                 <CarListingSection
                    title="Newly Posted Hire"
                    ads={newHire}
                    onAdPress={handleAdPress}
                 /> 
                <CarListingSection 
                 title="Recommended For You" 
                 ads={recommendedAds} 
                 onAdPress={handleAdPress} 
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LocationSelectorModal
        visible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        onLocationSelect={(state, lga) => {
          setSelectedLocation(`${lga}, ${state}`);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
     height: 44 
  },
  searchInput: {
    backgroundColor: colors.lightWhite, 
    borderWidth: 1, 
    borderColor: colors.shadeWhite, 
    borderTopLeftRadius: 8, 
    borderBottomLeftRadius: 8
  },
  loadingText: {
     marginTop: 10,
     fontSize: 16,
     color: colors.darkGray,
  },
  dropdownImage: {
    position: 'absolute', 
    left: 12, 
    top: 12, 
    width: 20, 
    height: 20
  },
  productListing: {
     padding: 24, 
     alignItems: 'center'
  },
  resultText: {
     color: colors.darkShadeGray,
     fontFamily: 'WorkSans_500Medium'
  },
  profileImage: {
    width: 40, 
    height: 40,  
    borderRadius: 40
  },
  profileText: {
    color: colors.darkGray,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    fontSize: 14,
  }
})