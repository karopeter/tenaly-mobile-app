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
  StatusBar,
  TextInput,
} from 'react-native';
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
import PostAdDropdown from '@/app/reusables/PostAdDropdown';
import PostAdInput from '@/app/reusables/PostAdInput';
import PostAdTextArea from '@/app/reusables/PostAdTextArea';
import { LinearGradient } from 'expo-linear-gradient';

interface Business {
  _id: string;
  businessName: string;
}

interface BulkPrice {
  quantity: string;
  unit: string;
  amountPerUnit: string;
}

const BulkPriceModal = ({ visible, onClose, onAdd, existingPrice = null}: any) => {
  const [formData, setFormData] = useState<BulkPrice>({
     quantity: '',
     unit: '',
     amountPerUnit: ''
  });

  useEffect(() => {
    if (existingPrice) {
      setFormData(existingPrice);
    } else {
      setFormData({ quantity: '', unit: '', amountPerUnit: '' });
    }
  }, [existingPrice, visible]);

  const handleAdd = () => {
    if (!formData.quantity || !formData.unit || !formData.amountPerUnit) {
      showErrorToast("Please fill all fields");
      return;
    }
    onAdd(formData);
    setFormData({ quantity: '', unit: '', amountPerUnit: '' });
  };

  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const unitOptions = ['kg', 'bags', 'bunches', 'crates', 'Cup', 'Derica', 'Paint bucket', 'Pieces'];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.bulkModalContainer}>
          <View style={styles.modalHeader}>
           <Text style={styles.modalTitle}>
             {existingPrice ? 'Edit Bulk Price' : 'Bulk Price'}
           </Text>
           <TouchableOpacity onPress={onClose}>
             <AntDesign name="close" size={24} color={colors.darkGray} />
           </TouchableOpacity>
          </View>

          <View style={styles.bulkModalContent}>
            {/* Quantity */}
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantity Range</Text>
            <TextInput
              style={styles.input}
              placeholder="From | E.g 5-12"
              placeholderTextColor="#868686"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            />
            </View>

            {/* Unit Dropdown */}
            <View style={styles.inputContainer}>
               <Text style={styles.label}>Unit</Text>
               <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setUnitDropdownOpen(!unitDropdownOpen)}
               >
                <Text style={formData.unit ? styles.dropdownTextFilled : styles.dropdownTextPlaceholder}>
                  {formData.unit || 'Select'}
                </Text>
                <AntDesign name="down" size={16} color={colors.darkGray} />
               </TouchableOpacity>

               {unitDropdownOpen && (
                <View style={styles.dropdownList}>
                  {unitOptions.map((option) => (
                    <TouchableOpacity
                     key={option}
                     style={styles.dropdownOption}
                     onPress={() => {
                      setFormData({ ...formData, unit: option });
                      setUnitDropdownOpen(false);
                     }}
                    >
                      <Text style={styles.dropdownOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
               )}
            </View>

            {/* Amount Per Unit */}
            <View style={styles.inputContainer}>
             <Text style={styles.label}>Amount per Unit (₦)</Text>
             <TextInput
               style={styles.input}
               placeholder="₦ | Enter your amount"
               keyboardType="numeric"
              placeholderTextColor="#868686"
               value={formData.amountPerUnit}
               onChangeText={(text) => setFormData({ ...formData, amountPerUnit: text })}
             />
            </View>
          </View>

          <View style={styles.bulkModalFooter}>
             <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
             >
             <Text style={styles.cancelButtonText}>Cancel</Text>
             </TouchableOpacity>

            <LinearGradient
            colors={['#00A8DF', '#1031AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientContainer}
          >
            <TouchableOpacity
               style={styles.addButton}
               onPress={handleAdd}
              activeOpacity={0.8}>
                 <Text style={styles.addButtonText}>
                {existingPrice ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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

export default function AgricultureAnimalfeedForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { category, carAdId } = params;

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

  // Bulk price modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingBulkIndex, setEditingBulkIndex] = useState<number | null>(null);

  // Boost & Payment modals
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userHasPaidPlan, setUserHasPaidPlan] = useState(false);
  const [userHighestPlan, setUserHighestPlan] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    agricultureType: '',
    condition: '',
    unit: '',
    bulkPrices: [] as BulkPrice[],
    feedType: '',
    brand: '',
    negotiation: '',
    formulationType: '',
    serviceMode: '',
    experienceLevel: '',
    availability: '',
    amount: '',
    description: '',
  });

  // Dynamic dropdown data based on agriculture category
  const getDropdownData = () => {
    const categoryStr = typeof category === 'string' ? category : '';
    
    // Common fields for all agriculture
    const baseDropdowns: Record<string, string[]> = {
      condition: ['Fresh', 'Frozen', 'Dry', 'Packaged'],
      negotiation: ['Yes', 'No'],
      availability: ['In Stock', 'Pre-order', 'Out of Stock'],
    };

    // Category-specific fields
    if (categoryStr.includes('Fresh Produce')) {
      return {
        ...baseDropdowns,
        agricultureType: ['Fruit', 'Vegetables', 'Grains & Legumes e.g rice', 'Root Crops & Tubers', 'Herbs & Spices', 'Oil', 'Others'],
        unit: ['Kg', 'bags', 'crates', 'bunches', 'Cup', 'Derica', 'Pain bucket', 'Pieces'],
      };
    }

    if (categoryStr.includes('Livestock')) {
      return {
        ...baseDropdowns,
        agricultureType: ['Poultry', 'Goats', 'Cattle', 'Pigs', 'Sheep', 'Fish'],
        unit: ['Per Head', 'Per Kg', 'Per Crate'],
      };
    }

    if (categoryStr.includes('Seeds & Seedlings')) {
      return {
        ...baseDropdowns,
        agricultureType: ['Vegetable Seeds', 'Fruit Seeds', 'Grain Seeds', 'Seedlings'],
        unit: ['kg', 'bags', 'Cup', 'Derica', 'Paint bucket', 'Pieces'],
      };
    }

    if (categoryStr.includes('Animal Feed')) {
      return {
        ...baseDropdowns,
        agricultureType: ['Poultry Feed', 'Cattle Feed', 'Fish Feed', 'Pig Feed'],
        feedType: ['Poultry Feed', 'Fish Feed', 'Pig Feed', 'Goat Feed', 'Sheep Feed', 'Cattle Feed', 'Dog Feed', 'Rabbit Feed', 'Others'],
        formulationType: ['Pellets', 'Mash', 'Crumbles'],
        brand: ['Topfeeds', 'Vital Feed', 'Blue Crown', 'Custom Mix', 'Others'],
        unit: ['kg', 'bags', 'Cup', 'Derica', 'Paint bucket', 'Pieces'],
      };
    }

    if (categoryStr.includes('Fertilizers')) {
      return {
        ...baseDropdowns,
        agricultureType: ['Organic Fertilizer', 'NPK Fertilizer', 'Urea', 'DAP', 'Compost'],
        unit: ['Bag', 'Kg', 'Ton'],
      };
    }

    if (categoryStr.includes('Farm Tools & Equipment')) {
      return {
        ...baseDropdowns,
        agricultureType: ['Hand Tools', 'Power Tools', 'Irrigation Equipment', 'Harvesting Tools'],
        unit: ['Piece', 'Set'],
      };
    }

    if (categoryStr.includes('Agro Chemicals')) {
      return {
        ...baseDropdowns,
        agricultureType: ['Pesticides', 'Herbicides', 'Fungicides', 'Insecticides'],
        unit: ['Litre', 'Kg', 'Bottle'],
      };
    }

    if (categoryStr.includes('Farm Services')) {
      return {
        ...baseDropdowns,
        agricultureType: ['Plowing', 'Irrigation', 'Consultancy', 'Harvesting', 'Transportation'],
        serviceMode: ['On-site', 'Remote', 'Both'],
        experienceLevel: ['Beginner', 'Intermediate', 'Expert'],
      };
    }

    return baseDropdowns;
  };

  const dropdownData = getDropdownData();

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
        
        const agricultureResponse = await apiClient.get(`/api/agriculture/draft/${draftCarAdId}`);
        const agricultureAd = agricultureResponse.data.agricultureAd;

        const transformedBulkPrices = (agricultureAd.bulkPrice || []).map((bp: any) => ({
          quantity: bp.quantity || '',
          unit: bp.unit || '',
          amountPerUnit: bp.amountPerUnit?.toString() || ''
        }));

         setFormData({
        title: agricultureAd.title || '',
        agricultureType: agricultureAd.agricultureType || '',
        condition: agricultureAd.condition || '',
        unit: agricultureAd.unit || '',
        bulkPrices: transformedBulkPrices,  
        feedType: agricultureAd.feedType || '',
        brand: agricultureAd.brand || '',
        negotiation: agricultureAd.negotiation || '',
        formulationType: agricultureAd.formulationType || '',
        serviceMode: agricultureAd.serviceMode || '',
        experienceLevel: agricultureAd.experienceLevel || '',
        availability: agricultureAd.availability || '',
        amount: agricultureAd.amount?.toString() || '',
        description: agricultureAd.description || '',
      });

      // Set Business if available 
      if (agricultureAd.businessCategory) {
        setSelectedBusiness({
          _id: agricultureAd.businessCategory._id || agricultureAd.businessCategory,
          businessName: agricultureAd.businessCategory.businessName || 'Selected Business'
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
      if (!apiClient) return;
      const response = await apiClient.get('/api/profile');
      if (response?.data) {
        setWalletBalance(response.data.walletBalance || 0);

        const paidPlans = response.data.paidPlans || [];
        const successfulPlans = paidPlans.filter((p: any) => p.status === 'success');

        if (successfulPlans.length > 0) {
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
    setFormData({ ...formData, [field]: value });
  };

  const openDropdown = (field: string, title: string) => {
    setActiveDropdown(field);
    setDropdownTitle(title);
    setDropdownOptions(dropdownData[field] || []);
  };

  // Bulk Price handlers 
  const handleAddBulkPrice = (bulkPrice: BulkPrice) => {
    if (editingBulkIndex !== null) {
      const updated = [...formData.bulkPrices];
      updated[editingBulkIndex] = bulkPrice;
      setFormData({ ...formData, bulkPrices: updated });
      setEditingBulkIndex(null);
    } else {
      setFormData({
        ...formData,
        bulkPrices: [...formData.bulkPrices, bulkPrice]
      });
    };
   setShowBulkModal(false);
  };

  const handleEditBulkPrice = (index: number) => {
    setEditingBulkIndex(index);
    setShowBulkModal(true);
  };

  const handleDeleteBulkPrice = (index: number) => {
     const updated = formData.bulkPrices.filter((_, i) => i !== index);
    setFormData({ ...formData, bulkPrices: updated });
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
        title: formData.title,
        agricultureType: formData.agricultureType,
        condition: formData.condition,
        unit: formData.unit,
        bulkPrice: formData.bulkPrices.map(bp => ({
          quantity: bp.quantity,
          unit: bp.unit,
          amountPerUnit: parseFloat(bp.amountPerUnit)
        })),
        feedType: formData.feedType,
        brand: formData.brand,
        negotiation: formData.negotiation,
        formulationType: formData.formulationType,
        serviceMode: formData.serviceMode,
        experienceLevel: formData.experienceLevel,
        availability: formData.availability,
        amount: parseFloat(formData.amount),
        description: formData.description,
        businessCategory: selectedBusiness?._id,
        plan: plan,
        useWalletBalance: useWallet,
        carAdId: carAdId || undefined
      };

      console.log('📤 Submitting agriculture ad:', payload);

      const response = await apiClient.post('/api/agriculture/create-agriculture-ad', payload);

      console.log('✅ Response:', response.data);

      if (response.data.data.paymentStatus === 'success') {
        showSuccessToast('Agriculture ad posted successfully!');
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

    if (!formData.title || !formData.feedType || !formData.amount) {
      showErrorToast('Please fill all required fields (Title, Type, Amount)');
      return;
    }

    if (userHasPaidPlan) {
      console.log('User has existing plan:', userHighestPlan);
      showSuccessToast('Using your existing plan...');
      setTimeout(() => router.push('/protected/myads'), 1500);
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

        const verifyResponse = await apiClient.get(`/api/agriculture/verify-payment/${reference}`);

        if (verifyResponse?.status === 200 || verifyResponse?.data?.message?.includes('success')) {
          clearInterval(pollInterval);
          showSuccessToast('Payment verified! Agriculture ad posted successfully!');
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
         title: formData.title,
        agricultureType: formData.agricultureType,
        condition: formData.condition,
        unit: formData.unit,
        bulkPrice: formData.bulkPrices.map(bp => ({
          quantity: bp.quantity,
          unit: bp.unit,
          amountPerUnit: parseFloat(bp.amountPerUnit)
        })),
        feedType: formData.feedType,
        brand: formData.brand,
        negotiation: formData.negotiation,
        formulationType: formData.formulationType,
        serviceMode: formData.serviceMode,
        experienceLevel: formData.experienceLevel,
        availability: formData.availability,
        amount: parseFloat(formData.amount),
        description: formData.description,
        businessCategory: selectedBusiness._id,
        carAdId: carAdId || null,
        plan: userHighestPlan || selectedPlan || "free",
        isDraft: true 
      };

      console.log("💾 Draft payload:", payload);

      const response = await apiClient.post("/api/agriculture/save-draft", payload);

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
      {/* <Text style={styles.headerTitle}>Post Animal feed Ad</Text> */}
      <Text style={styles.headerTitle}>
        {isDraftMode ? 'Complete Animal Feed Ad' : 'Post Animal feed Ad'}
      </Text>
    </View>
    </View>

    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 100 : 80,
      }}
      keyboardShouldPersistTaps="handled"
    >
     {/* TItle */}
     <View style={styles.row}>
      <PostAdInput
        label="Title"
        placeholder="E.g Hybrid Maize seeds"
        value={formData.title}
        onChangeText={(value) => updateField('title', value)}
      />
     </View>

     {/* Type */}
     {dropdownData.feedType && (
      <View style={styles.row}>
      <PostAdDropdown
         label="Feed Type"
         value={formData.feedType}
         onPress={() => openDropdown('feedType', 'Select Type')}
      /> 
     </View>
     )}


     {/* Unit */}
     {dropdownData.unit && (
      <View style={styles.row}>
      <PostAdDropdown
        label="Unit"
        value={formData.unit}
        onPress={() => openDropdown('unit', 'Select Unit')}
      />
     </View>
     )}

     {/* Brand */}
     {dropdownData.brand && (
      <View style={styles.row}>
        <PostAdDropdown
         label="Brand"
         value={formData.brand}
         onPress={() => openDropdown('brand', 'Select Brand')}
        />
      </View>
     )}

     {/* Amount */}
     <View style={styles.row}>
      <PostAdInput
       label="Amount"
       value={formData.amount}
       placeholder="Enter amount"
       onChangeText={(value) => updateField('amount', value)}
       keyboardType='numeric'
      />
     </View>

     {/* Add Bulk Price Button */}
     <TouchableOpacity
       style={styles.addBulkButton}
       onPress={() => {
        setEditingBulkIndex(null);
        setShowBulkModal(true);
       }}
     >
      <AntDesign name="plus-circle" size={18} color={colors.blue} />
      <Text style={styles.addBulkText}>Add bulk Price </Text>
     </TouchableOpacity>

     {/* Display Bulk Price */}
     {formData.bulkPrices.length > 0 && (
      <View style={styles.bulkPricesList}>
        {formData.bulkPrices.map((bp, index) => (
          <View key={index} style={styles.bulkPriceItem}>
            <View style={styles.bulkPriceInfo}>
              <Text style={styles.bulkPriceLabel}>
                {bp.quantity} {bp.unit}
              </Text>
               <Text style={styles.bulkPriceAmount}>₦{bp.amountPerUnit}</Text>
            </View>
            <View style={styles.bulkPriceActions}>
              <TouchableOpacity
               onPress={() => handleEditBulkPrice(index)}
               style={styles.bulkActionButton}
              >
                 <AntDesign name="edit" size={18} color={colors.blue} />
              </TouchableOpacity>
              <TouchableOpacity
               onPress={() => handleDeleteBulkPrice(index)}
               style={styles.bulkActionButton}
              >
                 <AntDesign name="delete" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
           </View>
        ))}
      </View>
     )}

     {/* Negotiation */}
     <View style={styles.row}>
      <PostAdDropdown
        label="Are you opened for negotiation"
        value={formData.negotiation}
        onPress={() => openDropdown('negotiation', 'Select Option')}
      />
     </View>

     {/* Business Category */}
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

      {/* Description */}
        <PostAdTextArea
          label="Description"
          placeholder="Enter Description"
          value={formData.description}
          onChangeText={(value) => updateField('description', value)}
        />

        {/* Action Buttons */}
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
              ) : (
                <Text style={styles.postButtonText}>Post Ad</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>

          <Text style={styles.termsText}>
          By posting this ad, you agree to the{' '}
          <Text style={styles.termsLink}>Terms of Use</Text>, commit to following the Safety Tips,
          and confirm that your ad does not contain any Prohibited items
        </Text>

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

         <BulkPriceModal
          visible={showBulkModal}
          onClose={() => {
            setShowBulkModal(false);
            setEditingBulkIndex(null);
          }}
          onAdd={handleAddBulkPrice}
          existingPrice={editingBulkIndex !== null ? formData.bulkPrices[editingBulkIndex] : null}
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
            showErrorToast('Insufficient funds. Please fund your wallet to continue.');
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray,
    flex: 1,
  },
  row: {
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
  addBulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  addBulkText: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  bulkPricesList: {
    marginTop: 12,
    gap: 8,
  },
  bulkPriceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bulkPriceInfo: {
    flex: 1,
  },
  bulkPriceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
  },
  bulkPriceAmount: {
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 2,
  },
  bulkPriceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkActionButton: {
    padding: 4,
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
  },
  buttonDisabled: {
    opacity: 0.6
  },
  termsText: {
    fontSize: 11,
    color: colors.lightGray,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  termsLink: {
    color: colors.blue,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: colors.bg,
     borderRadius: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  // Bulk Price Modal Styles
  bulkModalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: '80%'
  },
  bulkModalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 20,
    fontSize: 14,
    color: colors.darkGray,
    backgroundColor: colors.bg,
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    maxHeight: 400,
  },
  bulkModalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  addButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: colors.bg,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
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