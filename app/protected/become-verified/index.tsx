import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image, 
  StatusBar
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import apiClient from '@/app/utils/apiClient';
import { useAuth } from '@/app/context/AuthContext';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Type definitions
interface DocumentFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface FormData {
  businessName: string;
  address: string;
  email: string;
  phoneNumber: string;
  validIdType: string;
  certificate: DocumentFile | null;
  validId: DocumentFile | null;
}

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isGoogleUser: boolean;
  image: string | null;
  role: string;
  paidPlans: Array<{
    planType: string;
    status: string;
    reference: string;
    _id: string;
  }>;
  walletBalance: number;
  walletTransactions: Array<{
    amount: number;
    reference: string;
    status: string;
    paymentDate: string;
    _id: string;
    transactionType?: string;
    description?: string;
  }>;
  isVerified: boolean;
  hasSubmittedVerification: boolean;
  createdAt: string;
}

interface VerificationStatus {
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  businessName?: string;
  address?: string;
  email?: string;
  validIdType?: string;
  createdAt?: string;
}

const BecomeVerified: React.FC = () => {
    const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    address: '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    validIdType: 'National Identity Card',
    certificate: null,
    validId: null
  });

  // ID type options
  const idTypes: string[] = [
    'National Identity Card',
    'Driver License', 
    'Passport',
    'Voters Card'
  ];

  // Fetch user profile and verification status
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async (): Promise<void> => {
    try {
     if (!apiClient) {
        showErrorToast("API client is not initialized");
        return;
     }
      setLoading(true);
      const response = await apiClient.get<UserProfile>('/api/profile');
      setUserProfile(response.data);
      
      // Check if user has submitted verification
      try {
        const verifyResponse = await apiClient.get<VerificationStatus>('/api/verification/status');
        setVerificationStatus(verifyResponse.data);
      } catch (error: any) {
        setVerificationStatus(null);
       console.log("Error verification status", error);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      showErrorToast('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | DocumentFile | null): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickDocument = async (type: 'certificate' | 'validId'): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const documentFile: DocumentFile = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size
        };
        handleInputChange(type, documentFile);
        showSuccessToast(`${type === 'certificate' ? 'Certificate' : 'ID'} selected successfully`);
      }
    } catch (error: any) {
      console.error('Document picker error:', error);
      showErrorToast('Failed to select document');
    }
  };

  const pickImage = async (type: 'certificate' | 'validId'): Promise<void> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const imageFile: DocumentFile = {
          uri: asset.uri,
          name: `${type}_${Date.now()}.jpg`,
          type: 'image/jpeg',
        };
        handleInputChange(type, imageFile);
        showSuccessToast(`${type === 'certificate' ? 'Certificate' : 'ID'} selected successfully`);
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      showErrorToast('Failed to select image');
    }
  };

  const showDocumentOptions = (type: 'certificate' | 'validId'): void => {
    Alert.alert(
      'Select Document',
      'Choose how you want to add your document',
      [
        { text: 'Camera/Gallery', onPress: () => pickImage(type) },
        { text: 'Files', onPress: () => pickDocument(type) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const validateStep1 = (): boolean => {
    if (!formData.businessName.trim()) {
      showErrorToast('Business name is required');
      return false;
    }
    if (!formData.address.trim()) {
      showErrorToast('Business address is required');
      return false;
    }
    if (!formData.email.trim()) {
      showErrorToast('Email is required');
      return false;
    }
    if (!formData.certificate) {
      showErrorToast('Business certificate is required');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.validId) {
      showErrorToast('Valid ID is required');
      return false;
    }
    return true;
  };

  const handleNext = (): void => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = (): void => {
    setCurrentStep(1);
  };

  const submitVerification = async (): Promise<void> => {
    if (!validateStep2()) return;

    try {
     if (!apiClient) {
      showErrorToast("API client is not initialized");
      return;
     }

      setLoading(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('businessName', formData.businessName);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('validIdType', formData.validIdType);
      
      // Append certificate file
      if (formData.certificate) {
        formDataToSend.append('certificate', {
          uri: formData.certificate.uri,
          name: formData.certificate.name,
          type: formData.certificate.type,
        } as any);
      }
      
      // Append valid ID file  
      if (formData.validId) {
        formDataToSend.append('validId', {
          uri: formData.validId.uri,
          name: formData.validId.name,
          type: formData.validId.type,
        } as any);
      }

      const response = await apiClient.post('/api/verification/submit-verification', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showSuccessToast('Verification submitted successfully!');
      // Update local userProfile state to trigger pending UI 

      setUserProfile((prev) => prev ? { ...prev, hasSubmittedVerification: true, isVerified: false} : prev);
      //setVerificationStatus({ isVerified: false, status: 'pending' });
      
    } catch (error: any) {
      console.error('Submit verification error:', error);
      const message = error.response?.data?.message || 'Failed to submit verification';
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !verificationStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1031AA" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Verified user state
  if (userProfile?.isVerified) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
           >
             <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
          </TouchableOpacity>
           <Text style={styles.title}>Become a verified user</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={styles.successIcon}>
            <Image 
              source={require('../../../assets/images/verifiedImg.png')}
              style={styles.successImg}
             />
          </View>
          <Text style={styles.congratsText}>
            Congratulations, you are now a verified user of Tenaly
          </Text>
          <TouchableOpacity>
            <LinearGradient
              colors={['#00A8DF', '#1031AA']}
             start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          style={styles.doneButton}>
             <Text style={styles.doneButtonText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Pending verification state
  if (userProfile?.hasSubmittedVerification && !userProfile?.isVerified)  {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />


        <View style={styles.header}>
         <TouchableOpacity
           onPress={() => router.back()}
           style={styles.backButton}
          >
          <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
         </TouchableOpacity>
           <Text style={styles.title}>Become a verified user</Text>
        </View>
        
        <View style={styles.statusContainer}>
           <View style={styles.successIcon}>
             <Image 
               source={require('../../../assets/images/pending-img.png')}
               style={styles.successImg}
             />
           </View>
          <View style={styles.pendingContainer}>
            <Text style={styles.statusLabel}>Verification status:</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          </View>
          <Text style={styles.pendingDescription}>
            Our team is reviewing your information and will get back to you shortly. Thank you for your patience!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  
  // Form state
    return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
    
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.title}>Become a verified user</Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.stepContainer}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
            <Text style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}>Step 1</Text>
          </View>
        </View>
        
        <View style={[styles.progressLine, currentStep >= 2 && styles.progressLineActive]} />
        
        <View style={styles.stepContainer}>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
            <Text style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}>Step 2</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.formContainer} 
        showsVerticalScrollIndicator={false}
        >
        {currentStep === 1 ? (
          // Step 1: Business Details
          <View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Name</Text>
              <TextInput
                style={styles.input}
                value={formData.businessName}
                onChangeText={(value: string) => handleInputChange('businessName', value)}
                placeholder="Enter business name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Address</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(value: string) => handleInputChange('address', value)}
                placeholder="Enter business address"
                placeholderTextColor="#999"
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value: string) => handleInputChange('email', value)}
                placeholder="Enter business email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Phone number</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(value: string) => handleInputChange('phoneNumber', value)}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Upload Business Registration Certificate</Text>
             {formData.certificate ? (
              <TouchableOpacity 
                 style={styles.selectedFileContainer}
                 onPress={() => showDocumentOptions('certificate')}>
                 {formData.certificate.type.startsWith('image/') ? (
               <Image 
                source={{ uri: formData.certificate.uri }} 
                style={styles.previewImage} 
                />
             ) : (
               <View style={styles.filePreview}>
                  <Ionicons name="document-outline" size={40} color="#007AFF" />
                  <Text style={styles.fileName}>{formData.certificate.name}</Text>
              </View>
            )}
          </TouchableOpacity>
          ) : (
         <TouchableOpacity 
           style={styles.uploadButton}
           onPress={() => showDocumentOptions('certificate')}>
            <Image 
              source={require('../../../assets/images/document-upload.png')}
            />
            <Text style={styles.uploadText}>Upload Document</Text>
          </TouchableOpacity>
         )}
       </View>
       <TouchableOpacity  onPress={handleNext}>
        <LinearGradient
           colors={loading ? ['#cccccc', '#999999'] : ['#00A8DF', '#1031AA']}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 0 }}
           style={styles.nextButton}>
             <Text style={styles.nextButtonText}>Next</Text>
        </LinearGradient>
       </TouchableOpacity>
          </View>
     ) : (
     // Step 2: Valid ID
     <View>
    <View style={styles.inputContainer}>
  <Text style={styles.inputLabel}>Valid means of ID</Text>
  <RNPickerSelect
    onValueChange={(value) => handleInputChange('validIdType', value)}
    value={formData.validIdType}
    items={idTypes.map((idType) => ({
      label: idType,
      value: idType,
      color: '#000', 
    }))}
    style={{
      inputIOS: styles.pickerDropdown,
      inputAndroid: styles.pickerDropdown,
      iconContainer: styles.pickerIconContainer,
      placeholder: { color: '#999' },
    }}
    placeholder={{ label: 'Select ID type', value: null, color: '#999' }}
    Icon={() => <Ionicons name="chevron-down" size={20} color="#666" />}
  />
</View>
<View style={styles.inputContainer}>
  <Text style={styles.inputLabel}>Upload valid means of ID</Text>
  {!formData.validId ? (
    <TouchableOpacity
      style={styles.uploadButton}
      onPress={() => showDocumentOptions('validId')}
    >
     <Image 
       source={require('../../../assets/images/document-upload.png')}
     />
      <Text style={styles.uploadText}>Upload Document</Text>
    </TouchableOpacity>
  ) : (
    <View style={styles.selectedFileContainer}>
      {formData.validId.type.startsWith('image/') ? (
        <Image
          source={{ uri: formData.validId.uri }}
          style={styles.previewImage}
        />
      ) : (
        <View style={styles.filePreview}>
          <Ionicons name="document-outline" size={40} color="#007AFF" />
          <Text style={styles.fileName}>{formData.validId.name}</Text>
        </View>
      )}
    </View>
  )}
</View>
     <View style={styles.buttonContainer}> 
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={submitVerification}
         disabled={loading}>
        <LinearGradient
           colors={loading ? ['#cccccc', '#999999'] : ['#00A8DF', '#1031AA']}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 0 }}
           style={styles.submitButton}>
           {loading ? (
            <ActivityIndicator size="small" color="#fff" />
            ) : (
             <Text style={styles.submitButtonText}>Submit</Text>
           )}
        </LinearGradient>
        </TouchableOpacity>
        </View>
        </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.lightGray,
    fontWeight:'500'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    shadowColor: colors.blurGrey,
     paddingTop: 30,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.1,
    elevation: 6,
  },
   backButton: {
    marginRight: 15,
  },
   backIcon: {
    fontSize: 24,
    color: colors.grey300
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    textAlign: 'center',
    fontFamily: 'WorkSans_500Medium'
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 54.94,
    height: 28,
    borderRadius: 40,
    backgroundColor: colors.greyBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: colors.blue,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.blue,
    fontFamily: 'WorkSans_500Medium'
  },
  stepTextActive: {
    color: colors.blueGrey,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.greyBlue,
    marginHorizontal: 1,
  },
  progressLineActive: {
    backgroundColor: colors.blue,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkGray,
    marginBottom: 8,
    fontFamily: 'WorkSans_600SemiBold'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 17,
    fontSize: 16,
    color: colors.black,
  },
  selectedFileContainer: {
   borderWidth: 1,
   borderColor: colors.prikyBlue,
   borderRadius: 8,
   padding: 15,
   alignItems: 'center',
   backgroundColor: colors.blueGrey
  },
  previewImage: {
  width: 200,
  height: 150,
  borderRadius: 8,
  resizeMode: 'cover',
},
filePreview: {
  alignItems: 'center',
  padding: 20,
},
  uploadButton: {
    borderWidth: 1,
    borderColor: colors.prikyBlue,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueGrey,
  },
  uploadText: {
    fontSize: 16,
    color: colors.blue,
    marginTop: 8,
    fontWeight: '500',
  },
  fileName: {
    marginTop: 8,
    fontSize: 14,
    color: colors.lightGrey,
    fontStyle: 'italic',
  },
  idOptionsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  idOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.blueRomance,
  },
  idOptionSelected: {
    backgroundColor: colors.lightShallow
  },
  idOptionText: {
    fontSize: 16,
    color: colors.dark,
  },
  idOptionTextSelected: {
    color: colors.darkBlue,
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  nextButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  pickerDropdown: {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 4,
   paddingHorizontal: 15,
    paddingVertical: 17,
  fontSize: 16,
  color: colors.black, 
  marginTop: 8,
},
pickerIconContainer: {
  top: 18,
  right: 15,
  position: 'absolute',
},
  backButton1: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.lightGrey,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
     width: '100%',
  paddingVertical: 18,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 10,
  },
  submitButtonDisabled: {
    //opacity: 0.6,
  },
  submitButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pendingContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '500',
    marginBottom: 10,
    fontFamily: 'WorkSans_500Medium'
  },
  pendingBadge: {
    backgroundColor: colors.yellow600,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
  },
  pendingText: {
    color: colors.whiteShade,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  pendingDescription: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'WorkSans_500Medium',
    lineHeight: 24,
  },
  successIcon: {
    marginBottom: 10,
  },
  successImg: {
    width: 63.33,
    height: 66.67,
  },
  congratsText: {
    fontSize: 20,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    lineHeight: 26,
  },
  doneButton: {
    paddingHorizontal: 100,
    paddingVertical: 18,
    borderRadius: 8,
  },
  doneButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'WorksSans_500Medium'
  },
});

export default BecomeVerified;