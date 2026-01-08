import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';
import * as Linking from 'expo-linking';
import BoostAdModal from '@/app/components/modals/BoostAdModal';
import PaymentMethodModal from '@/app/components/modals/PaymentMethodModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BusinessModal from '@/app/components/modals/BusinessModal';
import MultiSelectDropdown from '@/app/reusables/MultiSelectDropdown';
import PostAdInput from '@/app/reusables/PostAdInput';
import { LinearGradient } from 'expo-linear-gradient';
import PostAdDropdown from '@/app/reusables/PostAdDropdown';
import PostAdTextArea from '@/app/reusables/PostAdTextArea';

interface Business {
    _id: string;
    businessName: string;
}


const DropdownModal = ({ visible, onClose, options, onSelect, title}: any) => (
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


// ===== MAIN VEHICLE DETAILS FORMS 
export default function VehicleDetailsForm() {
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
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [userHasPaidPlan, setUserHasPaidPlan] = useState(false);
    const [userHighestPlan, setUserHighestPlan] = useState<string | null>(null);


    // Form fields 
     const [formData, setFormData] = useState({
    vehicleType: '',
    model: '',
    year: '',
    trim: '',
    color: '',
    interiorColor: '',
    transmission: '',
    vinChassisNumber: '',
    carRegistered: '',
    exchangePossible: '',
    carType: '',
    carBody: '',
    fuel: '',
    seat: '',
    driveTrain: '',
    numberOfCylinders: '',
    engineSizes: '',
    horsePower: '',
    carKeyFeatures: '',
    carCondition: '',
    mileage: '',
    amount: '',
    negotiation: '',
    description: ''
  });

  const dropdownData: Record<string, string[]> = {
    vehicleType: ['Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Nissan', 'Ford', 'Hyundai', 'Mazda', 'Volkswagen', 'Audi', 'Chevrolet', 'Kia', 'Peugeot'],
    
    year: ['2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    
    model: ['Corolla', 'Camry', 'Accord', 'Civic', 'C-Class', 'E-Class', 'X5', 'RX350', 'Altima', 'Sentra', 'Highlander', 'RAV4', 'Pilot', 'CR-V', 'GLK', 'GLE', 'X3', 'ES350', 'GS350'],
    
    trim: ['Base', 'S', 'SE', 'LE', 'XLE', 'Limited', 'Sport', 'Touring', 'Premium', 'Luxury', 'Ultimate', 'Platinum', 'SR5', 'TRD', 'Denali', 'SLT', 'LT', 'LTZ'],
    
    color: ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown', 'Gold', 'Orange', 'Yellow', 'Purple', 'Beige', 'Pearl White', 'Metallic Gray', 'Navy Blue', 'Burgundy'],
    
    interiorColor: ['Black', 'Gray', 'Beige', 'Tan', 'Brown', 'Cream', 'White', 'Red', 'Blue', 'Burgundy', 'Saddle', 'Charcoal'],
    
    transmission: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic', 'Dual-Clutch'],
    
    carRegistered: ['Yes', 'No'],
    
    exchangePossible: ['Yes', 'No'],
    
    carType: ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Van', 'Truck', 'Convertible', 'Wagon', 'Minivan', 'Crossover', 'Pickup Truck'],
    
    carBody: ['2-door', '4-door', '5-door', 'Pickup', 'Extended Cab', 'Crew Cab'],
    
    fuel: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Flex Fuel'],
    
    seat: ['2', '4', '5', '6', '7', '8', '9+'],
    
    driveTrain: ['FWD', 'RWD', 'AWD', '4WD'],
    
    numberOfCylinders: ['3', '4', '5', '6', '8', '10', '12'],
    
    engineSizes: ['1.0L', '1.2L', '1.4L', '1.5L', '1.6L', '1.8L', '2.0L', '2.2L', '2.4L', '2.5L', '2.7L', '3.0L', '3.5L', '4.0L', '4.6L', '5.0L', '5.7L', '6.0L'],
    
    horsePower: ['50-100 HP', '100-150 HP', '150-200 HP', '200-250 HP', '250-300 HP', '300-350 HP', '350-400 HP', '400-500 HP', '500+ HP'],
    
    negotiation: ['Yes', 'No'],
    
    carCondition: ['Brand New', 'Foreign Used', 'Nigerian Used', 'Locally Used'],
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

       // Fetch Vehicle Draft 
       const vehicleResponse = await apiClient.get(`/api/vehicles/draft/${draftCarAdId}`);
       const vehicleAd = vehicleResponse.data.vehicleAd;

       // Pre-fill form data 
       setFormData({
        vehicleType: vehicleAd.vehicleType || '',
        model: vehicleAd.model || '',
        year: vehicleAd.year || '',
        trim: vehicleAd.trim || '',
        color: vehicleAd.color || '',
        interiorColor: vehicleAd.interiorColor || '',
        transmission: vehicleAd.transmission || '',
        vinChassisNumber: vehicleAd.vinChassisNumber || '',
        carRegistered: vehicleAd.carRegistered || '',
        exchangePossible: vehicleAd.exchangePossible || '',
        carType: vehicleAd.carType || '',
        carBody: vehicleAd.carBody || '',
        fuel: vehicleAd.fuel || '',
        seat: vehicleAd.seat || '',
        driveTrain: vehicleAd.driveTrain || '',
        numberOfCylinders: vehicleAd.numberOfCylinders || '',
        engineSizes: vehicleAd.engineSizes || '',
        horsePower: vehicleAd.horePower || '',
        carKeyFeatures: vehicleAd.carKeyFeatures || '',
        carCondition: vehicleAd.carCondition || '',
        mileage: vehicleAd.mileage || '',
        amount: vehicleAd.amount || '',
        negotiation: vehicleAd.negotiation || '',
        description: vehicleAd.description || '',
       });

       // Set Business if available 
       if (vehicleAd.businessCategory) {
        setSelectedBusiness({
          _id: vehicleAd.businessCategory._id || vehicleAd.businessCategory,
          businessName: vehicleAd.businessCategory.businessName || 'Selected Business'
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
      const response = await apiClient.get("/api/profile");
      if (response?.data) {
        setWalletBalance(response.data.walletBalance || 0);

        // CHeck user has any successful paid plans 
        const paidPlans = response.data.paidPlans || [];
        const successfulPlans = paidPlans.filter((p: any) => p.status === 'success');

        if (successfulPlans.length > 0) {
          setUserHasPaidPlan(true);
          // Get Highest plan 
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
  }

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
      // Show payment method modal 
      setShowPaymentModal(true);
    } else {
      submitAd(planId, false);
    }
  };

  const handlePostFree = () => {
    setShowBoostModal(false);
    setSelectedPlan('free');
    submitAd('free', false);
  }

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

     // Match your backend expectations exactly
     const payload = {
      ...formData,
      businessCategory: selectedBusiness?._id,
      plan: plan,
      useWalletBalance: useWallet,
      carAdId: carAdId || undefined
     };

     console.log('📤 Submitting vehicle ad:', payload);

     const response = await apiClient.post('/api/vehicles/post-vehicle-ad', payload);

     console.log('✅ Response:', response.data);

     if (response.data.data.paymentStatus === 'success') {
      showSuccessToast('Vehicle ad posted successfully!');
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

    if (!formData.vehicleType || !formData.model || !formData.amount || !formData.year) {
      showErrorToast('Please fill all required fields (Make, Model, Year, Amount)');
      return;
    }

    // Check if yser has exisiting paid plan - if yes, skip boost modal 
    if (userHasPaidPlan) {
      console.log('User has existing plan:', userHighestPlan);
      showSuccessToast('Using your existing plan...');
      setTimeout(() => router.push('/protected/myads'), 1500);
      submitAd('free', false);
    } else {
      // New user - show  boost modal 
      setShowBoostModal(true);
    }
  };

  const startPaymentPolling = (reference: string) => {
    let attempts = 0;
    const maxAttempts = 60;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
       if (!apiClient) {
        return;
       }
       console.log(`Polling payment ${attempts}/${maxAttempts}...`);

       const verifyResponse = await apiClient.get(`/api/vehicles/verify-payment/${reference}`);

       if (verifyResponse?.status === 200 || verifyResponse?.data?.message?.includes('success')) {
        clearInterval(pollInterval);
        showSuccessToast('Payment verified! Vehicled ad posted successfully!');
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

      const payload = {
        ...formData,
        businessCategory: selectedBusiness._id,
        carAdId: carAdId || undefined,
        plan: userHighestPlan || selectedPlan || "free",
        isDraft: true
      };

      console.log('💾 Saving draft:', payload);

      const response = await apiClient.post('/api/vehicles/save-draft', payload);

      showSuccessToast('Draft Saved successfully!');
      setTimeout(() => router.push('/protected/myads'), 1500);
    } catch(error: any) {
      console.error('❌ Save draft error:', error.response?.data || error);
      showErrorToast(error.response?.data?.error || 'Failed to save draft');
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
          {isDraftMode ? 'Complete Vehicle Ad' : 'Post Vehicle Ad'}
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

        {/* Form Fields - Two Column Layout */}
        <View style={styles.row}>
          <PostAdDropdown
             label="Make"
             value={formData.vehicleType}
             onPress={() => openDropdown('vehicleType', 'Make')}
          />

          <PostAdDropdown
            label="Model"
            value={formData.model}
            onPress={() => openDropdown('model', 'Model')}
          />
        </View>
        

        <View style={styles.row}>
          <PostAdDropdown
          label="Manufacture year"
           value={formData.year}
           onPress={() => openDropdown('year', 'Manufacture year')}
          />
          <PostAdDropdown
            label="Trim"
            value={formData.trim}
            onPress={() => openDropdown('trim', 'Trim')}
          />
        </View>

        <View style={styles.row}>
          <PostAdDropdown
            label="Color"
            value={formData.color}
            onPress={() => openDropdown('color', 'Color')}
          />
          <PostAdDropdown
            label="Interior Color"
            value={formData.interiorColor}
            onPress={() => openDropdown('interiorColor', 'Interior color')}
          />
        </View>

        <View style={styles.row}>
          <PostAdDropdown
            label="Transmission"
            value={formData.transmission}
            onPress={() => openDropdown('transmission', 'Transmission')}
          />
          <PostAdInput
             label="VIN chassis number"
             placeholder="Enter"
             value={formData.vinChassisNumber}
             onChangeText={(value) => updateField('vinChassisNumber', value)}
          />
        </View>

        <View style={styles.row}>
          <PostAdDropdown
            label="Is the vehicle registererd?"
            value={formData.carRegistered}
            onPress={() => openDropdown('carRegistered', 'Is the car registered?')}
          />
          <PostAdDropdown
            label="Is exchange possible?"
            value={formData.exchangePossible}
            onPress={() => openDropdown('exchangePossible', 'Is exchange possible?')}
          />
        </View>

        <View style={styles.row}>
          <PostAdDropdown
             label="Vehicle Type"
             value={formData.carType}
             onPress={() => openDropdown('carType', 'Car Type')}
          />
         <PostAdInput 
           label="Mileage (km)"
           placeholder="Enter mileage"
           value={formData.mileage}
           keyboardType='numeric'
           onChangeText={(value) => updateField('mileage', value)}
         />
        </View>

        <MultiSelectDropdown
           label="Key Features"
           selectedValues={formData.carKeyFeatures ? formData.carKeyFeatures.split(', ') : []}
           options={[
            'Air Conditioning',
            'Leather Seats',
            'Alloy Wheels',
            'Navigation System',
             'Sunroof',
             'Bluetooth',
             'Backup Camera',
            'Blind Spot Monitor',
          ]}
         onChange={(values) =>
         updateField('carKeyFeatures', values.join(', '))
        }
        />

        <PostAdDropdown
          label="Car Condition"
          value={formData.carCondition}
          onPress={() => openDropdown('carCondition', 'Car Condition')}
        />

        <View style={styles.row}>
          <PostAdDropdown
            label="Fuel Type"
            value={formData.fuel}
            onPress={() => openDropdown('fuel', 'Fuel Type')}
          />
        
          <PostAdDropdown
             label="Car Body"
             value={formData.carBody}
             onPress={() => openDropdown('carBody', 'Car Body')}
          />
        </View>

        <View style={styles.row}>
          <PostAdDropdown
            label="Seat"
            value={formData.seat}
            onPress={() => openDropdown('seat', 'Seat')}
          />
        
           <PostAdDropdown
              label="Drive Train"
              value={formData.driveTrain}
              onPress={() => openDropdown('driveTrain', 'Drive Train')}
           />
        </View>

        <View style={styles.row}>
          <PostAdDropdown
            label="Number of Cylinders"
            value={formData.numberOfCylinders}
            onPress={() => openDropdown('numberOfCylinders', 'Number of Cylinders')}
          />
          <PostAdDropdown
            label="Engine Size"
            value={formData.engineSizes}
            onPress={() => openDropdown('engineSizes', 'Engine Sizes')}
          />
        </View>

        <PostAdDropdown
           label="Horse Power"
          value={formData.horsePower}
          onPress={() => openDropdown('horsePower', 'Horse Power')}
        />

        <View style={styles.row}>
         <PostAdInput 
           label="Amount"
           placeholder="Enter your amount"
           keyboardType="numeric"
           value={formData.amount}
           onChangeText={(value) => updateField('amount', value)}
         />
         <PostAdDropdown 
            label="Are you open for negotiation?"
            value={formData.negotiation}
            onPress={() => openDropdown('negotiation', 'Are you open for negotiation?')}
         />
        </View>

          {/* Business Selection */}
        <Text style={styles.label}>Enter business category</Text>
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
         placeholder="Enter the description of your vehicle"
         value={formData.description}
         onChangeText={(value) => updateField('description', value)}
        />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.draftButton, savingDraft && styles.buttonDisabled]}
            onPress={handleSaveAsDraft}
            disabled={savingDraft}
          >
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
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.bg} />
              ): (
                <Text style={styles.postButtonText}>Post Ad</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 40 }} />
    </KeyboardAwareScrollView>

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
          showErrorToast("Insufficient funds. Please fund your wallet to continue.");
          router.push("/protected/wallet");
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
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  fieldContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.black,
    height: 52,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14
  },
  characterCount: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'right',
    marginTop: 4
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
  // Modal styles
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
  businessItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  businessText: {
    fontSize: 15,
    color: colors.black
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
  }
});