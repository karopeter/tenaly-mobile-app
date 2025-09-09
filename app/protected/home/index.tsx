import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { SelectList } from 'react-native-dropdown-select-list';
import LocationSelectorModal from '@/app/components/LocationSelectorModal';
import CarListingSection from '../../reusables/carListingSection';
import apiClient from '@/app/utils/apiClient';
import { CombinedAd } from '@/app/types/marketplace';
import { showErrorToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [selectedPropertyKey, setSelectedPropertyKey] = useState<string>(''); 
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<string>(''); 
  const [isLocationModalVisible, setIsLocationModalVisible] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('Location');
  const [ads, setAds] = useState<CombinedAd[]>([]);
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

 
  const premiumAds = ads.filter(ad => {
    const paidAd = ad.vehicleAd || ad.propertyAd;
    return paidAd?.paymentStatus === 'success' && paidAd?.plan !== 'free';
  });

  const newVehicles = ads
    .filter(ad => ad.vehicleAd && String(ad.carAd?.category || '').toLowerCase().includes('car'))
    .sort((a, b) => new Date(b.carAd?.createdAt || 0).getTime() - new Date(a.carAd?.createdAt || 0).getTime())
    .slice(0, 6);

  const newProperties = ads
    .filter(ad => ad.propertyAd)
    .sort((a, b) => new Date(b.carAd?.createdAt || 0).getTime() - new Date(a.carAd?.createdAt || 0).getTime())
    .slice(0, 6);

  const recommendedAds = ads
    .filter(ad => {
      const paidAd = ad.vehicleAd || ad.propertyAd;
      return paidAd?.paymentStatus === 'free' || paidAd?.plan === 'free';
    })
    .slice(0, 6);

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
        <ActivityIndicator size="small" />
        <Text style={{ marginTop: 8 }}>Loading marketplace...</Text>
      </KeyboardAvoidingView>
    );
  }

  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#F8F8F8] mt-10">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header (unchanged) */}
          <View className="flex-row items-center justify-between px-6 py-4 bg-white" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 4 }}>
            <View className="flex-row gap-2 items-center">
              <Image source={require("../../../assets/images/profileRight.png")} className="w-20 h-20 rounded-full" />
              <View className="flex-col gap-2">
                <Text className="text-[#525252] font-[500] text-[14px]">Welcome Golibe</Text>
                <TouchableOpacity className="flex-row items-center" onPress={() => setIsLocationModalVisible(true)}>
                  <Text className="text-sm text-gray-500">{selectedLocation}</Text>
                  <AntDesign name="caretdown" size={10} color="#8C8C8C" style={{ marginLeft: 4 }} />
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
                boxStyles={{ height: 44, backgroundColor: colors.lightSpot, borderWidth: 0.5, borderColor: colors.border, borderRadius: 8, paddingLeft: 36, paddingRight: 12 }}
                inputStyles={{ color: '#525252', fontSize: 14 }}
                dropdownStyles={{ maxHeight: 300, backgroundColor: colors.bg, borderColor: colors.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomWidth: 0, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, width: '100%', maxWidth: 300 }}
                dropdownItemStyles={{ borderBottomWidth: 1, borderBottomColor: colors.lightSpot, paddingVertical: 16, paddingHorizontal: 20 }}
                dropdownTextStyles={{ color: colors.darkGray, fontSize: 14, textAlign: 'center' }}
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
                <CarListingSection title="Trending (Premium Ads)" ads={premiumAds} onAdPress={handleAdPress} />
                <CarListingSection title="Newly Posted Vehicles" ads={newVehicles} onAdPress={handleAdPress} />
                <CarListingSection title="Newly Posted Properties" ads={newProperties} onAdPress={handleAdPress} />
                <CarListingSection title="Recommended For You" ads={recommendedAds} onAdPress={handleAdPress} />
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
     color: colors.darkShadeGray
  }
})