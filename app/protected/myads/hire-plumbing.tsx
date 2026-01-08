import React, { useState, useEffect } from 'react';
import { 
 View,
 Text,
 StyleSheet,
 ScrollView,
 ActivityIndicator,
 Platform,
 StatusBar,
 Modal,
 TouchableOpacity
} from 'react-native';
import {Ionicons, AntDesign } from '@expo/vector-icons';
import apiClient from '@/app/utils/apiClient';
import  { useLocalSearchParams, useRouter } from 'expo-router';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';
import * as Linking from 'expo-linking';
import * as DocumentPicker from 'expo-document-picker';
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


export default function PostHirePlumbingForm() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { category, carAdId } = params;

    const [selectedBusiness, setSelectectBusiness] = useState<Business | null>(null);
    const [businessModalVisible, setBusinessModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [isDraftMode, setIsDraftMode] = useState(false);

    // Dropdown modal state 
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [dropdownTitle, setDropdownTitle] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);

    // Resume state 
    const [uploadedResume, setUploadedResume] = useState<{
       name: string;
       size: number;
       uri: string;
       type: string;
    } | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Boost & Payment modals 
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [paymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [userHasPaidPlan, setUserHasPaidPlan] = useState(false);
    const [userHighestPlan, setUserHighestPlan] = useState<string | null>(null);


    // form fields 
    const [formData, setFormData] = useState({
      hireTitle: '',
      hireGender: '',
      jobType: '',
      experienceLevel: '',
      workMode: '',
      yearsOfExperience: '',
      relationshipStatus: '',
      portfolioLink: '',
      otherLinks: '',
      skills: '',
      resume: '',
      pricingType: '',
      salaryRange: '',
      negotiation: '',
      description: '',
    });
 
    const getDropdownData = () => {
        const categoryStr = typeof category === 'string' ? category : '';

        const baseDropdowns: Record<string, string[]> = { 
            negotiation: ["Yes", "No"],
            jobType: ['Full-Time', 'Part-Time', 'Contract', 'Internship'],
            experienceLevel: ['Beginner', 'Intermediate', 'Expert', 'Certified Professional'],
            hireGender: ["All gender", "Female", "Male"],
            relationshipStatus: ["Single", "Married", "Divorced"],
            pricingType: ["Per Hour", "Per Session", "Per Week", "Per Day", "Per Project", "Per Month"],
            workMode: ["Remote", "Hybrid", "On-Site"]
        };

        if (categoryStr.includes('Hire Plumbing')) {
           return {
            ...baseDropdowns
           };
        }
     
      return baseDropdowns;
    };

    const dropdownData = getDropdownData();


    useEffect(() => {
      fetchUserProfile();
    }, []);

  useEffect(() => {
            const fetchDraftData  = async () => {
            const draftMode = params.isDraft === 'true';
            const draftCarAdId = params.carAdId;
                        
            if (!draftMode || !draftCarAdId) {
                 return;
            };
                        
                                setIsDraftMode(true);
                                setIsLoadingDraft(true);
                        
                                try {
                                  if (!apiClient) return;
                        
                                  // Fetch Hire draft 
                                  const hireResponse = await apiClient.get(`/api/hire/draft/${draftCarAdId}`);
                                  const hireAd = hireResponse.data.hireAd;
                        
                                  // Pre-fill form data 
                                  setFormData({
                                    hireTitle: hireAd.hireTitle || '',
                                    hireGender: hireAd.hireGender || '',
                                    jobType: hireAd.jobType || '',
                                    experienceLevel: hireAd.experienceLevel || '',
                                    workMode: hireAd.workMode || '',
                                    yearsOfExperience: hireAd.yearsOfExperience || '',
                                    relationshipStatus: hireAd.relationshipStatus || '',
                                    portfolioLink: hireAd.portfolioLink || '',
                                    otherLinks: hireAd.otherLinks || '',
                                    skills: hireAd.skills || '',
                                    resume: hireAd.resume || '',
                                    pricingType: hireAd.pricingType || '',
                                    salaryRange: hireAd.salaryRange || '',
                                    negotiation: hireAd.negotiation || '',
                                    description: hireAd.description || '',
                                  });
                        
                                  // Set business if available 
                                  if (hireAd.businessCategory) {
                                    setSelectectBusiness({
                                      _id: hireAd.businessCategory._id || hireAd.businessCategory,
                                      businessName: hireAd.businessCategory.businessName || 'Selected Business'
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

        const pickDocument = async () => {
           try {
            const result = await DocumentPicker.getDocumentAsync({
               type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
               copyToCacheDirectory: true,
            });

            if (result.assets && result.assets[0]) {
              const file = result.assets[0];
              setUploadedResume({
                name: file.name,
                size: file.size || 0,
                uri: file.uri,
                type: file.mimeType || 'application/pdf',
              });

              // Simulate upload progress for UI 
              simulateUploadProgress();
            }
           } catch (error) {
             console.error('Error picking document:', error);
             showErrorToast('Failed to pick document');
           }
        };

        const simulateUploadProgress = () => {
          setIsUploading(true);
          setUploadProgress(0);

          const interval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                return 100;
              }
              return prev + 10;
            });
          }, 200);
        };

        const removeResume = () => {
          setUploadedResume(null);
          setUploadProgress(0);
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

         // FormData for file upload 
        const submitFormData = new FormData();
         submitFormData.append('hireTitle', formData.hireTitle);
    submitFormData.append('hireGender', formData.hireGender);
    submitFormData.append('jobType', formData.jobType);
    submitFormData.append('experienceLevel', formData.experienceLevel);
    submitFormData.append('workMode', formData.workMode);
    submitFormData.append('yearsOfExperience', formData.yearsOfExperience);
    submitFormData.append('relationshipStatus', formData.relationshipStatus);
    submitFormData.append('portfolioLink', formData.portfolioLink);
    submitFormData.append('otherLinks', formData.otherLinks);
    submitFormData.append('skills', formData.skills);
    submitFormData.append('pricingType', formData.pricingType);
    submitFormData.append('salaryRange', formData.salaryRange);
    submitFormData.append('negotiation', formData.negotiation);
    submitFormData.append('description', formData.description);
    submitFormData.append('businessCategory', selectedBusiness?._id || '');
    submitFormData.append('plan', plan);
    submitFormData.append('useWalletBalance', useWallet.toString());

    if (carAdId) {
      submitFormData.append('carAdId', carAdId as string);
    }

    // Add resume file if selected 
    if (uploadedResume) {
      submitFormData.append('resume', {
        uri: uploadedResume.uri,
        name: uploadedResume.name,
        type: uploadedResume.type,
      } as any);
    }


         console.log('Submitting Hire ad:', submitFormData);

         const response = await apiClient.post('/api/hire/create-hire-ad', submitFormData, {
           headers: {
            'Content-Type': 'multipart/form-data',
           },
         });

         console.log('✅ Response:', response.data);

         if (response.data.data.paymentStatus === 'success') {
            showSuccessToast('Hire ad posted successfully!');
            setTimeout(() => router.push('/protected/myads'), 1500);
         } else if (response.data.data.paymentUrl) {
            showSuccessToast('Redirecting to payment...');
            await Linking.openURL(response.data.data.paymentUrl);
            startPaymentPolling(response.data.data.reference);
         }
        } catch (error: any) {
            console.error('❌ Submit ad error:', error.response?.data || error);
            const errorMessage = error.response?.data?.error || 
                                 error.response?.data?.message ||
                                 'Failed to post ad';
            showErrorToast(errorMessage);
        } finally {
            setLoading(false);
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

      const verifyResponse = await apiClient.get(`/api/hire/verify-payment/${reference}`);

      if (verifyResponse?.status === 200 || verifyResponse?.data?.message?.includes('success')) {
        clearInterval(pollInterval);
        showSuccessToast('Payment verified! Pet ad posted successfully!');
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

const handleSubmit = async () => {
    if (!selectedBusiness) {
        showErrorToast('Please select a business');
        return;
    }

   if (!formData.hireTitle|| !formData.hireGender || !formData.salaryRange) {
     showErrorToast('Please fill all required fields (hireTitle  jobType, salaryRange)');
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

 const handleSaveAsDraft = async () => {
  if (!selectedBusiness) {
    showErrorToast('Please select a business');
    return;
  }

  try {
    if (!apiClient) {
      showErrorToast("API client not initialized");
      return;
    }
    setSavingDraft(true);

    // Create FormData for file upload
    const draftFormData = new FormData();
    
    // Add all text fields from state
    draftFormData.append('hireTitle', formData.hireTitle);
    draftFormData.append('hireGender', formData.hireGender);
    draftFormData.append('jobType', formData.jobType);
    draftFormData.append('experienceLevel', formData.experienceLevel);
    draftFormData.append('workMode', formData.workMode);
    draftFormData.append('yearsOfExperience', formData.yearsOfExperience);
    draftFormData.append('relationshipStatus', formData.relationshipStatus);
    draftFormData.append('portfolioLink', formData.portfolioLink);
    draftFormData.append('otherLinks', formData.otherLinks);
    draftFormData.append('skills', formData.skills);
    draftFormData.append('pricingType', formData.pricingType);
    draftFormData.append('salaryRange', formData.salaryRange);
    draftFormData.append('negotiation', formData.negotiation);
    draftFormData.append('description', formData.description);
    draftFormData.append('businessCategory', selectedBusiness?._id || '');
    draftFormData.append('plan', userHighestPlan || selectedPlan || 'free');
    draftFormData.append('isDraft', 'true');
    
    if (carAdId) {
      draftFormData.append('carAdId', carAdId as string);
    }

    // Add resume file if selected
    if (uploadedResume) {
      draftFormData.append('resume', {
        uri: uploadedResume.uri,
        name: uploadedResume.name,
        type: uploadedResume.type,
      } as any);
    }

    console.log("💾 Saving draft with FormData...");

    const response = await apiClient.post('/api/hire/save-draft', draftFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response?.data?.data) {
      showSuccessToast('Draft saved successfully!');
      setTimeout(() => router.push('/protected/myads'), 1500);
    } else {
      showErrorToast('Failed to save draft.');
    }
  } catch (error: any) {
    console.error("❌ Draft save error:", error.response?.data || error.message);
    const errMsg = 
      error.response?.data?.error || error.response?.data?.message || "Submit draft ad error:";
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
          {isDraftMode ? 'Complete Post Available for Hire Ad' : 'Post Available for Hire Ad'}
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
       {/* Job  Title */}
       <View style={styles.row}>
          <PostAdInput
            label="Title"
            value={formData.hireTitle}
            placeholder='E.g Driver wanted for Company Fleet'
            onChangeText={(value) => updateField('hireTitle', value)}
          />
       </View>

       {/* Gender */}
       <View style={styles.row}>
         <PostAdDropdown
           label="Gender"
           value={formData.hireGender}
           onPress={() => openDropdown('hireGender', 'Select')}
         />
       </View>

       {/* Job Type */}
       <View style={styles.row}>
         <PostAdDropdown
           label="Job Type"
           value={formData.jobType}
           onPress={() => openDropdown('jobType', 'Select')}
         />
       </View>

       {/* Experience Level */}
       <View style={styles.row}>
        <PostAdDropdown
          label='Experience Level'
          value={formData.experienceLevel}
          onPress={() => openDropdown('experienceLevel', 'Select')}
        />
       </View>

       {/* Prefered Work Mode */}
       <View style={styles.row}>
         <PostAdDropdown
           label="Preferred work mode"
           value={formData.workMode}
           onPress={() => openDropdown('workMode', 'Select')}
         />
       </View>

       {/* Years of Experience */}
       <View style={styles.row}>
          <PostAdInput
            label="Years of Experience"
            value={formData.yearsOfExperience}
            placeholder='Enter'
            onChangeText={(value) => updateField('yearsOfExperience', value)}
          />
       </View>

       {/* Relationship Status */}
       <View style={styles.row}>
         <PostAdDropdown
            label="Relationship Status"
            value={formData.relationshipStatus}
            onPress={() => openDropdown('relationshipStatus', 'Select')}
         />
       </View>

       {/* Portfolio Link */ }
       <View style={styles.row}>
         <PostAdInput
          label="Portfolio link (optional)"
          value={formData.portfolioLink}
          placeholder='Enter'
          onChangeText={(value) => updateField('portfolioLink', value)}
         />
       </View>

       {/* Other Related Links */ }
       <View style={styles.row}>
        <PostAdInput
           label="Other important link (optional)"
           value={formData.otherLinks}
           placeholder='Enter'
           onChangeText={(value) => updateField('otherLinks', value)}
        />
       </View>

       {/* Skills */}
       <View style={styles.row}>
         <PostAdTextArea
           label="Skills"
           value={formData.skills}
           placeholder="e.g Graphic Designer, Sales, Data Entry, Eletrical Repairs, Teaching"
           onChangeText={(value) => updateField('skills', value)}
         />
       </View>

       {/* Resume */}
       <View style={styles.uploadSection}>
         <Text style={styles.label}>Upload necessary documents like CV or Resume</Text>

         {!uploadedResume ? (
          <TouchableOpacity
           style={styles.uploadBox}
           onPress={pickDocument}
           disabled={isUploading}
          >
           <Ionicons name="attach" size={24} color={colors.lightGray} />
           <Text>
            Drag and drop files here or {' '}
            <Text style={styles.uploadLink}>click to upload</Text>
           </Text>
          </TouchableOpacity>
         ): (
          <View style={styles.uploadedFileContainer}>
             {/* File Card */}
             <View style={styles.fileCard}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-text" size={24} color={colors.darkGray} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{uploadedResume.name}</Text>
                  <Text style={styles.fileSize}>
                     {(uploadedResume.size / 1024).toFixed(0)}kb
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={removeResume}>
                <AntDesign name="close" size={20} color={colors.darkGray} />
              </TouchableOpacity>
             </View>

             {/* Progress Bar */}
             {uploadProgress > 0 && (
              <>
                <View style={styles.progressBarContainer}>
                   <View style={[styles.progressBar, { width: `${uploadProgress}%`}]} />
                </View>
                <Text style={styles.progressText}>{uploadProgress}%</Text>
               </>
             )}
          </View>
         )}
       </View>

       {/* Pricing Type */}
       <View style={styles.row}>
        <PostAdDropdown
          label="Pricing Type"
          value={formData.pricingType}
          onPress={() => openDropdown('pricingType', 'Select')}
          
        />
       </View>

       {/* Salary Range */}
       <View style={styles.row}>
         <PostAdInput
           label="Expected Salary Range"
           value={formData.salaryRange}
           placeholder='Enter your amount'
           onChangeText={(value) => updateField('salaryRange', value)}
            keyboardType="numeric" 
         />
       </View>

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
      onPress={() => setBusinessModalVisible(true)}>
      <Text style={selectedBusiness ? styles.dropdownTextFilled : styles.dropdownTextPlaceholder}>
         {selectedBusiness?.businessName || 'Select'}
     </Text>
     <AntDesign name='down' size={16} color={colors.darkGray} />
  </TouchableOpacity>

    {/* Description */}
      <PostAdTextArea 
        label="Description"
        placeholder="Enter description"
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
      ): (
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

     <Text style={styles.termsText}>
       By posting this ad, you agree to the {' '}
      <Text style={styles.termsLink}>Terms of Use</Text>,
        and confirm that your ad does not contain any Prohibited items
     </Text>

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
      visible={paymentModal}
      onClose={() => setShowPaymentModal(false)}
      onSelectWallet={() => handlePaymentMethodSelected(true)}
      onFundWallet={() => {
        setShowPaymentModal(false);
        showErrorToast('Insufficient funds. Please fund your wallet to continue');
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
   backgroundColor: colors.bgTheme
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
   alignItems: 'center'
  },
  headerTitle: {
   fontSize: 16,
   fontWeight: '600',
   fontFamily: 'WorkSans_600SemiBold',
   color: colors.darkGray,
   flex: 1,
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
uploadSection: {
  marginTop: 16,
},
uploadBox: {
  borderWidth: 1.5,
  borderColor: '#1212B8',
  borderStyle: 'dashed',
  borderRadius: 12,
  paddingVertical: 40,
  alignItems: 'center',
  backgroundColor: colors.bgTheme
},
uploadText: {
  fontSize: 14,
  color: colors.lightGray,
  marginTop: 8,
},
uploadLink: {
  color: colors.blue,
  textDecorationLine: 'underline'
},
uploadedFileContainer: {
  marginTop: 8,
},
fileCard: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 backgroundColor: colors.bg,
 borderWidth: 1,
 borderColor: colors.border,
 borderRadius: 8,
 padding: 12,
 marginBottom: 8,
},
fileInfo: {
 flexDirection: 'row',
 alignItems: 'center',
 flex: 1,
},
fileDetails: {
  marginLeft: 12,
  flex: 1,
},
fileName: {
  fontSize: 14,
  fontWeight: '500',
  color: colors.darkGray
},
fileSize: {
 fontSize: 12,
 color: colors.lightGray,
 marginTop: 2,
},
progressBarContainer: {
  height: 4,
  backgroundColor: colors.lightSpot,
  borderRadius: 2,
  overflow: 'hidden',
},
progressBar: {
  height: '100%',
  backgroundColor: colors.blue,
},
progressText: {
  fontSize: 12,
  color: colors.blue,
  textAlign: 'right',
  marginTop: 4,
  fontWeight: '600'
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
