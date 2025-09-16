import React, { useState } from 'react';
import { 
 View, 
 Text,
 StyleSheet,
 TextInput,
 TouchableOpacity,
 ScrollView,
 ActivityIndicator,
 KeyboardAvoidingView,
 Platform,
 Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';
import LocationDropdown from '@/app/reusables/locationDropdown';

interface AddressInput {
  id: string;
  state: string;
  lga: string;
  address: string;
}

interface AddBusinessProps {
    onBack: () => void;
    onBusinessAdded?: (business: any) => void;
}

export default function AddBusiness({ onBack, onBusinessAdded}: AddBusinessProps) {
   const router = useRouter();
   const [businessName, setBusinessName] = useState<string>('');
    const [aboutBusiness, setAboutBusiness] = useState<string>('');
    const [addresses, setAddresses] = useState<AddressInput[]>([
        { id: '1', state: '', lga: '', address: '' }
    ]);
    const [loading, setLoading] = useState(false);

    const addNewAddress = () => {
        const newAddress: AddressInput = {
            id: Date.now().toString(),
            state: '',
            lga: '',
            address: ''
        };
        setAddresses([...addresses, newAddress]);
    };

     const removeAddress = (id: string) => {
        if (addresses.length > 1) {
          setAddresses(addresses.filter(addr => addr.id !== id));
        }
    };

    const updateAddress = (id: string, field: keyof AddressInput, value: string) => {
        setAddresses(addresses.map(addr => {
            if (addr.id === id) {
                // If updating state, reset LGA
                if (field === 'state') {
                    return { ...addr, [field]: value, lga: '' };
                }
                return { ...addr, [field]: value };
            }
            return addr;
        }));
    };


    const handleSubmit = async () => {
        if (!businessName.trim()) {
            showErrorToast('Please enter business name');
            return;
        }
        
        if (!aboutBusiness.trim()) {
            showErrorToast('Please enter business description');
            return;
        }

       const validAddresses = addresses.filter(addr => 
        addr.state.trim() && addr.lga.trim() && addr.address.trim()
       );

       if (validAddresses.length === 0) {
        showErrorToast('Please add at least one complete address');
        return;
       }

       setLoading(true);

       try {
         await new Promise(resolve => setTimeout(resolve, 2000));

         const newBusiness = {
            id: Date.now().toString(),
            name: businessName,
            description: aboutBusiness,
            addresses: validAddresses,
            createdAt: new Date().toISOString(),
         };

         showSuccessToast('Business added successfully!');
         onBusinessAdded?.(newBusiness);
         
         setTimeout(() => {
           onBack();
         }, 1000);

       } catch (error) {
         showErrorToast('Failed to add business. Please try again.');
       } finally {
        setLoading(false);
       }
    };


    const AddressCard = ({ address, index}: { address: AddressInput; index: number}) => (
      <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressTitle}>Address {index + 1}</Text>
            {addresses.length > 1 && index > 0 && (
                <TouchableOpacity
                 onPress={() => removeAddress(address.id)}
                 style={styles.cancelButton}>
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
             />
          </View>
       </View>
    );  

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
               onPress={() => router.push('/protected/profile/business-profile')} 
               style={styles.backButton}>
                 <Text style={styles.backIcon}>←</Text>
             </TouchableOpacity>
             <Text style={styles.headerTitle}>Add a Business</Text>
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
                />
              </View>

              <View style={styles.addressSection}>
                 <Text style={styles.sectionTitle}>Address</Text>

                 {addresses.map((address, index) => (
                    <AddressCard key={address.id} address={address} index={index} />
                 ))}

                 <TouchableOpacity
                   onPress={addNewAddress}
                   style={styles.addAddressButton}>
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
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                 <View style={styles.btnRow}>
                  <Image 
                   source={require('../../../assets/images/add-circle.png')}
                  />
                   <Text style={styles.submitButtonText}>Add</Text>
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
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.darkGray,
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
    //height: 52,
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
  dropdownContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIconContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#FF4757',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelIcon: {
    color: '#fff',
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
    color: '#000087',
    width: 24,
    borderWidth: 1.5,
    borderColor: '#000087',
    height: 24,
    textAlign: 'center',
    borderRadius: 12,
  },
  addAddressText: {
    fontSize: 16,
    color: '#000087',
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
    color: '#fff',
  },
})