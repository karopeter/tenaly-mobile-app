import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  Image, 
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/app/constants/theme';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import apiClient from '@/app/utils/apiClient';
import DeliveryConfigurationForm from '@/app/reusables/deliveryConfiguration';

interface BusinessData {
  _id: string;
  businessName: string;
  aboutBusiness?: string;
  location?: string;
  addresses: {
    _id: string;
    address: string;
    deliveryAvailable: boolean;
    deliverySettings?: {
      explanation: string;
      dayFrom: number;
      daysTo: number;
      chargeDelivery: string;
      feeFrom: number;
      feeTo: number;
    };
  }[];
  businessHours?: any[];
  createdAt?: string;
}

interface DeliveryFormData {
  explanation: string;
  dayFrom: string;
  daysTo: string;
  chargeDelivery: string;
  feeFrom: string;
  feeTo: string;
}

type TabType = 'details' | 'hours' | 'delivery';
type ViewMode = 'list' | 'configure' | 'edit';


export default function BusinessDelivery() {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('delivery');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessData | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormData>({
    explanation: '',
    dayFrom: '',
    daysTo: '',
    chargeDelivery: 'no',
    feeFrom: '',
    feeTo: ''
  });
  const router = useRouter();

  useEffect(() => {
     fetchBusinesses();
  }, []);


  const fetchBusinesses = async () => {
     try {
      if (!apiClient) {
        showErrorToast("API client not initialized");
        return;
      }
      setLoading(true);
      const response = await apiClient.get('/api/business/my-businesses');
      setBusinesses(response.data || []);
     } catch (error: any) {
       console.error('Error fetching businesses:', error);
       showErrorToast('Failed to fetch businesses');
       setBusinesses([]);
     } finally {
      setLoading(false);
     }
  };

   const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    
    // Navigate to different screens based on tab
    switch (tab) {
      case 'details':
        router.push('/protected/profile/business-profile');
        break;
      case 'hours':
        router.push('/protected/profile/BusinessHours');
        break;
      case 'delivery':
        // Stay on current screen
        break;
      default:
        break;
    }
  };

  const toggleDeliveryAvailable = async (businessId: string, addressIndex: number, available: boolean) => {
     try {
       if (!apiClient) {
        showErrorToast("API client is not initialized");
        return;
       }

       await apiClient.patch(`/api/business/toogle-delivery-availiability/${businessId}/${addressIndex}`, {
        deliveryAvailable: available
       });

       // Update local state 
       setBusinesses(prev => prev.map(business => {
        if (business._id === businessId) {
          const updatedAddresses = business.addresses.map((addr, idx) => {
            if (idx === addressIndex) {
              return {...addr, deliveryAvailable: available };
            }
            return addr;
          });
          return { ...business, addresses: updatedAddresses }
        }
        return business;
       }));

       showSuccessToast(`Delivery ${available ? 'enabled' : 'disabled'} successfully`);
     } catch (error: any) {
        console.error('Error toggling delivery:', error);
        showErrorToast('Failed to update delivery availability');
     }
  };

  const handleConfigureDelivery = (business: BusinessData) => {
    const deliveryEnabledAddresses = business.addresses.filter(addr => addr.deliveryAvailable);

    if (deliveryEnabledAddresses.length === 0) {
      showErrorToast('Please enable delivery for at least one address first');
      return;
    }

    setSelectedBusiness(business);
    setViewMode('configure');

    // Reset form 
    setDeliveryForm({
      explanation: '',
      dayFrom: '',
      daysTo: '',
      chargeDelivery: 'no',
      feeFrom: '',
      feeTo: '',
    });
  };

 
   const handleEditDelivery = (business: BusinessData) => {
    setSelectedBusiness(business);
    setViewMode('edit');
    
    // Pre-populate form with existing data from first address with delivery settings
    const addressWithSettings = business.addresses.find(addr => addr.deliverySettings);
    if (addressWithSettings?.deliverySettings) {
      setDeliveryForm({
        explanation: addressWithSettings.deliverySettings.explanation || '',
        dayFrom: addressWithSettings.deliverySettings.dayFrom?.toString() || '',
        daysTo: addressWithSettings.deliverySettings.daysTo?.toString() || '',
        chargeDelivery: addressWithSettings.deliverySettings.chargeDelivery || 'no',
        feeFrom: addressWithSettings.deliverySettings.feeFrom?.toString() || '',
        feeTo: addressWithSettings.deliverySettings.feeTo?.toString() || ''
      });
    }
  };

  const handleSaveDeliverySettings = async () => {
    if (!selectedBusiness) return;

    if (!deliveryForm.explanation.trim()) {
      showErrorToast('Please enter delivery explanation');
      return;
    }

    if (!deliveryForm.dayFrom || !deliveryForm.daysTo) {
        showErrorToast('Please enter delivery days');
        return;
    }

    if (deliveryForm.chargeDelivery === 'yes'  && (!deliveryForm.feeFrom || !deliveryForm.feeTo)) {
       showErrorToast('Please enter delivery fees');
       return;
    } 

    try {
      if (!apiClient) {
         showErrorToast("API client not initialized");
         return;
      }
      setSaving(true);

      const deliverySettings = {
        explanation: deliveryForm.explanation,
        dayFrom: parseInt(deliveryForm.dayFrom),
        daysTo: parseInt(deliveryForm.daysTo),
        chargeDelivery: deliveryForm.chargeDelivery,
        feeFrom: deliveryForm.chargeDelivery  === 'yes' ? parseInt(deliveryForm.feeFrom) : 0,
        feeTo: deliveryForm.chargeDelivery === 'yes' ? parseInt(deliveryForm.feeTo) : 0
      };

      // Get addresses with delivery enabled 
      const deliveryAddresses = selectedBusiness.addresses.filter(addr => addr.deliveryAvailable);

      if (deliveryAddresses.length === 1) {
        // Single address
        await apiClient.patch(`/api/business/${selectedBusiness._id}/address/${deliveryAddresses[0]._id}`, {
          deliverySettings
        });
      } else {
        // Multiple addresses 
        const deliverySettingsArray = deliveryAddresses.map(addr => ({
          addressId: addr._id,
          ...deliverySettings
        }));

        await apiClient.patch(`/api/business/${selectedBusiness._id}/addresses`, {
          deliverySettingsArray
        });
      }

      showSuccessToast('Delivery settings saved successfully!');
      await fetchBusinesses(); // Refresh data 
      setViewMode('list');
      setSelectedBusiness(null);

    } catch (error: any) {
      console.log('Error saving delivery settings:', error);
      showErrorToast('Failed to save delivery settings');
    } finally {
      setSaving(false);
    }
  };


    const TabButton = ({ tab, title }: { tab: TabType; title: string }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => handleTabPress(tab)}
    >
      <Text style={[
        styles.tabText,
        activeTab === tab && styles.activeTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );


  const BusinessWithDelivery = ({ business }: { business: BusinessData }) => (
    <View style={styles.businessCard}>
      <View style={styles.businessHeader}>
        <Text style={styles.businessName}>{business.businessName}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditDelivery(business)}
        >
          <Image 
            source={require('../../../assets/images/editIcon.png')} 
            style={styles.editIcon}
          />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {business.addresses.map((address, index) => (
        <View key={address._id} style={styles.addressContainer}>
          <View style={styles.deliveryStatusRow}>
           <View style={styles.deliveryBackground}>
             <Image 
              source={require('../../../assets/images/truck-fast.png')} 
              style={styles.deliveryIcon}
            />
            <Text style={[
              styles.deliveryStatus,
              address.deliveryAvailable ? styles.deliveryAvailable : styles.deliveryNotAvailable
            ]}>
              {address.deliveryAvailable 
                ? address.deliverySettings 
                  ? `Delivery available (${address.deliverySettings.dayFrom}-${address.deliverySettings.daysTo} days)`
                  : 'Delivery available'
                : 'No delivery'
              }
            </Text>
            </View>
          </View>
          
          <View style={styles.addressRow}>
            <Image 
              source={require('../../../assets/images/location.png')} 
              style={styles.locationIcon}
            />
            <Text style={styles.addressText}>{address.address}</Text>
          </View>
          
          {address.deliveryAvailable && address.deliverySettings && (
            <View style={styles.deliveryDetails}>
              <Text style={styles.deliveryExplanation}>{address.deliverySettings.explanation}</Text>
              {address.deliverySettings.chargeDelivery === 'yes' && (
                <Text style={styles.deliveryFee}>
                  Fee: ₦{address.deliverySettings.feeFrom} - ₦{address.deliverySettings.feeTo}
                </Text>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );


   const BusinessWithoutDelivery = ({ business }: { business: BusinessData }) => (
    <View style={styles.businessCard}>
      <Text style={styles.businessName}>{business.businessName}</Text>
      
      {business.addresses.map((address, index) => (
        <View key={address._id} style={styles.addressSelectionRow}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => toggleDeliveryAvailable(business._id, index, !address.deliveryAvailable)}
          >
            <View style={[
              styles.checkbox,
              address.deliveryAvailable && styles.checkboxSelected
            ]}>
              {address.deliveryAvailable && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Delivery is available</Text>
          </TouchableOpacity>
          <Text 
            style={styles.addressText}
            numberOfLines={1}
            ellipsizeMode="tail"
            >
             {address.address}
            </Text>
        </View>
      ))}
    </View>
  );

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
          <View style={styles.imageContainer}>
            <View>
               <View style={styles.personIcon}>
                 <Image 
                  source={require('../../../assets/images/emptyBusiness.png')}
                 />
               </View>
    
               <Text style={styles.emptyTitle}>
                  You can`t add delivery because {"\n"}
                  you haven`t added a business yet
               </Text>
    
               <TouchableOpacity 
                  onPress={() => router.push('/protected/profile/AddBusiness')}
                  >
                   <LinearGradient
                    colors={['#00A8DF', '#1031AA']}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 0 }}
                    style={styles.addButton}>
                   <View style={styles.buttonContent}>
                     <Text style={styles.plusIcon}>+</Text>
                    <Text style={styles.buttonText}>Add a business</Text>
                   </View>
                </LinearGradient>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      );

        const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadContainer}>
          <ActivityIndicator size="large" color="#1031AA" />
          <Text style={styles.loadingText}>Loading delivery settings...</Text>
        </View>
      );
    }

    if (businesses.length === 0) {
      return <EmptyState />;
    }

    if (viewMode === 'configure' || viewMode === 'edit') {
      return (
        <DeliveryConfigurationForm 
          selectedBusiness={selectedBusiness}
          deliveryForm={deliveryForm}
          setDeliveryForm={setDeliveryForm}
          handleSaveDeliverySettings={handleSaveDeliverySettings}
          saving={saving}
      />
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.businessListContainer}>
        {businesses.map((business) => {
          const hasDeliverySettings = business.addresses.some(addr => 
            addr.deliveryAvailable && addr.deliverySettings
          );
          const hasAnyDeliveryEnabled = business.addresses.some(addr => addr.deliveryAvailable);
          
          if (hasDeliverySettings) {
            return <BusinessWithDelivery key={business._id} business={business} />;
          } else {
            return (
              <View key={business._id}>
                <BusinessWithoutDelivery business={business} />
                {hasAnyDeliveryEnabled && (
                 <TouchableOpacity 
                    onPress={() => handleConfigureDelivery(business)}
                  > 
                    <LinearGradient
                    colors={loading ? ['#cccccc', '#999999'] : ['#00A8DF', '#1031AA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButton}>
                     <Text style={styles.configureButtonText}>Save</Text>
                 </LinearGradient>
                  </TouchableOpacity>

                )}
              </View>
            );
          }
        })}
      </ScrollView>
    );
  };


   return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (viewMode !== 'list') {
            setViewMode('list');
            setSelectedBusiness(null);
          } else {
            router.back();
          }
        }}>
          {/* <Text style={styles.backIcon}>←</Text> */}
          <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.detailsText}>Business Delivery</Text>
      </View>

      {viewMode === 'list' && (
        <View style={styles.tabContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContainer}
          >
            <TabButton tab="details" title="Business details" />
            <TabButton tab="hours" title="Business hours" />
            <TabButton tab="delivery" title="Delivery" />
          </ScrollView>
        </View>
      )}

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.setGrey
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    shadowColor: colors.blurGrey,
     paddingTop: 30,
     gap: 8,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.1,
    elevation: 6,
  },
  backButton: {
    marginRight: 15,
  },
  detailsText: {
    color: colors.darkGray, 
    fontWeight: '600',
    fontSize: 16,
  },
  tabContainer: {
  },
  tabScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 1,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: colors.blue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray
  },
  activeTabText: {
     color: colors.bg,
     fontWeight: '600'
  },
  backIcon: {
    fontSize: 24,
    color: colors.grey700
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.blackGrey
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  tabContentText: {
    fontSize: 16,
    color: colors.lightGrey,
    fontWeight: '500'
  },
  loadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginBottom: 30,
  },
  personIcon: {
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.lightGrey,
    marginTop: 20,
    textAlign: 'center'
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 30,
    width: 262,
    borderWidth: 1,
    borderColor: colors.lightSpot,
    alignSelf: 'flex-start'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.bg,
    marginRight: 8,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 20,
    borderWidth: 1.5,
    borderColor: colors.bg,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.bg,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.lightGrey,
    fontWeight: '500',
  },
  businessListContainer: {
    flex: 1,
    paddingTop: 5,
  },
   businessCard: {
    padding: 20,
    marginBottom: 20,
  },
   businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold'
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  editText: {
    fontSize: 14,
    color: '#767676',
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  addressContainer: {
    marginBottom: 16,
    paddingBottom: 16
  },
  deliveryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  deliveryBackground: {
   backgroundColor: colors.lightWhite,
   flexDirection: "row",
   alignItems: 'center',
   padding: 10,
    borderRadius: 4
  },
  deliveryStatus: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  deliveryAvailable: {
    color: colors.blue,
  },
  deliveryNotAvailable: {
    color: colors.blue,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 5,
  },
  locationIcon: {
    width: 11.67,
    height: 16.67,
  },
  addressText: {
    fontSize: 14,
    color: colors.darkGray,
    flex: 1,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular'
  },
  deliveryDetails: {
    marginTop: 3,
    paddingLeft: 30,
  },
  deliveryExplanation: {
    fontSize: 14,
    color: colors.lightGrey,
    opacity: 0.8,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
    marginBottom: 4,
  },
  deliveryFee: {
    fontSize: 12,
    color: colors.lightGrey,
    fontWeight: '400',
    marginTop: 4,
    fontFamily: 'WorkSans_400Regular'
  },
  addressSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 20
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.darkGray,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.darkGray,
    width: 20,
    height: 20,
    borderWidth: 0,
    borderRadius: 4,
    borderColor: 'none',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular'
  },
  saveButton:{
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configureButtonText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 20,
  },
  selectedAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedAddressText: {
    fontSize: 14,
    color: colors.darkGray,
    marginLeft: 10,
    fontWeight: '400'
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.darkGray,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  daysLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  daysInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'left',
  },
  daysText: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.border,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  feeLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  feeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.darkGray,
  },
  buttonContainer: {
   flexDirection: "row", 
   gap: 10,
  },
  saveButtonText: {
    color: colors.bg,
    fontWeight: '400',
    fontSize: 14,
  }
});