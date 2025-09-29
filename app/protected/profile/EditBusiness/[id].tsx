import {
  View, 
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from "expo-router";
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { AntDesign } from '@expo/vector-icons';
import LocationDropdown from '@/app/reusables/locationDropdown';
import apiClient from '@/app/utils/apiClient';
import { useEffect, useState } from 'react';
import { colors } from '@/app/constants/theme';


interface AddressInput {
    id: string;
    state: string;
    lga: string;
    address: string;
    deliveryAvailable?: boolean;
    _id?: string;
}

interface BusinessData {
    _id: string;
    businessName: string;
    aboutBusiness: string;
    location: string;
    addresses: {
     _id: string;
     address: string;
     deliveryAvailable: boolean;
    }[];
}

export default function EditBusiness() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [businessName, setBusinessName] = useState<string>('');
  const [aboutBusiness, setAboutBusiness] = useState<string>('');
  const [addresses, setAddresses] = useState<AddressInput[]>([
    { id: '1', state: '', lga: '', address: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
     if (id) {
        fetchBusinessData();
     }
  }, [id]);

  const fetchBusinessData =  async () => {
     try {
        if (!apiClient) {
            showErrorToast("API client not initialized");
            return;
        }
         setInitialLoading(true);

         const response = await apiClient.get('/api/business/my-businesses');
         const businesses = response.data || [];
         const business = businesses.find((b: BusinessData) => b._id === id);

         if (!business) {
            showErrorToast('Business not found');
            router.back();
            return;
         }

         // Populate form with exisiting data 
         setBusinessName(business.businessName);
         setAboutBusiness(business.aboutBusiness);

         // Converting addresses to form format 
       const formattedAddresses = business.addresses.map((addr, index) => ({
  id: addr._id || `addr_${index}`,   // always stable
  state: business.location,
  lga: '',
  address: addr.address,
  deliveryAvailable: addr.deliveryAvailable,
  _id: addr._id,
}));

setAddresses(
  formattedAddresses.length > 0
    ? formattedAddresses
    : [{ id: `local_${Date.now()}`, state: business.location, lga: '', address: '' }]
);


     } catch (error: any) {
       console.error('Error fetching business data:', error);
       showErrorToast('Failed to load business data');
       router.back();
     } finally {
         setInitialLoading(false);
     }
  };

const addNewAddress = () => {
  const newAddress: AddressInput = {
    id: `local_${Date.now()}`,  // unique + stable
    state: '',
    lga: '',
    address: '',
  };
  setAddresses((prev) => [...prev, newAddress]);
};


  const removeAddress = (addressId: string) => {
    if (addresses.length > 1) {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
    }
  };

  // const updateAddress = (addressId: string, field: keyof AddressInput, value: string) => {
  //   setAddresses(addresses.map(addr => {
  //     if (addr.id === addressId) {
  //       // If updating state, reset LGA
  //       if (field === 'state') {
  //         return { ...addr, [field]: value, lga: ""};
  //       }
  //       return { ...addr, [field]: value };
  //     }
  //     return addr;
  //   }));
  // };


  const updateAddress = (
  addressId: string,
  field: keyof AddressInput,
  value: string
) => {
  setAddresses((prevAddresses) =>
    prevAddresses.map((addr) => {
      if (addr.id === addressId) {
        if (field === "state") {
          return { ...addr, [field]: value, lga: "" };
        }
        return { ...addr, [field]: value };
      }
      return addr;
    })
  );
};


  const handleSubmit  = async () => {
    if (!businessName.trim()) {
        showErrorToast('Please enter business name');
        return;
    }

    if (!aboutBusiness.trim()) {
        showErrorToast('Please enter business description');
        return;
    }

    const validAddresses = addresses.filter(addr => 
      addr.state.trim() && addr.address.trim()
    );

    if (validAddresses.length === 0) {
        showErrorToast('Please add at least one complete address');
        return;
    }

    // Get the location from the first Address (state)
    const location = validAddresses[0].state;

    setLoading(true);

    try {
     if (!apiClient) {
        showErrorToast("API is not initialized");
        return;
     }
      const requestData = {
        businessName: businessName.trim(),
        aboutBusiness: aboutBusiness.trim(),
        location: location,
        addresses: validAddresses.map(addr => ({
          address: addr.address.trim(),
          deliveryAvailable: addr.deliveryAvailable || false
        }))
      };

      console.log('Updating business with data:', requestData);

      const response = await apiClient.put(`/api/business/editBusiness/${id}`, requestData);

      //console.log("Business updated successfully!:", response.data);

      showSuccessToast("Business updated successfully!");

      // Navigate back afer a short delay 
      setTimeout(() => {
        router.push('/protected/profile/business-profile');
      }, 1500);

    } catch (error: any) {
      console.error('Error updating business:', error);

      let errorMessage = 'Failed to update business. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'Another business with this name already exists';
      } else if (error.response?.status === 404) {
        errorMessage = 'Business not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'Unauthorized to update this business';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please fill in all required fields';
      }
      
      showErrorToast(errorMessage);

      // Show Alert for ciritical errors 
      if (error.response?.status >= 500) {
        Alert.alert(
            'Server Error',
            'There was a problem with the server. Please try again later.',
            [{ text: 'OK' }]
        );
      }
    } finally {
        setLoading(false);
    }
  };

 const AddressCard = ({ address, index }: { address: AddressInput; index: number }) => (
  <View style={styles.addressCard}>
    <View style={styles.addressHeader}>
      <Text style={styles.addressTitle}>Address {index + 1}</Text>
      {addresses.length > 1 && (
        <TouchableOpacity
          onPress={() => removeAddress(address.id)}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelIcon}>×</Text>
        </TouchableOpacity>
      )}
    </View>

    <View style={styles.inputGroup}>
      <LocationDropdown
        label="State"
        type="state"
        selectedValue={address.state}
        onSelect={(value) => updateAddress(address.id, "state", value)}
      />
    </View>

    <View style={styles.inputGroup}>
      <LocationDropdown
        label="Local Government Area"
        type="lga"
        selectedValue={address.lga}
        selectedState={address.state}
        onSelect={(value) => updateAddress(address.id, "lga", value)}
      />
    </View>

    <View style={styles.inputGroup}>
      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[styles.input, styles.addressInput]}
        placeholder="Enter your business address"
        placeholderTextColor={colors.border}
        value={address.address}
        onChangeText={(value) => updateAddress(address.id, "address", value)}
        editable={!loading}
      />
    </View>
  </View>
);


  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}>
              {/* <Text style={styles.backIcon}>←</Text> */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Business</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1031AA" />
          <Text style={styles.loadingText}>Loading business data...</Text>
        </View>
      </SafeAreaView>
    );
  }


    return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        enabled
      >
        <View style={styles.header}>
           <TouchableOpacity 
             onPress={() => router.back()} 
             style={styles.backButton}>
              <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
               {/* <Text style={styles.backIcon}>←</Text> */}
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Edit Business</Text>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          removeClippedSubviews={false}
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name</Text> 
              <TextInput
                style={styles.input}
                placeholder="Enter your business name"
                placeholderTextColor={colors.border}
                value={businessName}
                onChangeText={setBusinessName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>About Business</Text>
              <TextInput  
                style={[styles.input, styles.textArea]}
                placeholder="Enter details about your business"
                placeholderTextColor={colors.border}
                value={aboutBusiness}
                onChangeText={setAboutBusiness}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                blurOnSubmit={false}
                returnKeyType="done"
                editable={!loading}
              />
            </View>

            <View style={styles.addressSection}>
               <Text style={styles.sectionTitle}>Address</Text>

               {addresses.map((address, index) => (
                <AddressCard key={address.id} address={address} index={index} />
               ))}

               <TouchableOpacity
                 onPress={addNewAddress}
                 style={styles.addAddressButton}
                 disabled={loading}>
                  <View style={styles.addAddressIconContainer}>
                    <Text style={styles.addAddressIcon}>+</Text>
                  </View>
                  <Text style={styles.addAddressText}>Add another address</Text>
               </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
           <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <LinearGradient
              colors={loading ? ['#cccccc', '#999999'] : ['#00A8DF', '#1031AA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.submitButton, loading && styles.disabledButton]}
            >
              {loading ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator color={colors.bg} size="small" />
                  <Text style={styles.submitButtonText}>Updating...</Text>
                </View>
              ) : (
               <View style={styles.btnRow}>
                {/* <Image 
                 source={require('../../../../assets/images/editIcon.png')}
                /> */}
                 <Text style={styles.submitButtonText}>Update</Text>
               </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.setGrey,
    shadowColor: '#4D485F1A',
    paddingTop: 30,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 4},
    shadowOpacity: 0.1,
    elevation: 6
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    fontSize: 24,
    color: colors.grey700,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.lightGrey,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 50,
  },
  form: {
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '400',
    color: colors.darkGray,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
    fontSize: 14,
    fontWeight: '400'
  },
  addressInput: {
    height: 52,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    marginBottom: 16,
    marginTop: 8,
  },
  addressSection: {
    marginTop: 8,
  },
  addressCard: {
    borderRadius: 8,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    fontSize: 14,
    fontWeight: '500',
    elevation: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkGray,
  },
  cancelButton: {
    backgroundColor: colors.red,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelIcon: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addAddressIconContainer: {
    marginRight: 12,
  },
  addAddressIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.blue,
    width: 24,
    borderWidth: 1.5,
    borderColor: colors.blue,
    height: 24,
    textAlign: 'center',
    borderRadius: 12,
  },
  addAddressText: {
    fontSize: 16,
    color: colors.blue,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  btnRow: {
   flexDirection: 'row', 
   alignItems: 'center', 
   gap: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.bg,
  },
});