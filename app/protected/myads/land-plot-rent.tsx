import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import PostAdDropdown from '@/app/reusables/PostAdDropdown';
import PostAdInput from '@/app/reusables/PostAdInput';
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

export default function LandAndPlotSaleAdForm() {
   const router = useRouter();
   const params = useLocalSearchParams();
   const {  carAdId} = params;

   const [selectedBusiness, setSelectectBusiness] = useState<Business | null>(null);
   const [businessModalVisible, setBusinessModalVisible] = useState(false);
   const [loading, setLoading] = useState(false);
   const [savingDraft, setSavingDraft] = useState(false);

   // Dropdown modal state 
   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
   const [dropdownTitle, setDropdownTitle] = useState('');
   const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);

   // Boose & Payment modals 
   const [showBoostModal, setShowBoostModal] = useState(false);
   const [showPaymentModal, setShowPaymentModal] = useState(false);
   const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
   const [walletBalance, setWalletBalance] = useState(0);
   const [userHasPaidPlan, setUserHasPaidPlan] = useState(false);
   const [storedCarAdId, setStoredCarAdId] = useState<string | null>(null);
   const [userHighestPlan, setUserHighestPlan] = useState<string | null>(null);


   // Service charges 
   const [serviceCharges, setServiceCharges] = useState<{ name: string; fee: string}[]>([]);

   useEffect(() => {
  const loadCarAdId = async () => {
    if (carAdId) {
      setStoredCarAdId(carAdId as string);
      await AsyncStorage.setItem('currentCarAdId', carAdId as string);
    } else {
      const saved = await AsyncStorage.getItem('currentCarAdId');
      if (saved) setStoredCarAdId(saved);
    }
  };
  loadCarAdId();
}, [carAdId]);

   // Form fields 
   const [formData, setFormData] = useState({
     propertyName: '',
     propertyAddress: '',
     propertyType: '',
     squareMeter: '',
     ownershipStatus: '',
     propertyFacilities: '',
     titleDocuments: '',
     negotiation: '',
     serviceCharge: '',
     serviceFee: '',
     developementFee: '',
     surveyFee: '',
     legalFee: '',
     pricingUnit: '',
     amount: '',
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
         ownershipStatus: ["Owner", "Agent", "Care taker"],
         serviceCharge: ["Yes", "No"],
         negotiation: ["Yes", "No"],
         titleDocuments: [
           "Certificate of Occupancy (C of O)", 
           "Deed of Assignment", 
           "Survey Plan", 
           "Governor's Consent",
           "Deed of conveyance"
           ],
           legalFee: ["Document Type", "Valid Informations"],
           pricingUnit: ["Per Slot", "Per Sqm", "Per SqF", "Mixed-Use Land", "Residential Land"],
       };

    
     useEffect(() => {
         fetchUserProfile();
       }, []);
    
      
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

          if (!selectedBusiness?._id) {
            showErrorToast("Please select a business");
            setLoading(false);
            return;
          } 

          if (!formData.propertyName?.trim()) {
            showErrorToast('Property name is required');
            setLoading(false);
            return;
          }

          if (!formData.propertyAddress?.trim()) {
            showErrorToast('Property Address is required');
            setLoading(false);
            return;
          }
    
          if (!apiClient) {
            showErrorToast('API client not initialized');
            return;
          }
    
          const payload = {
            propertyName: formData.propertyName,
            propertyAddress: formData.propertyAddress,
            propertyType: formData.propertyType,
            squareMeter: formData.squareMeter,
            ownershipStatus: formData.ownershipStatus,
            propertyFacilities: formData.propertyFacilities ? formData.propertyFacilities.split(', ') : [],
            titleDocuments: formData.titleDocuments,
            negotiation: formData.negotiation,
            serviceCharge: formData.serviceCharge,
            serviceFee: formData.serviceCharge === 'Yes' ? formData.serviceFee : null,
            developmentFee: formData.developementFee, 
            surveyFee: formData.surveyFee,
            legalFee: formData.legalFee,
            pricingUnits: formData.pricingUnit,
            amount: formData.amount,
            description: formData.description,
            businessCategory: selectedBusiness?._id,
            plan: plan,
            useWalletBalance: useWallet,
             carAdId: storedCarAdId || carAdId || undefined
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
           <Text style={styles.headerTitle}>Lands and Plots for rent & sale</Text>
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
          {/* Form fields - Two columns layout */}
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
            <PostAdInput
             label="Square Meters (sqm)"
             placeholder="Enter"
             value={formData.squareMeter}
             onChangeText={(value) => updateField('squareMeter', value)}
            />
          </View>
          
          <View style={styles.row}>
            <PostAdDropdown
             label="Are you the owner or agents of the property"
             value={formData.ownershipStatus}
             onPress={() => openDropdown('ownershipStatus', 'ownershipStatus')}
           />
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
          </View>

          <View style={styles.row}>
            <PostAdDropdown
              label="Title Documents"
              value={formData.titleDocuments}
              onPress={() => openDropdown('titleDocuments', 'titleDocuments')}
            />
            <PostAdDropdown
              label="Are you opened for negotiation"
              value={formData.negotiation}
              onPress={() => openDropdown('negotiation', 'negotiation')}
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
               placeholder="Enter service"
               value={formData.serviceFee}
               onChangeText={(value) => updateField('serviceFee', value)}
              />
            </View>
          )}

          <PostAdInput
            label="Development fee"
            value={formData.developementFee}
            placeholder="Enter your amount"
            onChangeText={(value) => updateField('developementFee', value)}
          />

          <PostAdInput
            label="Surve fee"
            value={formData.surveyFee}
            placeholder="Enter your survey fee"
            onChangeText={(value) => updateField('surveyFee', value)}
          />

          <PostAdDropdown
            label="Legal fee"
            value={formData.legalFee}
            onPress={() => openDropdown('legalFee', 'legalFee')}
          />
          </View>

          <View style={styles.row}>
            <PostAdDropdown
              label="Pricing Units"
              value={formData.pricingUnit}
              onPress={() => openDropdown('pricingUnit', 'pricingUnit')}
            />
            <PostAdInput
             label="Amount"
             placeholder="Enter your amount"
             value={formData.amount}
             onChangeText={(value) => updateField('amount', value)} 
            />
          </View>

          {/* Business Selection */ }
          <Text style={styles.label}>Enter Business category</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setBusinessModalVisible(true)}
          >
           <Text style={selectedBusiness ? styles.dropdownTextFilled : styles.dropdownTextPlaceholder}>
             {selectedBusiness?.businessName || 'Select'}
           </Text>
           <AntDesign name="down" size={16} color={colors.darkGray} />
          </TouchableOpacity>

          <PostAdTextArea
            label="Description"
            placeholder="Enter the description"
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
                onSelect={setSelectectBusiness}
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
        </KeyboardAwareScrollView>
       </View>
      );
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
});
