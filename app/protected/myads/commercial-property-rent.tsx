import React, { useState, useEffect} from 'react';
import { 
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 Modal,
 ScrollView,
 ActivityIndicator,
 Platform,
 StatusBar
} from "react-native"
import { AntDesign } from '@expo/vector-icons';
import apiClient from '@/app/utils/apiClient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';
import * as Linking from 'expo-linking';
import BoostAdModal from '@/app/components/modals/BoostAdModal';
import PaymentMethodModal from '@/app/components/modals/PaymentMethodModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BusinessModal from '@/app/components/modals/BusinessModal';
import MultiSelectDropdown from '@/app/reusables/MultiSelectDropdown';
import PostAdInput from '@/app/reusables/PostAdInput';
import PostAdDropdown from '@/app/reusables/PostAdDropdown';
import PostAdTextArea from '@/app/reusables/PostAdTextArea';
import { LinearGradient } from 'expo-linear-gradient';

interface Business {
  _id: string;
  businessName: string;
}

const DropdownModal = ({ visible, onClose, options, onSelect, title }: any) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={24} color={colors.darkGray} />
          </TouchableOpacity>
        </View>
        <ScrollView>
            {options.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownOption}
                onPress={() => {
                    onSelect(option);
                    onClose();
                }}
              >
               <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);


const ServiceChargesModal = ({ visible, onClose, services, onAddService, onRemoveService}: any) => {
    const [serviceName, setServiceName] = useState('');
    const [serviceFee, setServiceFee] = useState('');

    const handleAdd = () => {
     if (serviceName.trim() && serviceFee.trim()) {
        onAddService({ name: serviceName.trim(), fee: serviceFee.trim() });
        setServiceName('');
        setServiceFee('');
     } else {
        showErrorToast('Please enter both service name and fee');
     }
    };

    return (
      <Modal visible={visible} transparent animationType="slide">
       <View style={styles.modalOverlay}>
         <View style={styles.modalContainer}>
           <View style={styles.modalHeader}>
             <Text style={styles.modalTitle}>Service Charges</Text>
             <TouchableOpacity onPress={onClose}>
               <AntDesign name="close" size={24} color={colors.darkGray} />
             </TouchableOpacity>
           </View>

           <ScrollView>
            <View style={styles.row}>
              <PostAdInput
                label="Service name"
                placeholder="e.g maintenance fee"
                value={serviceName}
                onChangeText={setServiceName}
              />
              <PostAdInput
               label="Service charge fee"
               placeholder="Enter amount"
               value={serviceFee}
               onChangeText={setServiceFee}
               keyboardType="numeric"
              />
            </View>

            <TouchableOpacity 
              style={styles.addAnotherButton} 
              onPress={handleAdd}>
              <AntDesign name="plus-circle" size={18} color={colors.blue} />
              <Text style={styles.addAnotherText}>Add Another service</Text>
            </TouchableOpacity>
            
            {services.map((service: any, index: number) => (
                <View
                  key={index}
                  style={styles.serviceItem}
                >
                 <View style={{ flex: 1 }}>
                   <Text style={styles.serviceName}>{service.name}</Text>
                   <Text style={styles.serviceFee}>₦{service.fee}</Text>
                 </View>
                 <TouchableOpacity onPress={() => onRemoveService(index)}>
                   <AntDesign name="delete" size={20} color={colors.red} />
                 </TouchableOpacity>
                </View>
            ))}
           </ScrollView>

           <TouchableOpacity style={styles.doneButton} onPress={onClose}>
             <Text style={styles.doneButtonText}>Done</Text>
           </TouchableOpacity>
         </View>
       </View>
      </Modal>
    );
};

export default function CreateCommercialPropertyRentForm() {
const router = useRouter();
    const params = useLocalSearchParams();
    const { category, plan, paymentMethod, carAdId } = params;

    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [businessModalVisible, setBusinessModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [isDraftMode, setIsDraftMode] = useState(false);

    // Dropdown modal state 
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [dropdownTitle, setDropdownTitle] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);

    // Boost & Payment modals 
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [userHasPaidPlan, setUserHasPaidPlan] = useState(false);
    const [userHighestPlan, setUserHighestPlan] = useState<string | null>(null);

    // Service charges 
    const [serviceChargesModalVisible, setServiceChargesModalVisible] = useState(false);
    const [serviceCharges, setServiceCharges] = useState<{ name: string; fee: string}[]>([]);

    // Form fields 
    const [formData, setFormData] = useState({
       propertyName: '',
       propertyAddress: '',
       propertyType: '',
       furnishing: '',
       parking: '',
       squareMeter: '',
       ownershipStatus: '',
       serviceCharge: '',
       serviceFee: '',
       propertyFacilities: '',
       propertyDuration: '',
       propertyCondition: '',
       amount: '',
       negotiation: '',
       description: '',
    });

   const dropdownData: Record<string, string[]> = {
    propertyType: [
    "Detached House",
    "Semi-Detached House",
    "Terraced House",
    "Flat / Apartment",
    "Bungalow",
    "Office Space",
    "Shop",
    "Warehouse",
    "Land",
    ],
    furnishing: ["Furnished", "Unfurnished", "Partially Furnished"],
    parking: ["Yes", "No", "Available Nearby"],
    ownershipStatus: ["Owner", "Agent", "Care taker"],
    serviceCharge: ["Yes", "No"],
    propertyCondition: ["Newly Built", "Off plan", "Uncomplete building", "under construction"],
    propertyDuration: ["1 Month", "3 Months", "6 Months", "1 Year", "2 Years", "Negotiable"],
    negotiation: ["Yes", "No"]
  };
       
 useEffect(() => {
     fetchUserProfile();
   }, []);

  useEffect(() => {
    const fetchDraftData = async () => {
       const draftMode = params.isDraft === 'true';
       const draftCarAdId = params.carAdId;

       if (!draftMode || !draftCarAdId) {
        return;
       }

       setIsDraftMode(true);
       setIsLoadingDraft(true);

       try {
        if (!apiClient) return;

        const propertyResponse = await apiClient.get(`/api/property/draft/${draftCarAdId}`);
        const propertyAd = propertyResponse.data.propertyAd;

        setFormData({
         propertyName: propertyAd.propertyName || '',
         propertyAddress: propertyAd.propertyAddress || '',
         propertyType: propertyAd.propertyType || '',
         furnishing: propertyAd.furnishing || '',
         parking: propertyAd.parking || '',
         squareMeter: propertyAd.squareMeter || '',
         ownershipStatus: propertyAd.ownershipStatus || '',
         serviceCharge: propertyAd.serviceCharge || '',
         serviceFee: propertyAd.serviceFee || '',
         propertyFacilities: propertyAd.propertyFacilities || '',
         propertyDuration: propertyAd.propertyDuration || '',
         propertyCondition: propertyAd.propertyCondition || '',
         amount: propertyAd.amount || '',
         negotiation: propertyAd.negotiation || '',
         description: propertyAd.description || '',
        });

        if (propertyAd.businessCategory) {
          setSelectedBusiness({
            _id: propertyAd.businessCategory._id || propertyAd.businessCategory,
            businessName: propertyAd.businessCategory.businessName || 'Selected Business'
          });
        }

        showSuccessToast('Draft loaded! Complete your ad details.');
       } catch (error: any) {
        showErrorToast('Failed to load draft');
       } finally {
        setIsLoadingDraft(false);
       }
    };
    
    fetchDraftData();
  }, [params.carAdId, params.isDraft]);

  
   const fetchUserProfile = async () => {
     try {
       if (!apiClient) {
        return;
       }
       const response = await apiClient.get('/api/profile');
       if (response?.data) {
        setWalletBalance(response.data.walletBalance || 0);

        const paidPlans = response.data.paidPlans || [];
        const successfulPlans = paidPlans.filter((p: any) => p.status === 'success');

        if (successfulPlans.length >  0) {
          setUserHasPaidPlan(true);
          const priorityMap: Record<string, number> = {
            free: 1, basic: 2, premium: 3, vip: 4, diamond: 5, enterprise: 6
          };
          let highest = 'free';
          let highestPriority = 0;
          successfulPlans.forEach((p: any) => {
            const priority = priorityMap[p.planType] || 0;
            if (priority > highestPriority) {
              highestPriority = priority;
              highest = p.planType;
            }
          });
          setUserHighestPlan(highest);
        }
       }
     } catch (error: any) {
      console.error('Error fetching user profile:', error);
     }
   };

   const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value});
  };

  const openDropdown = (field: string, title: string) => {
    setActiveDropdown(field);
    setDropdownTitle(title);
    setDropdownOptions(dropdownData[field] || []);
  };


  const handleBoostPlanSelected = (planId: string) => {
    setSelectedPlan(planId);
    setShowBoostModal(false);

    const planAmounts: Record<string, number> = {
       basic: 15000,
       premium: 30000,
       vip: 45000,
       enterprise: 100000
    };
    
    const amount = planAmounts[planId] || 0;
    
    if (amount > 0) {
      setShowPaymentModal(true);
    } else {
      submitAd(planId, false);
    }
  };

  const handlePostFree = () => {
    setShowBoostModal(false);
    setSelectedPlan('free');
    submitAd('free', false);
  };

 const handlePaymentMethodSelected = (useWallet: boolean) => {
    setShowPaymentModal(false);

    const planAmounts: Record<string, number> = {
      basic: 15000,
      premium: 30000,
      vip: 45000,
      enterprise: 100000
    };

    const amount = planAmounts[selectedPlan || 'basic'] || 0;

    if (useWallet && walletBalance < amount) {
      showErrorToast('Insufficient wallet balance. Please fund your wallet.');
      router.push('/protected/wallet');
      return;
    }

    submitAd(selectedPlan || 'free', true);
  };


   const submitAd = async (plan: string, useWallet: boolean) => {
    try {
      setLoading(true);

      if (!apiClient) {
        showErrorToast('API client not initialized');
        return;
      }

      const payload = {
        ...formData,
        businessCategory: selectedBusiness?._id,
        propertyFacilities: formData.propertyFacilities ? formData.propertyFacilities.split(', ') : [],
        serviceFee: formData.serviceCharge === "Yes" ? serviceCharges : null,
        plan: plan,
        useWalletBalance: useWallet,
        carAdId: carAdId || undefined
      };

      console.log('📤 Submitting property ad:', payload);

      const response = await apiClient.post('/api/property/create-commercial-rent', payload);

      console.log('✅ Response:', response.data);

      if (response.data.data.paymentStatus === 'success') {
        showSuccessToast('Property ad posted successfully!');
        setTimeout(() => router.push('/protected/myads'), 1500);
      } else if (response.data.data.paymentUrl) {
        showSuccessToast('Redirecting to payment...');
        await Linking.openURL(response.data.data.paymentUrl);
        startPaymentPolling(response.data.data.reference);
      }
    } catch (error: any) {
      console.error("❌ Submit ad error:", error.response?.data || error);
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message ||
                           'Failed to post ad';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    if (!selectedBusiness) {
      showErrorToast('Please select a business');
      return;
    }

    if (!formData.propertyName || !formData.propertyAddress || !formData.amount) {
      showErrorToast('Please fill all required fields (Title, Address, Amount)');
      return;
    }

    if (userHasPaidPlan) {
      console.log('User has existing plan:', userHighestPlan);
      showSuccessToast('Using your existing plan...');
      submitAd('free', false);
    } else {
      setShowBoostModal(true);
    }
  };

  const startPaymentPolling = (reference: string) => {
    let attempts = 0;
    const maxAttempts = 60;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        if (!apiClient) return;
        console.log(`Polling payment ${attempts}/${maxAttempts}...`);

        const verifyResponse = await apiClient.get(`/api/property/verify-payment/${reference}`);

        if (verifyResponse?.status === 200 || verifyResponse?.data?.message?.includes('success')) {
          clearInterval(pollInterval);
          showSuccessToast('Payment verified! Property ad posted successfully!');
          setTimeout(() => router.push('/protected/myads'), 1500);
        }
      } catch (error: any) {
        console.log('Poll attempt failed:', error.message);

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          showErrorToast('Payment verification timed out. Check your ads page.');
        }
      }
    }, 3000);
  };

  
      const handleSaveAsDraft = async () => {
        if (!selectedBusiness) {
           showErrorToast("Please select a business");
           return;
        }
        
        try {

          if (!apiClient) {
            showErrorToast("API client not initialized");
            return;
          }
         setSavingDraft(true);
         

         const payload = {
          ...formData,
          businessCategory: selectedBusiness._id,
          propertyFacilities:  Array.isArray(formData.propertyFacilities)
        ? formData.propertyFacilities
        : formData.propertyFacilities
        ? formData.propertyFacilities.split(",").map((f) => f.trim())
        : [],
         serviceFee: formData.serviceCharge === "Yes" ? Number(formData.serviceFee) || 0 : 0,
         carAdId: carAdId || null,
         plan: userHighestPlan || selectedPlan || "free",
         isDraft: true
         };

           console.log("💾 Draft payload:", payload);
           
           const response = await apiClient.post("/api/property/save-draft", payload);

           if (response?.data?.data) {
            showSuccessToast("Draft saved successfully!");
            setTimeout(() => router.push("/protected/myads"), 1500);
           } else {
            showErrorToast("Failed to save draft.");
           }
        } catch (error: any) {
          console.error("❌ Draft save error:", error.response?.data || error.message);
            const errMsg =
            error.response?.data?.error || error.response?.data?.message || "Submit draft ad error";
            showErrorToast(errMsg);
        } finally {
          setSavingDraft(false);
        }
      };
      
  return (
   <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()}>
           <AntDesign name="arrow-left" size={24} color={colors.darkGray} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isDraftMode ? 'Complete Commercial property for rent Ad' : 'Post a Commercial property for rent Ad'}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === 'ios' ? 100 : 80,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form fields - Two Colums Layout */}
        <View style={styles.row}>
          <PostAdInput
           label="Title"
           placeholder="Enter name of the property"
           value={formData.propertyName}
           onChangeText={(value) => updateField('propertyName', value)}
          />
        </View>

        <View style={styles.row}>
          <PostAdInput
            label="Address"
            placeholder="Enter the address of the property"
            value={formData.propertyAddress}
            onChangeText={(value) => updateField('propertyAddress', value)}
          />
        </View>

        <View style={styles.row}>
          <PostAdDropdown
           label="Property Type"
           value={formData.propertyType}
          onPress={() => openDropdown('propertyType', 'Title')}
          />
           <PostAdDropdown
           label="Furnishing"
           value={formData.furnishing}
          onPress={() => openDropdown('furnishing', 'furnishing')}
          />
        </View>

         <View style={styles.row}>
          <PostAdDropdown
           label="Is there a parking space"
           value={formData.parking}
          onPress={() => openDropdown('parking', 'parking')}
          />
           <PostAdInput
           label="Square Meters (sqm)"
           placeholder="Enter"
           value={formData.squareMeter}
           onChangeText={(value) => updateField('squareMeter', value)}
          />
        </View>
        
        <View style={styles.row}>
         <PostAdDropdown
           label="Are you opened for negotiation"
           value={formData.negotiation}
           onPress={() => openDropdown('negotiation', 'negotiation')}
         />
         <PostAdDropdown
           label="Are you the owner or an agent of the property"
           value={formData.ownershipStatus}
           onPress={() => openDropdown('ownershipStatus', 'ownershipStatus')}
         />
        </View>

        <View style={styles.row}>
          <PostAdDropdown
            label="Duration"
            value={formData.propertyDuration}
            onPress={() => openDropdown('propertyDuration', 'propertyDuration')}
          />
          <PostAdInput
            label="Amount"
            value={formData.amount}
            placeholder="Enter your amount"
            onChangeText={(value) => updateField('amount', value)}
            keyboardType="numeric" 
          />
        </View>

        <View style={{
          backgroundColor: colors.bg,
          paddingHorizontal: 14,
          marginTop: 20,
          paddingVertical: 10,
        }}>
         <View style={styles.row}>
           <PostAdDropdown
             label="Is there a service charge?"
             value={formData.serviceCharge}
             onPress={() => openDropdown('serviceCharge', 'serviceCharge')}
           />
         </View>

         {formData.serviceCharge === 'Yes' && (
          <View style={[styles.row, { marginTop: 16 }]}>
            <PostAdInput
              label="Service charge fee"
              placeholder="Enter service fee amount"
              value={formData.serviceFee}
              onChangeText={(value) => updateField('serviceFee', value)}
             />
           </View>
           )}
        </View>

          <View style={styles.row}>
          <MultiSelectDropdown
            label="Property Facilities"
            selectedValues={formData.propertyFacilities ? formData.propertyFacilities.split(', ') : []}
           options={[
            'Air Conditioning',
            'Backup Power Generator',
            'Balcony',
            'Barbecue Arena',
            'Dining Area',
            'Elevator/Lift',
            'Fire Safety Systems',
            'Guest Toilet',
            'In-Built Wardrobes',
            'Parking Space',
            'POP Ceiling',
            'Water Heater',
            'Well',
            'WiFi',
            '24/7 Security',
            'CCTV'
          ]}
          onChange={(values) =>
            updateField('propertyFacilities', values.join(', '))
          }
        />
         <PostAdDropdown
          label="Property Condition"
          value={formData.propertyCondition}
          onPress={() => openDropdown('propertyCondition', 'propertyCondition')}
         />
         </View>

         {/* Business Selection */}
         <Text style={styles.label}>Enter Business category</Text>
           <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setBusinessModalVisible(true)}>
            <Text style={selectedBusiness ? styles.dropdownTextFilled : styles.dropdownTextPlaceholder}>
                {selectedBusiness?.businessName || 'Select'}
             </Text>
            <AntDesign name="down" size={16} color={colors.darkGray} />
          </TouchableOpacity>

          <PostAdTextArea
           label="Description"
           placeholder="Enter the description of this property"
           value={formData.description}
           onChangeText={(value) => updateField('description', value)}
          />

          {/* Action Button */}
          <View style={styles.buttonContainer}>
             <TouchableOpacity
                style={[styles.draftButton, savingDraft && styles.buttonDisabled]}
                onPress={handleSaveAsDraft}
               disabled={savingDraft}>
             {savingDraft ? (
               <ActivityIndicator color={colors.blue} />
              ) : (
               <Text style={styles.draftButtonText}>Save as draft</Text>
             )}
         </TouchableOpacity>


         <LinearGradient
            colors={['#00A8DF', '#1031AA']}
            start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 0 }}
           style={[styles.gradientContainer, loading && styles.buttonDisabled]}
           >
          <TouchableOpacity
             style={styles.postButton}
             onPress={handleSubmit}
             disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color={colors.bg} />
             ): (
             <Text style={styles.postButtonText}>Post Ad</Text>
            )}
           </TouchableOpacity>
         </LinearGradient>
          </View>

          <View style={{ height: 40 }} />

          {/* Modals */}
          <BusinessModal
             visible={businessModalVisible}
             onClose={() => setBusinessModalVisible(false)}
             onSelect={setSelectedBusiness}
          />
          <DropdownModal
        visible={activeDropdown !== null}
        onClose={() => setActiveDropdown(null)}
        options={dropdownOptions}
        onSelect={(value: string) => updateField(activeDropdown!, value)}
        title={dropdownTitle}
      />
      <BoostAdModal
              visible={showBoostModal}
              onClose={() => setShowBoostModal(false)}
              onSelectPlan={handleBoostPlanSelected}
              onPostFree={handlePostFree}
            />
      
            <PaymentMethodModal
               visible={showPaymentModal}
               onClose={() => setShowPaymentModal(false)}
               onSelectWallet={() => handlePaymentMethodSelected(true)}
               onFundWallet={() => {
                setShowPaymentModal(false);
                showErrorToast('Insufiicient funds. Please fund your wallet to continue.');
                router.push('/protected/wallet');
               }}
               walletBalance={walletBalance}
               requiredAmount={selectedPlan ? 
               {basic: 15000, premium: 30000, vip: 45000, enterprise: 100000}[selectedPlan] || 0 : 0}
            />
            {isLoadingDraft && (
             <View style={styles.loadingOverlay}>
               <ActivityIndicator size="large" color={colors.blue} />
               <Text style={styles.loadingText}>Loading draft...</Text>
             </View>
            )}
      </KeyboardAwareScrollView>
   </View>
  )
}


const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 50,
    backgroundColor: colors.bg,
    shadowColor: '#4D485F1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  headerContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 8,
    marginTop: 16
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 52,
  },
  dropdownTextPlaceholder: {
    fontSize: 14,
    color: colors.lightGray
  },
  dropdownTextFilled: {
    fontSize: 14,
    color: colors.black
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32
  },
  draftButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center'
  },
  draftButtonText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  postButtonText: {
    fontSize: 16,
    color: colors.bg,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginTop: 16,
  },
  addServiceButtonText: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: '500',
  },
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  addAnotherText: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: '500',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginTop: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  serviceFee: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 4,
  },
  doneButton: {
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    color: colors.bg,
    fontWeight: '600',
  },
  loadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
},
loadingText: {
  marginTop: 12,
  fontSize: 16,
  fontWeight: '600',
  color: colors.darkGray,
  fontFamily: 'WorkSans_600SemiBold',
},
});